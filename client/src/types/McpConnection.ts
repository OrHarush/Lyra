import { WorkspaceType } from '@/types/Workspace';

export type McpConnectionKind = 'oauth' | 'personal';

export interface McpConsentWorkspace {
  id: string;
  name: string;
  type: WorkspaceType;
  isActive: boolean;
}

export interface McpConsentRequest {
  requestId: string;
  clientName: string;
  redirectHost: string;
  scopes: string[];
  expiresAt: string;
  workspaces: McpConsentWorkspace[];
}

export interface McpRedirect {
  redirectUrl: string;
}

export interface McpConnection {
  id: string;
  name: string;
  kind: McpConnectionKind;
  workspaceId: string;
  workspaceName: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export interface CreatePersonalTokenInput {
  workspaceId: string;
  name: string;
}

export interface CreatedPersonalToken {
  connection: McpConnection;
  token: string;
  mcpUrl: string;
}
