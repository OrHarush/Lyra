import { CreateBudgetBulkDTO, CreateBudgetDTO, UpdateBudgetDTO } from '@lyra/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosInstance from '@/api/axios';
import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { BudgetDto } from '@/types/Budget';

type UpdateBudgetInput = UpdateBudgetDTO & { budgetId: string };
type DeleteBudgetInput = { budgetId: string; year: number };

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBudgetDTO) => {
      const response = await axiosInstance.post<{ success: boolean; data: BudgetDto }>(
        API_ROUTES.BUDGETS,
        input
      );

      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allCategoryTrends() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets(variables.year, variables.month),
      });
    },
  });
};

export const useCreateBudgetBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBudgetBulkDTO) => {
      const response = await axiosInstance.post<{ success: boolean; data: BudgetDto[] }>(
        `${API_ROUTES.BUDGETS}/bulk`,
        input
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allCategoryTrends() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets(variables.year),
      });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ budgetId, limit }: UpdateBudgetInput) => {
      const response = await axiosInstance.put<{ success: boolean; data: BudgetDto }>(
        `${API_ROUTES.BUDGETS}/${budgetId}`,
        { limit }
      );

      return response.data.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allCategoryTrends() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets(data.year) });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ budgetId }: DeleteBudgetInput) => {
      await axiosInstance.delete(`${API_ROUTES.BUDGETS}/${budgetId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allCategoryTrends() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets(variables.year) });
    },
  });
};
