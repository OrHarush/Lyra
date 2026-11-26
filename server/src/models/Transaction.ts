import { RECURRING_FREQUENCIES, RecurringFrequency } from '@lyra/shared';
import mongoose, { Schema, Types } from 'mongoose';

export type TransactionSource = 'manual' | 'csv' | 'google_pay' | 'apple_pay';

export const AUTOMATION_SOURCES: TransactionSource[] = ['google_pay', 'apple_pay'];

export interface ITransaction {
  _id: string;
  name?: string;
  note?: string;
  type: 'Income' | 'Expense' | 'Transfer';
  amount: number;
  date?: Date;
  frequency?: RecurringFrequency;
  belongToPreviousMonth?: boolean;
  category?: Types.ObjectId;
  paymentMethod?: Types.ObjectId;
  account?: Types.ObjectId;
  fromAccount?: Types.ObjectId;
  toAccount?: Types.ObjectId;
  userId: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  templateId?: Types.ObjectId;
  importBatchId?: Types.ObjectId;
  importFingerprint?: string;
  source: TransactionSource;
  reviewedAt?: Date | null;
  sourceMerchant?: string | null;
}

const TransactionSchema: Schema = new Schema(
  {
    name: { type: String, maxlength: 50 },
    note: { type: String, maxlength: 200, trim: true },
    type: {
      type: String,
      enum: ['Income', 'Expense', 'Transfer'],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date },
    frequency: { type: String, enum: RECURRING_FREQUENCIES },
    belongToPreviousMonth: { type: Boolean, default: false },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    paymentMethod: { type: Schema.Types.ObjectId, ref: 'PaymentMethod' },
    account: { type: Schema.Types.ObjectId, ref: 'Account' },
    fromAccount: { type: Schema.Types.ObjectId, ref: 'Account' },
    toAccount: { type: Schema.Types.ObjectId, ref: 'Account' },

    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    templateId: { type: Schema.Types.ObjectId, ref: 'RecurringTemplate' },
    importBatchId: { type: Schema.Types.ObjectId },
    importFingerprint: { type: String },

    source: {
      type: String,
      enum: ['manual', 'csv', 'google_pay', 'apple_pay'],
      default: 'manual',
    },
    reviewedAt: { type: Date },
    sourceMerchant: { type: String, default: null },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1, date: -1 });
TransactionSchema.index({ userId: 1, account: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ templateId: 1, date: -1 });
TransactionSchema.index(
  { userId: 1, importFingerprint: 1 },
  { partialFilterExpression: { importFingerprint: { $exists: true } } }
);
TransactionSchema.index(
  { userId: 1, importBatchId: 1 },
  { partialFilterExpression: { importBatchId: { $exists: true } } }
);
TransactionSchema.index({ workspaceId: 1, date: -1 });
TransactionSchema.index({ workspaceId: 1, category: 1, date: -1 });
TransactionSchema.index({ workspaceId: 1, account: 1, date: -1 });
TransactionSchema.index({ workspaceId: 1, type: 1, date: -1 });
TransactionSchema.index(
  { workspaceId: 1, importFingerprint: 1 },
  { partialFilterExpression: { importFingerprint: { $exists: true } } }
);
TransactionSchema.index({ userId: 1, source: 1, reviewedAt: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
