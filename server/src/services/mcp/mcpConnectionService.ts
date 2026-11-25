import { Types } from 'mongoose';

import { MCP_CONFIG } from '../../config/mcp';
import { ApiError } from '../../errors/ApiError';
import { IMcpConnection } from '../../models/McpConnection';
import * as mcpCredentialRepository from '../../repositories/mcpCredentialRepository';
import * as workspaceMemberRepository from '../../repositories/workspaceMemberRepository';
import * as workspaceRepository from '../../repositories/workspaceRepository';
import { isUserMemberOf, resolveWorkspaceForRequest } from '../workspaceService';
import * as mcpAuditService from './mcpAuditService';
import * as mcpTokenService from './mcpTokenService';

export interface GrantableWorkspace {
  id: string;
  name: string;
  type: 'personal' | 'shared';
  isActive: boolean;
}

export interface McpConnectionView {
  id: string;
  name: string;
  kind: IMcpConnection['kind'];
  workspaceId: string;
  workspaceName: string;
  createdAt: Date | undefined;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

export const listGrantableWorkspaces = async (userId: string): Promise<GrantableWorkspace[]> => {
  const memberships = await workspaceMemberRepository.findByUser(userId);
  const workspaces = await workspaceRepository.findManyByIds(
    memberships.map(row => row.workspaceId as unknown as Types.ObjectId)
  );
  const activeWorkspaceId = (await resolveWorkspaceForRequest(userId)).toString();

  return workspaces.map(workspace => ({
    id: workspace._id.toString(),
    name: workspace.name,
    type: workspace.type,
    isActive: workspace._id.toString() === activeWorkspaceId,
  }));
};

export const assertWorkspaceMember = async (userId: string, workspaceId: string) => {
  const workspaceObjectId = mcpTokenService.toObjectId(workspaceId);
  const isMember = await isUserMemberOf(userId, workspaceObjectId);

  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this workspace');
  }

  return workspaceObjectId;
};

export const createOAuthConnection = async (params: {
  userId: string;
  workspaceId: Types.ObjectId;
  clientId: string;
  clientName: string;
  scopes: string[];
}) => {
  await revokeEarlierConnectionsOfClient(params.userId, params.clientId);

  const connection = await mcpCredentialRepository.insertConnection({
    userId: params.userId,
    workspaceId: params.workspaceId,
    kind: 'oauth',
    clientId: params.clientId,
    name: params.clientName,
    scopes: params.scopes,
  });

  await mcpAuditService.recordConnected(connection);

  return connection;
};

// Re-authorizing the same registered client replaces its grant instead of piling up duplicates.
const revokeEarlierConnectionsOfClient = async (userId: string, clientId: string) => {
  const earlier = await mcpCredentialRepository.findActiveOAuthConnectionsForClient(
    userId,
    clientId
  );

  await Promise.all(
    earlier.map(connection => mcpTokenService.revokeConnection(connection, 'reauthorized'))
  );
};

export const createPersonalConnection = async (
  userId: string,
  input: { workspaceId: string; name: string }
) => {
  const workspaceId = await assertWorkspaceMember(userId, input.workspaceId);
  const expiresAt = new Date(Date.now() + MCP_CONFIG.personalTokenTtlMs);

  const connection = await mcpCredentialRepository.insertConnection({
    userId,
    workspaceId,
    kind: 'personal',
    name: input.name,
    scopes: [MCP_CONFIG.readScope],
    expiresAt,
  });

  const token = await mcpTokenService.issuePersonalToken({ ...connection, expiresAt });
  await mcpAuditService.recordConnected(connection);
  const [view] = await toConnectionViews([connection]);

  return { connection: view, token, mcpUrl: MCP_CONFIG.resourceUrl.toString() };
};

export const listConnections = async (userId: string): Promise<McpConnectionView[]> => {
  const connections = await mcpCredentialRepository.findActiveConnectionsForUser(userId);
  const live = connections.filter(c => !c.expiresAt || c.expiresAt > new Date());

  return toConnectionViews(live);
};

export const revokeConnectionForUser = async (userId: string, connectionId: string) => {
  const connection = await mcpCredentialRepository.findActiveConnection(
    mcpTokenService.toObjectId(connectionId)
  );

  if (!connection || connection.userId.toString() !== userId) {
    throw ApiError.notFound('Connection not found');
  }

  await mcpTokenService.revokeConnection(connection, 'user_revoked');
};

const toConnectionViews = async (connections: IMcpConnection[]): Promise<McpConnectionView[]> => {
  const workspaces = await workspaceRepository.findManyByIds(connections.map(c => c.workspaceId));
  const namesById = new Map(workspaces.map(w => [w._id.toString(), w.name]));

  return connections.map(connection => ({
    id: connection._id.toString(),
    name: connection.name,
    kind: connection.kind,
    workspaceId: connection.workspaceId.toString(),
    workspaceName: namesById.get(connection.workspaceId.toString()) ?? '',
    createdAt: connection.createdAt,
    lastUsedAt: connection.lastUsedAt ?? null,
    expiresAt: connection.expiresAt ?? null,
  }));
};
