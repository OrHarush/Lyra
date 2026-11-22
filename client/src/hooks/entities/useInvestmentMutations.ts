import type { CreateInvestmentPurchaseDTO, UpdateInvestmentPurchaseDTO } from '@lyra/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from '@/api/axios';
import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import type { InvestmentPurchaseDto } from '@/types/Investment';

const useInvalidateInvestments = () => {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.investmentSummary() }),
      queryClient.invalidateQueries({ queryKey: [...queryKeys.allInvestments(), 'history'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.investmentPurchases() }),
    ]);
};

export const useCreateInvestmentPurchase = () => {
  const invalidateInvestments = useInvalidateInvestments();

  return useMutation({
    mutationFn: async (input: CreateInvestmentPurchaseDTO) => {
      const response = await axiosInstance.post<{ data: InvestmentPurchaseDto }>(
        API_ROUTES.INVESTMENTS.PURCHASES,
        input
      );

      return response.data.data;
    },
    onSuccess: invalidateInvestments,
  });
};

interface UpdateInvestmentPurchaseInput {
  id: string;
  patch: UpdateInvestmentPurchaseDTO;
}

export const useUpdateInvestmentPurchase = () => {
  const invalidateInvestments = useInvalidateInvestments();

  return useMutation({
    mutationFn: async ({ id, patch }: UpdateInvestmentPurchaseInput) => {
      const response = await axiosInstance.patch<{ data: InvestmentPurchaseDto }>(
        API_ROUTES.INVESTMENTS.PURCHASE_BY_ID(id),
        patch
      );

      return response.data.data;
    },
    onSuccess: invalidateInvestments,
  });
};

export const useDeleteInvestmentPurchase = () => {
  const invalidateInvestments = useInvalidateInvestments();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(API_ROUTES.INVESTMENTS.PURCHASE_BY_ID(id));
    },
    onSuccess: invalidateInvestments,
  });
};
