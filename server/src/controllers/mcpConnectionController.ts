import { Request, Response } from 'express';

import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import {
  ApproveMcpAuthorizationDTO,
  CreatePersonalMcpTokenDTO,
} from '../schemas/mcpConnectionSchemas';
import * as mcpConnectionService from '../services/mcp/mcpConnectionService';
import * as mcpOAuthService from '../services/mcp/mcpOAuthService';

export const getAuthorizationRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await mcpOAuthService.getConsentRequest(String(req.params.requestId), req.userId);

  return ApiResponse.ok(res, request);
});

export const approveAuthorizationRequest = asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req.validatedBody as ApproveMcpAuthorizationDTO;
  const result = await mcpOAuthService.approveRequest(
    String(req.params.requestId),
    req.userId,
    workspaceId
  );

  return ApiResponse.ok(res, result);
});

export const denyAuthorizationRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await mcpOAuthService.denyRequest(String(req.params.requestId));

  return ApiResponse.ok(res, result);
});

export const listConnections = asyncHandler(async (req: Request, res: Response) => {
  const connections = await mcpConnectionService.listConnections(req.userId);

  return ApiResponse.ok(res, connections);
});

export const revokeConnection = asyncHandler(async (req: Request, res: Response) => {
  await mcpConnectionService.revokeConnectionForUser(req.userId, String(req.params.id));

  return ApiResponse.ok(res, { revoked: true });
});

export const createPersonalToken = asyncHandler(async (req: Request, res: Response) => {
  const input = req.validatedBody as CreatePersonalMcpTokenDTO;
  const result = await mcpConnectionService.createPersonalConnection(req.userId, input);

  return ApiResponse.created(res, result);
});
