import { ClientSession, Types } from 'mongoose';

import NotificationIngestion, { IngestionRecordOutcome } from './NotificationIngestion.model';

export interface IngestionClaim {
  userId: string;
  eventKey: string;
  packageName: string;
  appVersion: string;
  postedAt: Date;
}

export interface IngestionResultRecord {
  outcome: Exclude<IngestionRecordOutcome, 'processing'>;
  transactionId: string | null;
  rawText: string | null;
}

export type ClaimResult = 'claimed' | 'duplicate';

export const claim = async (data: IngestionClaim): Promise<ClaimResult> => {
  const inserted = await insertIgnoringDuplicate(data);

  return inserted ? 'claimed' : 'duplicate';
};

export const recordResult = (userId: string, eventKey: string, result: IngestionResultRecord) =>
  NotificationIngestion.updateOne(
    { userId: new Types.ObjectId(userId), eventKey },
    {
      $set: {
        outcome: result.outcome,
        transactionId: result.transactionId ? new Types.ObjectId(result.transactionId) : null,
        rawText: result.rawText,
      },
    }
  ).exec();

export const releaseClaim = (userId: string, eventKey: string) =>
  NotificationIngestion.deleteOne({
    userId: new Types.ObjectId(userId),
    eventKey,
    outcome: 'processing',
  }).exec();

export const deleteAllByUser = (userId: string, session?: ClientSession) =>
  NotificationIngestion.deleteMany({ userId: new Types.ObjectId(userId) }, { session }).exec();

const insertIgnoringDuplicate = async (data: IngestionClaim): Promise<boolean> => {
  try {
    await NotificationIngestion.create({
      ...data,
      userId: new Types.ObjectId(data.userId),
      outcome: 'processing',
    });

    return true;
  } catch (err: unknown) {
    if (isDuplicateKeyError(err)) {
      return false;
    }

    throw err;
  }
};

const MONGO_DUPLICATE_KEY = 11000;

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  (err as { code?: unknown }).code === MONGO_DUPLICATE_KEY;
