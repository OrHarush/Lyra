import { zodResolver } from '@hookform/resolvers/zod';
import { CreateGoalDTO, CreateGoalSchema } from '@lyra/shared';
import axios from 'axios';
import type { Resolver } from 'react-hook-form';

export const goalFormResolver = zodResolver(CreateGoalSchema) as unknown as Resolver<CreateGoalDTO>;

export const extractApiErrorCode = (err: unknown): string => {
  if (!axios.isAxiosError(err)) {
    return '';
  }

  return err.response?.data?.error ?? '';
};
