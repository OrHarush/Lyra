import { ClientSession, Types } from 'mongoose';

import InvestmentPurchaseModel, {
  IInvestmentPurchase,
  InvestmentPurchase,
} from '../models/InvestmentPurchase';

export type NewInvestmentPurchase = Omit<InvestmentPurchase, 'id'>;
export type InvestmentPurchaseChanges = Partial<Omit<NewInvestmentPurchase, 'userId'>>;

const toPurchase = (doc: IInvestmentPurchase): InvestmentPurchase => ({
  id: doc._id.toString(),
  userId: doc.userId.toString(),
  source: doc.source,
  instrumentId: doc.instrumentId,
  yahooSymbol: doc.yahooSymbol,
  displayName: doc.displayName,
  badge: doc.badge,
  currency: doc.currency,
  date: doc.date,
  priceDate: doc.priceDate,
  amount: doc.amount,
  priceAtPurchase: doc.priceAtPurchase,
  units: doc.units,
  unitsSource: doc.unitsSource,
  ...(doc.note ? { note: doc.note } : {}),
});

const scopedTo = (userId: string, id: string) => ({
  _id: new Types.ObjectId(id),
  userId: new Types.ObjectId(userId),
});

export const insert = async (data: NewInvestmentPurchase) => {
  const created = await InvestmentPurchaseModel.create({
    ...data,
    userId: new Types.ObjectId(data.userId),
  });

  return toPurchase(created.toObject());
};

export const findAllByUser = async (userId: string) => {
  const docs = await InvestmentPurchaseModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ date: -1, createdAt: -1 })
    .lean<IInvestmentPurchase[]>()
    .exec();

  return docs.map(toPurchase);
};

export const findOneByUser = async (userId: string, id: string) => {
  const doc = await InvestmentPurchaseModel.findOne(scopedTo(userId, id))
    .lean<IInvestmentPurchase>()
    .exec();

  return doc ? toPurchase(doc) : null;
};

export const updateOneByUser = async (
  userId: string,
  id: string,
  changes: InvestmentPurchaseChanges
) => {
  const doc = await InvestmentPurchaseModel.findOneAndUpdate(
    scopedTo(userId, id),
    { $set: changes },
    { new: true, runValidators: true }
  )
    .lean<IInvestmentPurchase>()
    .exec();

  return doc ? toPurchase(doc) : null;
};

export const deleteOneByUser = async (userId: string, id: string) => {
  const result = await InvestmentPurchaseModel.deleteOne(scopedTo(userId, id)).exec();

  return result.deletedCount === 1;
};

export const deleteAllByUser = async (userId: string, session?: ClientSession) => {
  await InvestmentPurchaseModel.deleteMany(
    { userId: new Types.ObjectId(userId) },
    { session }
  ).exec();
};
