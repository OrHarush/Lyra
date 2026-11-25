import crypto from 'crypto';

import { MCP_CONFIG } from '../../config/mcp';
import { ApiError } from '../../errors/ApiError';
import { IMcpAuthorizationRequest } from '../../models/McpAuthorizationRequest';
import * as mcpOAuthRepository from '../../repositories/mcpOAuthRepository';
import * as mcpConnectionService from './mcpConnectionService';
import * as mcpTokenService from './mcpTokenService';

const UNKNOWN_CLIENT_NAME = 'Unknown app';
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export interface ClientMetadata {
  client_name?: string;
  redirect_uris: string[];
  [key: string]: unknown;
}

export interface RegisteredClient extends ClientMetadata {
  client_id: string;
}

export interface AuthorizationStart {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state?: string;
  scopes?: string[];
  resource?: URL;
}

export interface ConsentRequestView {
  requestId: string;
  clientName: string;
  redirectHost: string;
  scopes: string[];
  expiresAt: Date;
  workspaces: mcpConnectionService.GrantableWorkspace[];
}

export const isAllowedRedirectUri = (uri: string) => {
  const url = new URL(uri);

  return (
    url.protocol === 'https:' || (url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname))
  );
};

export const registerClient = async (metadata: ClientMetadata): Promise<RegisteredClient> => {
  if (!metadata.redirect_uris.every(isAllowedRedirectUri)) {
    throw ApiError.badRequest('redirect_uris must be https or loopback http');
  }

  const client: RegisteredClient = { ...metadata, client_id: crypto.randomUUID() };
  await mcpOAuthRepository.insertClient(client.client_id, client);

  return client;
};

export const findClient = async (clientId: string): Promise<RegisteredClient | undefined> => {
  const stored = await mcpOAuthRepository.findClient(clientId);

  return stored ? (stored.clientInfo as RegisteredClient) : undefined;
};

export const assertResourceIsMcp = (resource?: URL) => {
  if (resource && resource.href !== MCP_CONFIG.resourceUrl.href) {
    throw ApiError.badRequest('Unknown resource');
  }
};

export const startAuthorization = async (start: AuthorizationStart): Promise<string> => {
  assertResourceIsMcp(start.resource);
  const requestId = crypto.randomUUID();

  await mcpOAuthRepository.insertAuthorizationRequest({
    requestId,
    clientId: start.clientId,
    redirectUri: start.redirectUri,
    codeChallenge: start.codeChallenge,
    state: start.state,
    scopes: [MCP_CONFIG.readScope],
    resource: start.resource?.href,
    expiresAt: new Date(Date.now() + MCP_CONFIG.authorizationRequestTtlMs),
  });

  return `${MCP_CONFIG.consentPageUrl}?request=${encodeURIComponent(requestId)}`;
};

const findPendingRequestOrThrow = async (requestId: string) => {
  const request = await mcpOAuthRepository.findPendingRequest(requestId);

  if (!request) {
    throw ApiError.notFound('Authorization request not found or expired');
  }

  return request;
};

const clientNameOf = (client?: RegisteredClient) =>
  client?.client_name?.trim().slice(0, 50) || UNKNOWN_CLIENT_NAME;

export const getConsentRequest = async (
  requestId: string,
  userId: string
): Promise<ConsentRequestView> => {
  const request = await findPendingRequestOrThrow(requestId);
  const client = await findClient(request.clientId);

  return {
    requestId: request.requestId,
    clientName: clientNameOf(client),
    redirectHost: new URL(request.redirectUri).host,
    scopes: request.scopes,
    expiresAt: request.expiresAt,
    workspaces: await mcpConnectionService.listGrantableWorkspaces(userId),
  };
};

const buildRedirect = (request: IMcpAuthorizationRequest, params: Record<string, string>) => {
  const url = new URL(request.redirectUri);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  if (request.state) {
    url.searchParams.set('state', request.state);
  }

  return url.toString();
};

// The code is bound to the session user who clicked Allow — never to anything in the URL.
export const approveRequest = async (requestId: string, userId: string, workspaceId: string) => {
  const workspaceObjectId = await mcpConnectionService.assertWorkspaceMember(userId, workspaceId);
  const code = mcpTokenService.generateSecret();

  const approved = await mcpOAuthRepository.approvePendingRequest(requestId, {
    userId,
    workspaceId: workspaceObjectId,
    codeHash: mcpTokenService.hashSecret(code),
    codeExpiresAt: new Date(Date.now() + MCP_CONFIG.authorizationCodeTtlMs),
  });

  if (!approved) {
    throw ApiError.notFound('Authorization request not found or expired');
  }

  return { redirectUrl: buildRedirect(approved, { code }) };
};

export const denyRequest = async (requestId: string) => {
  const denied = await mcpOAuthRepository.denyPendingRequest(requestId);

  if (!denied) {
    throw ApiError.notFound('Authorization request not found or expired');
  }

  return { redirectUrl: buildRedirect(denied, { error: 'access_denied' }) };
};

export const getCodeChallenge = async (clientId: string, code: string) => {
  const request = await mcpOAuthRepository.findApprovedByCodeHash(mcpTokenService.hashSecret(code));

  if (!request || request.clientId !== clientId) {
    throw ApiError.unauthorized('Invalid authorization code');
  }

  return request.codeChallenge;
};

export const exchangeCode = async (params: {
  client: RegisteredClient;
  code: string;
  redirectUri?: string;
  resource?: URL;
}) => {
  const request = await mcpOAuthRepository.consumeApprovedCode(
    mcpTokenService.hashSecret(params.code)
  );
  const redirectMismatch = !!params.redirectUri && params.redirectUri !== request?.redirectUri;

  if (
    !request ||
    request.clientId !== params.client.client_id ||
    redirectMismatch ||
    !request.userId ||
    !request.workspaceId
  ) {
    throw ApiError.unauthorized('Invalid authorization code');
  }

  assertResourceIsMcp(params.resource);

  const connection = await mcpConnectionService.createOAuthConnection({
    userId: request.userId.toString(),
    workspaceId: request.workspaceId,
    clientId: params.client.client_id,
    clientName: clientNameOf(params.client),
    scopes: request.scopes,
  });

  return mcpTokenService.issueOAuthTokens(connection);
};
