import { Types } from 'mongoose';

import McpAuthorizationRequest, {
  IMcpAuthorizationRequest,
} from '../models/McpAuthorizationRequest';
import McpOAuthClient, { IMcpOAuthClient } from '../models/McpOAuthClient';

export const insertClient = (clientId: string, clientInfo: Record<string, unknown>) =>
  McpOAuthClient.create({ clientId, clientInfo });

export const findClient = (clientId: string): Promise<IMcpOAuthClient | null> =>
  McpOAuthClient.findOne({ clientId }).lean<IMcpOAuthClient>().exec();

export const insertAuthorizationRequest = (
  data: Pick<
    IMcpAuthorizationRequest,
    | 'requestId'
    | 'clientId'
    | 'redirectUri'
    | 'codeChallenge'
    | 'state'
    | 'scopes'
    | 'resource'
    | 'expiresAt'
  >
) => McpAuthorizationRequest.create({ ...data, status: 'pending' });

export const findPendingRequest = (requestId: string): Promise<IMcpAuthorizationRequest | null> =>
  McpAuthorizationRequest.findOne({ requestId, status: 'pending', expiresAt: { $gt: new Date() } })
    .lean<IMcpAuthorizationRequest>()
    .exec();

export const approvePendingRequest = (
  requestId: string,
  approval: { userId: string; workspaceId: Types.ObjectId; codeHash: string; codeExpiresAt: Date }
): Promise<IMcpAuthorizationRequest | null> =>
  McpAuthorizationRequest.findOneAndUpdate(
    { requestId, status: 'pending', expiresAt: { $gt: new Date() } },
    {
      $set: {
        status: 'approved',
        userId: new Types.ObjectId(approval.userId),
        workspaceId: approval.workspaceId,
        codeHash: approval.codeHash,
        codeExpiresAt: approval.codeExpiresAt,
      },
    },
    { new: true }
  )
    .lean<IMcpAuthorizationRequest>()
    .exec();

export const denyPendingRequest = (requestId: string): Promise<IMcpAuthorizationRequest | null> =>
  McpAuthorizationRequest.findOneAndUpdate(
    { requestId, status: 'pending' },
    { $set: { status: 'denied' } },
    { new: true }
  )
    .lean<IMcpAuthorizationRequest>()
    .exec();

export const findApprovedByCodeHash = (
  codeHash: string
): Promise<IMcpAuthorizationRequest | null> =>
  McpAuthorizationRequest.findOne({
    codeHash,
    status: 'approved',
    codeExpiresAt: { $gt: new Date() },
  })
    .lean<IMcpAuthorizationRequest>()
    .exec();

export const consumeApprovedCode = (codeHash: string): Promise<IMcpAuthorizationRequest | null> =>
  McpAuthorizationRequest.findOneAndUpdate(
    { codeHash, status: 'approved', codeExpiresAt: { $gt: new Date() } },
    { $set: { status: 'used' } },
    { new: true }
  )
    .lean<IMcpAuthorizationRequest>()
    .exec();
