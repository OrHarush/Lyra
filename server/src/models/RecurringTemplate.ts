import {
  BILL_TYPES,
  BillType,
  FIXED_EXPENSE_KINDS,
  FixedExpenseKind,
  RECURRING_FREQUENCIES,
  RecurringFrequency,
  SUBSCRIPTION_PROVIDER_IDS,
  SubscriptionProviderId,
} from '@lyra/shared';
import mongoose, { Schema, Types } from 'mongoose';

export interface IRecurringTemplate {
  _id: string;
  userId: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  startDate: Date;
  endDate?: Date;
  name?: string;
  note?: string;
  type: 'Income' | 'Expense' | 'Transfer';
  amount: number;
  belongToPreviousMonth?: boolean;
  category?: Types.ObjectId;
  paymentMethod?: Types.ObjectId;
  account?: Types.ObjectId;
  fromAccount?: Types.ObjectId;
  toAccount?: Types.ObjectId;
  isActive: boolean;
  lastGeneratedDate?: Date | null;
  // Absent on templates created before fixed expenses existed; read as 'regular'.
  kind?: FixedExpenseKind;
  providerId?: SubscriptionProviderId;
  cancelUrl?: string;
  billType?: BillType;
  cancelledAt?: Date;
}

const RecurringTemplateSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    frequency: { type: String, enum: RECURRING_FREQUENCIES, required: true },
    dayOfMonth: { type: Number, required: true, min: 1, max: 31 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    name: { type: String, maxlength: 50 },
    note: { type: String, maxlength: 200, trim: true },
    type: { type: String, enum: ['Income', 'Expense', 'Transfer'], required: true },
    amount: { type: Number, required: true },
    belongToPreviousMonth: { type: Boolean, default: false },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    paymentMethod: { type: Schema.Types.ObjectId, ref: 'PaymentMethod' },
    account: { type: Schema.Types.ObjectId, ref: 'Account' },
    fromAccount: { type: Schema.Types.ObjectId, ref: 'Account' },
    toAccount: { type: Schema.Types.ObjectId, ref: 'Account' },
    isActive: { type: Boolean, default: true },
    lastGeneratedDate: { type: Date, default: null },
    kind: { type: String, enum: FIXED_EXPENSE_KINDS },
    providerId: { type: String, enum: SUBSCRIPTION_PROVIDER_IDS },
    cancelUrl: { type: String, maxlength: 500, trim: true },
    billType: { type: String, enum: BILL_TYPES },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

RecurringTemplateSchema.index({ userId: 1, isActive: 1 });
RecurringTemplateSchema.index({ userId: 1, startDate: 1, endDate: 1 });
RecurringTemplateSchema.index({ workspaceId: 1, isActive: 1 });

export default mongoose.model<IRecurringTemplate>(
  'RecurringTemplate',
  RecurringTemplateSchema,
  'recurringTemplates',
);
