import mongoose, { Schema, Types } from 'mongoose';

export type UnitsSource = 'derived' | 'manual';
export type InstrumentSource = 'catalog' | 'yahoo';
export type PurchaseCurrency = 'ILS' | 'USD';

export interface IInvestmentPurchase {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  source: InstrumentSource;
  instrumentId: string;
  yahooSymbol: string;
  displayName: string;
  badge: string;
  currency: PurchaseCurrency;
  date: string;
  priceDate: string;
  amount: number;
  priceAtPurchase: number;
  units: number;
  unitsSource: UnitsSource;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentPurchase {
  id: string;
  userId: string;
  source: InstrumentSource;
  instrumentId: string;
  yahooSymbol: string;
  displayName: string;
  badge: string;
  currency: PurchaseCurrency;
  date: string;
  priceDate: string;
  amount: number;
  priceAtPurchase: number;
  units: number;
  unitsSource: UnitsSource;
  note?: string;
}

const IsoDate = { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ };

// displayName and badge are snapshots so old purchases still render if a catalog entry is renamed.
const InvestmentPurchaseSchema = new Schema<IInvestmentPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, enum: ['catalog', 'yahoo'], required: true },
    instrumentId: { type: String, required: true, trim: true },
    yahooSymbol: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    badge: { type: String, required: true, trim: true },
    currency: { type: String, enum: ['ILS', 'USD'], required: true },
    date: IsoDate,
    priceDate: IsoDate,
    amount: { type: Number, required: true, validate: (value: number) => value > 0 },
    priceAtPurchase: { type: Number, required: true, validate: (value: number) => value > 0 },
    units: { type: Number, required: true, validate: (value: number) => value > 0 },
    unitsSource: { type: String, enum: ['derived', 'manual'], required: true },
    note: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);

InvestmentPurchaseSchema.index({ userId: 1, date: -1 });
InvestmentPurchaseSchema.index({ userId: 1, yahooSymbol: 1 });

export default mongoose.model<IInvestmentPurchase>(
  'InvestmentPurchase',
  InvestmentPurchaseSchema,
  'investment_purchases'
);
