import { z } from 'zod';

export const ApproveMcpAuthorizationSchema = z.object({
  workspaceId: z.string().min(1),
});

export const CreatePersonalMcpTokenSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().trim().min(1).max(50),
});

export type ApproveMcpAuthorizationDTO = z.infer<typeof ApproveMcpAuthorizationSchema>;
export type CreatePersonalMcpTokenDTO = z.infer<typeof CreatePersonalMcpTokenSchema>;
