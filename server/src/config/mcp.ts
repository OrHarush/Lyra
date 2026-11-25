const MCP_PUBLIC_URL = process.env.MCP_PUBLIC_URL ?? 'http://localhost:5000';

export const MCP_CONFIG = {
  issuerUrl: new URL(MCP_PUBLIC_URL),
  resourceUrl: new URL('/mcp', MCP_PUBLIC_URL),
  consentPageUrl: `${process.env.APP_URL ?? 'http://localhost:3000'}/oauth/consent`,
  serverName: 'lyra',
  readScope: 'mcp:read',
  authorizationRequestTtlMs: 10 * 60 * 1000,
  authorizationCodeTtlMs: 60 * 1000,
  accessTokenTtlMs: 60 * 60 * 1000,
  refreshTokenTtlMs: 30 * 24 * 60 * 60 * 1000,
  personalTokenTtlMs: 90 * 24 * 60 * 60 * 1000,
  lastUsedWriteIntervalMs: 60 * 1000,
} as const;
