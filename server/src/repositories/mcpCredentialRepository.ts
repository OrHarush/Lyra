import { Types } from 'mongoose';

import McpConnection, { IMcpConnection } from '../models/McpConnection';
import McpToken, { IMcpToken, McpTokenType } from '../models/McpToken';

export const insertConnection = (
  data: Pick<IMcpConnection, 'kind' | 'clientId' | 'name' | 'scopes' | 'expiresAt'> & {
    userId: string;
    workspaceId: Types.ObjectId;
  }
): Promise<IMcpConnection> =>
  McpConnection.create({ ...data, userId: new Types.ObjectId(data.userId) }).then(
    doc => doc.toObject() as IMcpConnection
  );

export const findActiveConnection = (
  connectionId: Types.ObjectId
): Promise<IMcpConnection | null> =>
  McpConnection.findOne({ _id: connectionId, revokedAt: { $exists: false } })
    .lean<IMcpConnection>()
    .exec();

export const findActiveConnectionsForUser = (userId: string): Promise<IMcpConnection[]> =>
  McpConnection.find({ userId: new Types.ObjectId(userId), revokedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .lean<IMcpConnection[]>()
    .exec();

export const findActiveOAuthConnectionsForClient = (
  userId: string,
  clientId: string
): Promise<IMcpConnection[]> =>
  McpConnection.find({
    userId: new Types.ObjectId(userId),
    clientId,
    kind: 'oauth',
    revokedAt: { $exists: false },
  })
    .lean<IMcpConnection[]>()
    .exec();

export const revokeConnection = (
  connectionId: Types.ObjectId,
  userId?: string
): Promise<IMcpConnection | null> =>
  McpConnection.findOneAndUpdate(
    {
      _id: connectionId,
      revokedAt: { $exists: false },
      ...(userId ? { userId: new Types.ObjectId(userId) } : {}),
    },
    { $set: { revokedAt: new Date() } },
    { new: true }
  )
    .lean<IMcpConnection>()
    .exec();

export const touchConnectionLastUsed = (connectionId: Types.ObjectId, staleBefore: Date) =>
  McpConnection.updateOne(
    {
      _id: connectionId,
      $or: [{ lastUsedAt: { $exists: false } }, { lastUsedAt: { $lt: staleBefore } }],
    },
    { $set: { lastUsedAt: new Date() } }
  ).exec();

export const insertToken = (data: {
  connectionId: Types.ObjectId;
  type: McpTokenType;
  tokenHash: string;
  expiresAt: Date;
}) => McpToken.create(data);

export const findLiveToken = (tokenHash: string, type: McpTokenType): Promise<IMcpToken | null> =>
  McpToken.findOne({ tokenHash, type, expiresAt: { $gt: new Date() } })
    .lean<IMcpToken>()
    .exec();

export const consumeRefreshToken = (tokenHash: string): Promise<IMcpToken | null> =>
  McpToken.findOneAndUpdate(
    {
      tokenHash,
      type: 'refresh',
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    },
    { $set: { consumedAt: new Date() } },
    { new: true }
  )
    .lean<IMcpToken>()
    .exec();

export const findTokenByHash = (tokenHash: string): Promise<IMcpToken | null> =>
  McpToken.findOne({ tokenHash }).lean<IMcpToken>().exec();

export const deleteTokensForConnection = (connectionId: Types.ObjectId) =>
  McpToken.deleteMany({ connectionId }).exec();
