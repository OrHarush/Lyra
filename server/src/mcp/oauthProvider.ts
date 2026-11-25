import {
  InvalidClientMetadataError,
  InvalidGrantError,
  InvalidRequestError,
  InvalidTokenError,
  OAuthError,
  ServerError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { OAuthServerProvider } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { OAuthClientInformationFull } from '@modelcontextprotocol/sdk/shared/auth.js';

import { ApiError } from '../errors/ApiError';
import * as mcpOAuthService from '../services/mcp/mcpOAuthService';
import * as mcpTokenService from '../services/mcp/mcpTokenService';

type OAuthErrorClass = new (message: string) => Error;

// Services speak ApiError; the SDK's handlers only turn OAuthError subclasses into RFC 6749 bodies.
const translateErrors =
  <Args extends unknown[], Result>(
    toOAuthError: OAuthErrorClass,
    run: (...args: Args) => Promise<Result>
  ) =>
  async (...args: Args): Promise<Result> => {
    try {
      return await run(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new toOAuthError(error.message);
      }

      throw error instanceof OAuthError ? error : new ServerError('Internal Server Error');
    }
  };

const asClientInfo = (client: mcpOAuthService.RegisteredClient) =>
  client as unknown as OAuthClientInformationFull;

const toAuthInfo = (token: string, auth: mcpTokenService.McpAuthContext): AuthInfo => ({
  token,
  clientId: auth.clientId,
  scopes: auth.scopes,
  expiresAt: auth.expiresAt,
  extra: {
    userId: auth.userId,
    workspaceId: auth.workspaceId,
    connectionId: auth.connectionId,
  },
});

export const lyraOAuthProvider: OAuthServerProvider = {
  clientsStore: {
    getClient: async clientId => {
      const client = await mcpOAuthService.findClient(clientId);

      return client ? asClientInfo(client) : undefined;
    },
    registerClient: translateErrors(InvalidClientMetadataError, async metadata =>
      asClientInfo(await mcpOAuthService.registerClient(metadata as mcpOAuthService.ClientMetadata))
    ),
  },

  authorize: async (client, params, res) => {
    const consentUrl = await translateErrors(
      InvalidRequestError,
      mcpOAuthService.startAuthorization
    )({
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      state: params.state,
      scopes: params.scopes,
      resource: params.resource,
    });

    res.redirect(302, consentUrl);
  },

  challengeForAuthorizationCode: translateErrors(
    InvalidGrantError,
    (client: OAuthClientInformationFull, code: string) =>
      mcpOAuthService.getCodeChallenge(client.client_id, code)
  ),

  exchangeAuthorizationCode: translateErrors(
    InvalidGrantError,
    (
      client: OAuthClientInformationFull,
      code: string,
      _codeVerifier?: string,
      redirectUri?: string,
      resource?: URL
    ) =>
      mcpOAuthService.exchangeCode({
        client: client as unknown as mcpOAuthService.RegisteredClient,
        code,
        redirectUri,
        resource,
      })
  ),

  exchangeRefreshToken: translateErrors(
    InvalidGrantError,
    async (
      client: OAuthClientInformationFull,
      refreshToken: string,
      _scopes?: string[],
      resource?: URL
    ) => {
      mcpOAuthService.assertResourceIsMcp(resource);

      return mcpTokenService.rotateRefreshToken(refreshToken, client.client_id);
    }
  ),

  verifyAccessToken: translateErrors(InvalidTokenError, async (token: string) =>
    toAuthInfo(token, await mcpTokenService.verifyAccessToken(token))
  ),

  revokeToken: async (client, request) => {
    await mcpTokenService.revokeByToken(request.token, client.client_id);
  },
};
