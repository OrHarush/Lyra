import { Types } from 'mongoose';

import { McpAuditEventType } from '../../models/McpAuditEvent';
import { IMcpConnection } from '../../models/McpConnection';
import * as mcpAuditEventRepository from '../../repositories/mcpAuditEventRepository';

const MAX_DETAIL_LENGTH = 100;

const record = (type: McpAuditEventType, connection: IMcpConnection, detail?: string) =>
  mcpAuditEventRepository.insert({
    type,
    userId: connection.userId,
    connectionId: connection._id,
    clientId: connection.clientId,
    detail: detail?.slice(0, MAX_DETAIL_LENGTH),
  });

export const recordConnected = (connection: IMcpConnection) =>
  record('MCP_CONNECTED', connection, connection.kind);

export const recordRevoked = (connection: IMcpConnection, reason: string) =>
  record('MCP_REVOKED', connection, reason);

export const recordRefreshReuse = (connection: IMcpConnection) =>
  record('MCP_REFRESH_REUSE_DETECTED', connection);

export const recordTokenUsed = (
  auth: { userId: string; connectionId: string; clientId: string },
  detail: string
) =>
  mcpAuditEventRepository.insert({
    type: 'MCP_TOKEN_USED',
    userId: new Types.ObjectId(auth.userId),
    connectionId: new Types.ObjectId(auth.connectionId),
    clientId: auth.clientId,
    detail: detail.slice(0, MAX_DETAIL_LENGTH),
  });
