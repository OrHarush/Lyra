import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import {
  approveMcpConsentRequest,
  createMcpPersonalToken,
  denyMcpConsentRequest,
  getMcpConsentRequest,
  listMcpConnections,
  revokeMcpConnection,
} from '@/api/mcpConnections';
import { queryKeys } from '@/constants/queryKeys';
import { useAuth } from '@/providers/AuthProvider';

export const isMcpRequestGone = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

export const useMcpConsentRequest = (requestId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.mcpConsentRequest(requestId ?? ''),
    queryFn: () => getMcpConsentRequest(requestId ?? ''),
    enabled: !!user && !!requestId,
    retry: (failureCount, error) => !isMcpRequestGone(error) && failureCount < 2,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

interface ApproveMcpConsentInput {
  requestId: string;
  workspaceId: string;
}

export const useApproveMcpConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, workspaceId }: ApproveMcpConsentInput) =>
      approveMcpConsentRequest(requestId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mcpConnections() });
    },
  });
};

export const useDenyMcpConsent = () =>
  useMutation({
    mutationFn: (requestId: string) => denyMcpConsentRequest(requestId),
  });

export const useMcpConnections = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.mcpConnections(),
    queryFn: listMcpConnections,
    enabled: !!user,
  });
};

export const useRevokeMcpConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => revokeMcpConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mcpConnections() });
    },
  });
};

export const useCreateMcpPersonalToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMcpPersonalToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mcpConnections() });
    },
  });
};
