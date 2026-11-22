import mongoose, { Schema, Types } from 'mongoose';

export const ANALYTICS_EVENT_TYPES = [
  'transaction_created',
  'transaction_updated',
  'transaction_deleted',
  'recurring_created',
  'category_created',
  'csv_imported',
  'onboarding_completed',
  'accepted_terms',
  'goal_created',
  'budget_created',
  'account_created',
  'payment_method_created',
  'share_clicked',
  'user_created',
  'user_deleted',
  'data_exported',
  'pwa_installed',
  'workspace_created',
  'invitation_sent',
  'invitation_accepted',
  'investment_purchase_created',
  'investment_purchase_deleted',
  'investments_page_viewed',
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export interface IAnalyticsEvent {
  _id: string;
  event: AnalyticsEventType;
  userName: string;
  userAvatar: string;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    event: {
      type: String,
      enum: ANALYTICS_EVENT_TYPES,
      required: true,
    },
    userName: {
      type: String,
      default: '',
    },
    userAvatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'analytics_events',
  }
);

AnalyticsEventSchema.index({ event: 1, createdAt: -1 });
AnalyticsEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 } // 365 days — matches privacy policy §6
);

export default mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
