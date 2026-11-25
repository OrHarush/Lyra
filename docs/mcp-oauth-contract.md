# MCP OAuth — API contract (web app ↔ server)

All `/api/*` routes below use the normal web session (`authMiddleware`, Bearer web JWT) and the
standard `ApiResponse` envelope `{ success, data }`.

## Consent (OAuth authorize → web app)

The server's `/authorize` redirects the browser to:

`${APP_URL}/oauth/consent?request=<requestId>`

### GET /api/mcp/oauth/requests/:requestId
```ts
{
  requestId: string;
  clientName: string;        // from dynamic client registration, may be "Unknown app"
  redirectHost: string;      // e.g. "claude.ai" — show it so the user sees where they're sent
  scopes: string[];          // ["mcp:read"]
  expiresAt: string;         // ISO
  workspaces: Array<{ id: string; name: string; type: 'personal' | 'shared'; isActive: boolean }>;
}
```
404 when expired/unknown/already used.

### POST /api/mcp/oauth/requests/:requestId/approve
Body `{ workspaceId: string }` → `{ redirectUrl: string }`. Client does `window.location.assign(redirectUrl)`.

### POST /api/mcp/oauth/requests/:requestId/deny
No body → `{ redirectUrl: string }` (carries `error=access_denied`). Client navigates to it.

## Connected apps (Settings)

### GET /api/mcp/connections
```ts
Array<{
  id: string;
  name: string;              // client name, or the user's label for personal tokens
  kind: 'oauth' | 'personal';
  workspaceId: string;
  workspaceName: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;  // personal tokens only
}>
```
Only active (non-revoked) connections.

### DELETE /api/mcp/connections/:id
→ `{ revoked: true }`. Effective immediately.

### POST /api/mcp/connections/personal
Body `{ workspaceId: string; name: string }` (name 1–50 chars) →
`{ connection: <same shape as list item>, token: string, mcpUrl: string }`.
The token is shown once and never retrievable again.
