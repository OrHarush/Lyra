import { z } from 'zod';

import { objectIdSchema } from './common';

export const IngestNotificationSchema = z.object({
  eventKey: z.string().trim().min(16).max(128),
  packageName: z.string().trim().min(1).max(200),
  title: z.string().max(500),
  text: z.string().max(2000),
  bigText: z.string().max(4000).optional(),
  postedAt: z.string().datetime({ offset: true }),
  appVersion: z.string().trim().min(1).max(50),
});

export type IngestNotificationDTO = z.infer<typeof IngestNotificationSchema>;

export const NOTIFICATION_INGESTION_OUTCOMES = [
  'created',
  'duplicate',
  'ignored',
  'parse_failed',
] as const;

export type NotificationIngestionOutcome = (typeof NOTIFICATION_INGESTION_OUTCOMES)[number];

export interface IngestNotificationResult {
  outcome: NotificationIngestionOutcome;
  transactionId: string | null;
  needsCategory: boolean;
}

export const SetPendingCategorySchema = z.object({
  categoryId: objectIdSchema,
  applyToFuture: z.boolean().default(true),
});

export type SetPendingCategoryDTO = z.infer<typeof SetPendingCategorySchema>;

export interface SetPendingCategoryResult {
  changed: boolean;
}
