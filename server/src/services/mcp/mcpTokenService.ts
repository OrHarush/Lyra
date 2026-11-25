import crypto from 'crypto';
import { Types } from 'mongoose';

import { MCP_CONFIG } from '../../config/mcp';
import { ApiError } from '../../errors/ApiError';
import { IMcpConnection } from '../../models/McpConnection';
import User from '../../models/User';
import * as mcpCredentialRepository from '../../repositories/mcpCredentialRepository';
import { isUserMemberOf } from '../workspaceService';
import * as mcpAuditService from './mcpAuditService';

const TOKEN_PREFIX = {
  access: 'lyra_mcp_',
  refresh: 'lyra_mcpr_',
  personal: 'lyra_pat_',
} as const;

export interface McpAuthContext {
  userId: string;
  workspaceId: string;
  connectionId: string;
  clientId: string;
  scopes: string[];
  expiresAt: number;
}

export interface McpTokenSet {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export const hashSecret = (secret: string) =>
  crypto.createHash('sha256').update(secret).digest('hex');

export const generateSecret = (prefix = '') =>
  `${prefix}${crypto.randomBytes(32).toString('base64url')}`;

const storeToken = async (
  connection: IMcpConnection,
  type: 'access' | 'refresh',
  prefix: string,
  expiresAt: Date
) => {
  const token = generateSecret(prefix);

  await mcpCredentialRepository.insertToken({
    connectionId: connection._id,
    type,
    tokenHash: hashSecret(token),
    expiresAt,
  });

  return token;
};

export const issueOAuthTokens = async (connection: IMcpConnection): Promise<McpTokenSet> => {
  const now = Date.now();
  const accessToken = await storeToken(
    connection,
    'access',
    TOKEN_PREFIX.access,
    new Date(now + MCP_CONFIG.accessTokenTtlMs)
  );
  const refreshToken = await storeToken(
    connection,
    'refresh',
    TOKEN_PREFIX.refresh,
    new Date(now + MCP_CONFIG.refreshTokenTtlMs)
  );

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: Math.floor(MCP_CONFIG.accessTokenTtlMs / 1000),
    refresh_token: refreshToken,
    scope: connection.scopes.join(' '),
  };
};

export const issuePersonalToken = (connection: IMcpConnection & { expiresAt: Date }) =>
  storeToken(connection, 'access', TOKEN_PREFIX.personal, connection.expiresAt);

export const revokeConnection = async (connection: IMcpConnection, reason: string) => {
  const revoked = await mcpCredentialRepository.revokeConnection(connection._id);
  await mcpCredentialRepository.deleteTokensForConnection(connection._id);

  if (revoked) {
    await mcpAuditService.recordRevoked(revoked, reason);
  }
};

// A consumed refresh token presented again means it leaked: kill the whole connection.
const revokeOnRefreshReuse = async (tokenHash: string) => {
  const replayed = await mcpCredentialRepository.findTokenByHash(tokenHash);

  if (!replayed?.consumedAt) {
    return;
  }

  const connection = await mcpCredentialRepository.findActiveConnection(replayed.connectionId);

  if (connection) {
    await mcpAuditService.recordRefreshReuse(connection);
    await revokeConnection(connection, 'refresh_token_reuse');
  }
};

export const rotateRefreshToken = async (
  refreshToken: string,
  clientId: string
): Promise<McpTokenSet> => {
  const tokenHash = hashSecret(refreshToken);
  const consumed = await mcpCredentialRepository.consumeRefreshToken(tokenHash);

  if (!consumed) {
    await revokeOnRefreshReuse(tokenHash);
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const connection = await mcpCredentialRepository.findActiveConnection(consumed.connectionId);

  if (!connection || connection.clientId !== clientId) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  await assertConnectionStillAllowed(connection);

  return issueOAuthTokens(connection);
};

const assertConnectionStillAllowed = async (connection: IMcpConnection) => {
  const userExists = await User.exists({ _id: connection.userId });

  if (!userExists) {
    throw ApiError.unauthorized('User no longer exists');
  }

  const isMember = await isUserMemberOf(connection.userId.toString(), connection.workspaceId);

  if (!isMember) {
    throw ApiError.unauthorized('User is no longer a member of the connected workspace');
  }
};

export const verifyAccessToken = async (token: string): Promise<McpAuthContext> => {
  const stored = await mcpCredentialRepository.findLiveToken(hashSecret(token), 'access');

  if (!stored) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const connection = await mcpCredentialRepository.findActiveConnection(stored.connectionId);

  if (!connection) {
    throw ApiError.unauthorized('Connection has been revoked');
  }

  await assertConnectionStillAllowed(connection);
  await mcpCredentialRepository.touchConnectionLastUsed(
    connection._id,
    new Date(Date.now() - MCP_CONFIG.lastUsedWriteIntervalMs)
  );

  return {
    userId: connection.userId.toString(),
    workspaceId: connection.workspaceId.toString(),
    connectionId: connection._id.toString(),
    clientId: connection.clientId ?? `personal:${connection._id.toString()}`,
    scopes: connection.scopes,
    expiresAt: Math.floor(stored.expiresAt.getTime() / 1000),
  };
};

export const revokeByToken = async (token: string, clientId: string) => {
  const stored = await mcpCredentialRepository.findTokenByHash(hashSecret(token));

  if (!stored) {
    return;
  }

  const connection = await mcpCredentialRepository.findActiveConnection(stored.connectionId);

  if (connection?.clientId === clientId) {
    await revokeConnection(connection, 'client_revocation');
  }
};

export const toObjectId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid id');
  }

  return new Types.ObjectId(id);
};
