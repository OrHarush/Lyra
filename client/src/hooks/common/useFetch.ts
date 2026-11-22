import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

import api from '@/api/axios';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  error?: string;
  pagination?: PaginationMeta;
}

interface UseFetchProps<TData, TError = AxiosError> {
  url: string;
  queryKey: unknown[];
  onSuccess?: (data: TData, pagination?: PaginationMeta) => void;
  onError?: (error: TError) => void;
  enabled?: boolean;
  refetchInterval?: number | false;
  staleTime?: number;
}

export const useFetch = <TData, TError = AxiosError>({
  url,
  queryKey,
  onSuccess,
  onError,
  enabled = true,
  refetchInterval,
  staleTime,
}: UseFetchProps<TData, TError>) => {
  const query = useQuery<ApiResponse<TData>, TError>({
    queryKey,
    queryFn: async () => {
      const { data: apiResponse } = await api.get<ApiResponse<TData>>(url);

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Request failed');
      }

      return apiResponse;
    },
    enabled,
    refetchInterval,
    staleTime,
  });

  const pagination = query.data?.pagination;
  const resultData = query.data?.data;

  useEffect(() => {
    if (query.isSuccess && resultData && onSuccess) {
      onSuccess(resultData, pagination);
    }
  }, [query.isSuccess, resultData, pagination, onSuccess]);

  useEffect(() => {
    if (query.isError && query.error && onError) {
      onError(query.error);
    }
  }, [query.isError, query.error, onError]);

  return {
    ...query,
    data: resultData,
    pagination,
  };
};
