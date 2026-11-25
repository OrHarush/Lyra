import api from '@/api/axios';
import { API_ROUTES } from '@/constants/Routes';
import { ApiResponse } from '@/hooks/common/useFetch';
import {
  CreatedPersonalToken,
  CreatePersonalTokenInput,
  McpConnection,
  McpConsentRequest,
  McpRedirect,
} from '@/types/McpConnection';

export const getMcpConsentRequest = async (requestId: string): Promise<McpConsentRequest> => {
  const response = await api.get<ApiResponse<McpConsentRequest>>(
    API_ROUTES.MCP.OAUTH_REQUEST(requestId)
  );

  return response.data.data;
};

export const approveMcpConsentRequest = async (
  requestId: string,
  workspaceId: string
): Promise<McpRedirect> => {
  const response = await api.post<ApiResponse<McpRedirect>>(
    API_ROUTES.MCP.OAUTH_APPROVE(requestId),
    { workspaceId }
  );

  return response.data.data;
};

export const denyMcpConsentRequest = async (requestId: string): Promise<McpRedirect> => {
  const response = await api.post<ApiResponse<McpRedirect>>(API_ROUTES.MCP.OAUTH_DENY(requestId));

  return response.data.data;
};

export const listMcpConnections = async (): Promise<McpConnection[]> => {
  const response = await api.get<ApiResponse<McpConnection[]>>(API_ROUTES.MCP.CONNECTIONS);

  return response.data.data;
};

export const revokeMcpConnection = async (connectionId: string): Promise<void> => {
  await api.delete(API_ROUTES.MCP.CONNECTION_BY_ID(connectionId));
};

export const createMcpPersonalToken = async (
  input: CreatePersonalTokenInput
): Promise<CreatedPersonalToken> => {
  const response = await api.post<ApiResponse<CreatedPersonalToken>>(
    API_ROUTES.MCP.PERSONAL_TOKEN,
    input
  );

  return response.data.data;
};
