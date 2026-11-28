import mongoose, { Schema, Types } from 'mongoose';

export const INGESTION_RECORD_OUTCOMES = [
  'processing',
  'created',
  'ignored',
  'parse_failed',
] as const;

export type IngestionRecordOutcome = (typeof INGESTION_RECORD_OUTCOMES)[number];

export interface INotificationIngestion {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  eventKey: string;
  packageName: string;
  appVersion: string;
  postedAt: Date;
  outcome: IngestionRecordOutcome;
  transactionId?: Types.ObjectId | null;
  rawText?: string | null;
  createdAt: Date;
}

// Class: ANALYTICS (product behavior: what the Android companion sent and how it was handled,
// used for dedupe and "why is this payment missing" debugging, not a security-relevant
// "who did what"). Hence the 365-day TTL on createdAt below, per the privacy policy.
const NotificationIngestionSchema = new Schema<INotificationIngestion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventKey: { type: String, required: true },
    packageName: { type: String, required: true },
    appVersion: { type: String, required: true },
    postedAt: { type: Date, required: true },
    outcome: { type: String, enum: INGESTION_RECORD_OUTCOMES, required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', default: null },
    // Only kept for parse failures, so the parser can be fixed against the real text.
    rawText: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'notification_ingestions',
  }
);

NotificationIngestionSchema.index({ userId: 1, eventKey: 1 }, { unique: true });
NotificationIngestionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 } // 365 days — matches privacy policy §6
);

export default mongoose.model<INotificationIngestion>(
  'NotificationIngestion',
  NotificationIngestionSchema
);
