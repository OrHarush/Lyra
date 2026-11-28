import { IngestNotificationDTO, IngestNotificationResult } from '@lyra/shared';

import { IngestionPlan, planIngestion, WALLET_PACKAGE_NAME } from './ingestionPlan';
import { lyraTransactions } from './lyraAdapters';
import * as ingestionRepository from './notificationIngestionRepository';
import { parseWalletNotification } from './walletNotificationParser';

const IGNORED_PLAN: IngestionPlan = { outcome: 'ignored', transaction: null, rawText: null };

export const ingestNotification = async (
  userId: string,
  notification: IngestNotificationDTO
): Promise<IngestNotificationResult> => {
  const claim = await ingestionRepository.claim({
    userId,
    eventKey: notification.eventKey,
    packageName: notification.packageName,
    appVersion: notification.appVersion,
    postedAt: new Date(notification.postedAt),
  });

  if (claim === 'duplicate') {
    return { outcome: 'duplicate', transactionId: null, needsCategory: false };
  }

  return releaseClaimOnFailure(userId, notification.eventKey, () =>
    processClaimed(userId, notification)
  );
};

const processClaimed = async (
  userId: string,
  notification: IngestNotificationDTO
): Promise<IngestNotificationResult> => {
  const plan = buildPlan(notification);
  const created = plan.transaction
    ? await lyraTransactions.createAutomationTransaction({
        ...plan.transaction,
        userId,
        date: notification.postedAt,
      })
    : null;

  await ingestionRepository.recordResult(userId, notification.eventKey, {
    outcome: plan.outcome,
    transactionId: created?.transactionId ?? null,
    rawText: plan.rawText,
  });

  return {
    outcome: plan.outcome,
    transactionId: created?.transactionId ?? null,
    needsCategory: created !== null && created.categoryId === null,
  };
};

const buildPlan = (notification: IngestNotificationDTO): IngestionPlan => {
  if (notification.packageName !== WALLET_PACKAGE_NAME) {
    return IGNORED_PLAN;
  }

  return planIngestion(parseWalletNotification(notification), notification);
};

// A claim left behind by a crash would turn the app's retry into a "duplicate" and lose the payment.
const releaseClaimOnFailure = async <T>(
  userId: string,
  eventKey: string,
  work: () => Promise<T>
): Promise<T> => {
  try {
    return await work();
  } catch (err: unknown) {
    await ingestionRepository.releaseClaim(userId, eventKey);
    throw err;
  }
};
