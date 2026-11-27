import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ClientSession, Types } from 'mongoose';

import Transaction, { AUTOMATION_SOURCES, ITransaction } from '../models/Transaction';
import { GetTransactionsOptions } from '../schemas/transactionSchemas';
import { ITransactionPopulated } from '../types/Transaction';
import { buildTransactionQuery } from '../utils/transaction';

dayjs.extend(utc);

export const findMany = async (workspaceId: string, options: GetTransactionsOptions) => {
  const { from, to, categoryIds, paymentMethodIds, accountIds, accountId } = options;
  const resolvedAccountIds = accountIds ?? (accountId ? [accountId] : undefined);

  const query = buildTransactionQuery(
    workspaceId,
    from,
    to,
    categoryIds,
    paymentMethodIds,
    resolvedAccountIds
  );

  return await Transaction.find(query)
    .populate('category')
    .populate('paymentMethod')
    .populate('account')
    .populate('fromAccount')
    .populate('toAccount')
    .lean<ITransactionPopulated[]>()
    .exec();
};

export const findAwaitingApproval = async (
  workspaceId: string,
  { accountId, before }: { accountId?: string; before?: Date } = {}
) =>
  Transaction.find({
    workspaceId: new Types.ObjectId(workspaceId),
    isAwaitingApproval: true,
    ...(accountId && { account: new Types.ObjectId(accountId) }),
    ...(before && { date: { $lt: before } }),
  })
    .sort({ date: 1 })
    .populate('category')
    .populate('paymentMethod')
    .populate('account')
    .lean<ITransactionPopulated[]>()
    .exec();

export const findRecentApprovedAmounts = async (templateId: string, limit: number) => {
  const rows = await Transaction.find({
    templateId: new Types.ObjectId(templateId),
    isAwaitingApproval: { $ne: true },
  })
    .sort({ date: -1 })
    .limit(limit)
    .select('amount')
    .lean<Pick<ITransaction, 'amount'>[]>()
    .exec();

  return rows.map(row => row.amount);
};

// Matching on the flag makes approval apply once, even when two household members tap together.
export const approveAwaiting = async (
  id: string,
  data: Pick<ITransaction, 'amount' | 'importFingerprint'>,
  workspaceId: string
) =>
  Transaction.findOneAndUpdate(
    { _id: id, workspaceId: new Types.ObjectId(workspaceId), isAwaitingApproval: true },
    { $set: { ...data, isAwaitingApproval: false } },
    { new: true, runValidators: true }
  )
    .lean<ITransaction>()
    .exec();

export const moveToTemplate = (
  fromTemplateId: string,
  fromDate: Date,
  data: Partial<ITransaction>
) =>
  Transaction.updateMany(
    { templateId: new Types.ObjectId(fromTemplateId), date: { $gte: fromDate } },
    { $set: data }
  );

export const findExpensesInRange = async (
  workspaceId: string,
  from: Date,
  to: Date,
  accountId?: string
) =>
  Transaction.find({
    workspaceId: new Types.ObjectId(workspaceId),
    type: 'Expense',
    date: { $gte: from, $lt: to },
    ...(accountId && { account: new Types.ObjectId(accountId) }),
  })
    .populate('category', 'name key type color icon')
    .populate('paymentMethod', 'type billingDay')
    .lean<ITransactionPopulated[]>()
    .exec();

export const findById = async (id: string, workspaceId: string) =>
  Transaction.findOne({ _id: id, workspaceId: new Types.ObjectId(workspaceId) })
    .populate('category')
    .populate('paymentMethod')
    .populate('account')
    .populate('fromAccount')
    .populate('toAccount')
    .lean<ITransactionPopulated>()
    .exec();

export const countByWorkspace = async (workspaceId: string): Promise<number> =>
  Transaction.countDocuments({ workspaceId: new Types.ObjectId(workspaceId) });

// Still userId-scoped: feedbackService uses it as a per-user activity heuristic.
// Flips when feedbackService refactors.
export const countByUser = async (userId: string): Promise<number> =>
  Transaction.countDocuments({ userId: new Types.ObjectId(userId) });

// userId-scoped on purpose: automation txs are personal-workspace-only, so the user's own
// automation txs == their personal queue. Matches the { userId, source, reviewedAt } index.
const needsReviewFilter = (userId: string) => ({
  userId: new Types.ObjectId(userId),
  source: { $in: AUTOMATION_SOURCES },
  reviewedAt: null,
});

export const countNeedsReview = async (userId: string): Promise<number> =>
  Transaction.countDocuments(needsReviewFilter(userId));

export const findNeedsReview = async (userId: string) =>
  Transaction.find(needsReviewFilter(userId))
    .populate('category')
    .populate('paymentMethod')
    .populate('account')
    .sort({ date: -1 })
    .lean<ITransactionPopulated[]>()
    .exec();

export const findExistingFingerprints = async (
  workspaceId: string,
  fingerprints: string[]
): Promise<string[]> =>
  Transaction.distinct('importFingerprint', {
    workspaceId: new Types.ObjectId(workspaceId),
    importFingerprint: { $in: fingerprints },
  });

// Admin-only aggregations stay user-scoped — they tabulate across all users for the admin dashboard.
export const countGroupedByUser = async (): Promise<{ userId: string; count: number }[]> => {
  const rows = await Transaction.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);

  return rows.map(row => ({ userId: row._id.toString(), count: row.count }));
};

export const countDistinctUsers = async (): Promise<number> => {
  const userIds = await Transaction.distinct('userId');

  return userIds.length;
};

export const insert = async (data: Omit<ITransaction, '_id'>) => {
  const transaction = new Transaction(data);

  return transaction.save();
};

export const updateById = async (id: string, data: Partial<ITransaction>, workspaceId: string) =>
  Transaction.findOneAndUpdate(
    { _id: id, workspaceId: new Types.ObjectId(workspaceId) },
    data,
    { new: true, runValidators: true }
  )
    .populate('category')
    .populate('paymentMethod')
    .populate('account')
    .lean<ITransactionPopulated>()
    .exec();

export const remove = async (id: string, workspaceId: string) =>
  Transaction.findOneAndDelete({ _id: id, workspaceId: new Types.ObjectId(workspaceId) })
    .populate('category')
    .populate('paymentMethod')
    .populate('account')
    .lean<ITransactionPopulated>()
    .exec();

export const insertMany = (data: Omit<ITransaction, '_id'>[]) =>
  Transaction.insertMany(data, { ordered: false });

export const deleteMany = (filter: object, session?: ClientSession) =>
  Transaction.deleteMany(filter).session(session ?? null);

export const findAllByWorkspace = async (workspaceId: string) =>
  Transaction.find({ workspaceId: new Types.ObjectId(workspaceId) }).lean<ITransaction[]>().exec();

export const deleteByTemplateIdFromDate = (templateId: string, fromDate: Date) =>
  Transaction.deleteMany({
    templateId: new Types.ObjectId(templateId),
    date: { $gte: fromDate },
  });

export const findOneByTemplateAndMonth = (
  templateId: string,
  workspaceId: string,
  year: number,
  month: number
) => {
  const monthStart = dayjs.utc().year(year).month(month).startOf('month').toDate();
  const monthEnd = dayjs.utc().year(year).month(month).endOf('month').toDate();

  return Transaction.findOne({
    templateId: new Types.ObjectId(templateId),
    workspaceId: new Types.ObjectId(workspaceId),
    date: { $gte: monthStart, $lte: monthEnd },
  });
};

export const countByAccountId = async (workspaceId: string, accountId: string) =>
  Transaction.countDocuments(
    buildTransactionQuery(workspaceId, undefined, undefined, undefined, undefined, [accountId])
  );

export const countByPaymentMethodId = async (
  workspaceId: string,
  paymentMethodId: string
): Promise<number> =>
  Transaction.countDocuments({
    workspaceId: new Types.ObjectId(workspaceId),
    paymentMethod: new Types.ObjectId(paymentMethodId),
  });

export const reassignPaymentMethod = async (
  workspaceId: string,
  oldId: string,
  newId: string
) =>
  Transaction.updateMany(
    { workspaceId: new Types.ObjectId(workspaceId), paymentMethod: new Types.ObjectId(oldId) },
    { $set: { paymentMethod: new Types.ObjectId(newId) } }
  );

export const reassignAccount = async (workspaceId: string, oldId: string, newId: string) => {
  const workspaceObjId = new Types.ObjectId(workspaceId);

  for (const field of ['account', 'fromAccount', 'toAccount'] as const) {
    await Transaction.updateMany(
      { workspaceId: workspaceObjId, [field]: new Types.ObjectId(oldId) },
      { $set: { [field]: new Types.ObjectId(newId) } }
    );
  }
};

export const removeTransfersBetween = async (
  workspaceId: string,
  firstAccountId: string,
  secondAccountId: string
) => {
  const first = new Types.ObjectId(firstAccountId);
  const second = new Types.ObjectId(secondAccountId);

  return Transaction.deleteMany({
    workspaceId: new Types.ObjectId(workspaceId),
    type: 'Transfer',
    $or: [
      { fromAccount: first, toAccount: second },
      { fromAccount: second, toAccount: first },
    ],
  });
};

export interface QuickChipAggregation {
  name: string;
  categoryId: Types.ObjectId;
  paymentMethodId: Types.ObjectId;
  latestAmount: number;
  latestDate: Date;
  occurrences: number;
  recencyFrequencyScore: number;
}

export const aggregateFrequentExpensePatterns = async (
  workspaceId: string,
  since: Date,
  now: Date,
  minOccurrences: number,
  limit: number
): Promise<QuickChipAggregation[]> => {
  const windowDays = Math.max(1, (now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24));

  return Transaction.aggregate<QuickChipAggregation>([
    {
      $match: {
        workspaceId: new Types.ObjectId(workspaceId),
        type: 'Expense',
        date: { $gte: since, $lte: now },
        name: { $exists: true, $nin: [null, ''] },
        category: { $exists: true, $ne: null },
        paymentMethod: { $exists: true, $ne: null },
        templateId: { $in: [null, undefined] },
        frequency: { $in: [null, undefined] },
      },
    },
    { $sort: { date: -1 } },
    {
      $group: {
        _id: {
          name: '$name',
          categoryId: '$category',
          paymentMethodId: '$paymentMethod',
        },
        latestAmount: { $first: '$amount' },
        latestDate: { $first: '$date' },
        occurrences: { $sum: 1 },
        daysAgoList: {
          $push: {
            $divide: [{ $subtract: [now, '$date'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    },
    { $match: { occurrences: { $gte: minOccurrences } } },
    {
      $addFields: {
        recencyFrequencyScore: {
          $sum: {
            $map: {
              input: '$daysAgoList',
              as: 'daysAgo',
              in: {
                $divide: [1, { $add: [{ $divide: ['$$daysAgo', windowDays] }, 0.1] }],
              },
            },
          },
        },
      },
    },
    { $sort: { recencyFrequencyScore: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        name: '$_id.name',
        categoryId: '$_id.categoryId',
        paymentMethodId: '$_id.paymentMethodId',
        latestAmount: 1,
        latestDate: 1,
        occurrences: 1,
        recencyFrequencyScore: 1,
      },
    },
  ]);
};
