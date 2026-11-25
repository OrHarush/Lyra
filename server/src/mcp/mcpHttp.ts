import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import {
  getOAuthProtectedResourceMetadataUrl,
  mcpAuthRouter,
} from '@modelcontextprotocol/sdk/server/auth/router.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import crypto from 'crypto';
import express, { NextFunction, Request, Response, Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { MCP_CONFIG } from '../config/mcp';
import * as mcpAuditService from '../services/mcp/mcpAuditService';
import { createMcpServer } from './mcpServer';
import { lyraOAuthProvider } from './oauthProvider';
import { runReadOnly } from './readOnlyGuard';

interface McpAuthExtra {
  userId: string;
  workspaceId: string;
  connectionId: string;
}

interface JsonRpcMessage {
  method?: string;
  params?: { name?: string };
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

// Claude and other hosted clients call from shared egress IPs, so per-IP limits would throttle
// every user of that client together. Key by the bearer token when present.
const tokenOrIpKey = (req: Request) => {
  const authHeader = req.headers.authorization;

  return authHeader
    ? crypto.createHash('sha256').update(authHeader).digest('hex')
    : ipKeyGenerator(req.ip ?? '');
};

const mcpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: tokenOrIpKey,
  message: { error: 'rate_limited', error_description: 'Too many MCP requests' },
});

const oauthEndpointRateLimit = { windowMs: FIFTEEN_MINUTES_MS, limit: 300 };

const authRouter = mcpAuthRouter({
  provider: lyraOAuthProvider,
  issuerUrl: MCP_CONFIG.issuerUrl,
  resourceServerUrl: MCP_CONFIG.resourceUrl,
  scopesSupported: [MCP_CONFIG.readScope],
  resourceName: 'Lyra',
  authorizationOptions: { rateLimit: oauthEndpointRateLimit },
  tokenOptions: { rateLimit: oauthEndpointRateLimit },
  revocationOptions: { rateLimit: oauthEndpointRateLimit },
  clientRegistrationOptions: { rateLimit: { windowMs: FIFTEEN_MINUTES_MS, limit: 60 } },
});

const bearerAuth = requireBearerAuth({
  verifier: lyraOAuthProvider,
  requiredScopes: [MCP_CONFIG.readScope],
  resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(MCP_CONFIG.resourceUrl),
});

const authExtraOf = (req: Request) => req.auth?.extra as unknown as McpAuthExtra;

const describeRpcCall = (message: JsonRpcMessage) =>
  [message.method, message.params?.name].filter(Boolean).join(':');

const auditToolUse = (req: Request, _res: Response, next: NextFunction) => {
  const messages: JsonRpcMessage[] = Array.isArray(req.body) ? req.body : [req.body ?? {}];
  const toolCalls = messages.filter(message => message.method === 'tools/call');
  const extra = authExtraOf(req);
  const clientId = req.auth?.clientId ?? '';

  toolCalls.forEach(message => {
    mcpAuditService
      .recordTokenUsed({ ...extra, clientId }, describeRpcCall(message))
      .catch(error => console.error('[mcp] failed to record audit event', error));
  });

  next();
};

const handleMcpRequest = async (req: Request, res: Response) => {
  // Kept from the original handler: some MCP clients omit text/event-stream and get a 406 otherwise.
  req.headers['accept'] = 'application/json, text/event-stream';
  const { userId, workspaceId } = authExtraOf(req);
  const server = createMcpServer({ userId, workspaceId });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on('close', () => {
    void transport.close();
    void server.close();
  });

  await runReadOnly(async () => {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });
};

const rejectMethod = (_req: Request, res: Response) => {
  res
    .status(405)
    .set('Allow', 'POST')
    .json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed' },
      id: null,
    });
};

export const mcpRouter = Router();

mcpRouter.use(authRouter);
mcpRouter.post(
  '/mcp',
  express.json({ limit: '200kb' }),
  mcpLimiter,
  bearerAuth,
  auditToolUse,
  handleMcpRequest
);
mcpRouter.get('/mcp', rejectMethod);
mcpRouter.delete('/mcp', rejectMethod);
