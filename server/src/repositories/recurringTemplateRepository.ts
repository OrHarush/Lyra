import { ClientSession, Types } from 'mongoose';

import RecurringTemplate, { IRecurringTemplate } from '../models/RecurringTemplate';
import { IRecurringTemplatePopulated } from '../types/RecurringTemplate';

export const findMany = async (workspaceId: string) =>
  RecurringTemplate.find({ workspaceId: new Types.ObjectId(workspaceId) })
    .sort({ createdAt: -1 })
    .lean<IRecurringTemplate[]>()
    .exec();

export const findByIds = async (ids: Types.ObjectId[], workspaceId: string) =>
  RecurringTemplate.find({ _id: { $in: ids }, workspaceId: new Types.ObjectId(workspaceId) })
    .lean<IRecurringTemplate[]>()
    .exec();

export const findById = async (id: string, workspaceId: string) =>
  RecurringTemplate.findOne({ _id: id, workspaceId: new Types.ObjectId(workspaceId) })
    .lean<IRecurringTemplate>()
    .exec();

// Still userId-scoped: cron-driven generator runs per user (flips when the cron path moves to workspace iteration).
export const findActiveByUser = async (userId: string) =>
  RecurringTemplate.find({ userId: new Types.ObjectId(userId), isActive: true })
    .sort({ createdAt: -1 })
    .lean<IRecurringTemplate[]>()
    .exec();

export const countActiveByWorkspace = async (workspaceId: string): Promise<number> =>
  RecurringTemplate.countDocuments({
    workspaceId: new Types.ObjectId(workspaceId),
    isActive: true,
  });

export const findUserIdsWithActiveTemplates = async (): Promise<string[]> => {
  const userIds = await RecurringTemplate.distinct('userId', { isActive: true });

  return userIds.map((id: Types.ObjectId) => id.toString());
};

export const findActiveForDateRange = async (workspaceId: string, from: Date, to: Date) =>
  RecurringTemplate.find({
    workspaceId: new Types.ObjectId(workspaceId),
    isActive: true,
    startDate: { $lte: to },
    $or: [{ endDate: { $gte: from } }, { endDate: null }],
  })
    .lean<IRecurringTemplate[]>()
    .exec();

export const findActiveForDateRangePopulated = async (
  workspaceId: string,
  from: Date,
  to: Date
) =>
  RecurringTemplate.find({
    workspaceId: new Types.ObjectId(workspaceId),
    isActive: true,
    startDate: { $lte: to },
    $or: [{ endDate: { $gte: from } }, { endDate: null }],
  })
    .populate('category')
    .populate('paymentMethod')
    .populate('account')
    .populate('fromAccount')
    .populate('toAccount')
    .lean<IRecurringTemplatePopulated[]>()
    .exec();

export const findActiveExpensesPopulated = async (workspaceId: string) =>
  RecurringTemplate.find({
    workspaceId: new Types.ObjectId(workspaceId),
    isActive: true,
    type: 'Expense',
  })
    .populate('category')
    .populate('paymentMethod')
    .lean<IRecurringTemplatePopulated[]>()
    .exec();

// Mongoose drops undefined values from updates, so cleared details need an explicit $unset.
export const replaceFixedExpenseDetails = async (
  id: string,
  details: Pick<IRecurringTemplate, 'kind' | 'providerId' | 'cancelUrl' | 'billType'>,
  workspaceId: string
) => {
  const entries = Object.entries(details);
  const set = Object.fromEntries(entries.filter(([, value]) => value !== undefined));
  const unset = Object.fromEntries(
    entries.filter(([, value]) => value === undefined).map(([key]) => [key, 1])
  );

  return RecurringTemplate.findOneAndUpdate(
    { _id: id, workspaceId: new Types.ObjectId(workspaceId) },
    { $set: set, $unset: unset },
    { new: true, runValidators: true }
  )
    .lean<IRecurringTemplate>()
    .exec();
};

export const insert = async (data: Omit<IRecurringTemplate, '_id'>) => {
  const template = new RecurringTemplate(data);

  return template.save();
};

export const updateById = async (
  id: string,
  data: Partial<IRecurringTemplate>,
  workspaceId: string
) =>
  RecurringTemplate.findOneAndUpdate(
    { _id: id, workspaceId: new Types.ObjectId(workspaceId) },
    data,
    { new: true, runValidators: true }
  )
    .lean<IRecurringTemplate>()
    .exec();

// updateByIdForUser: still-userId-scoped variant used by the per-user cron generator + debug snapshot restore.
// Same logical guard as updateById, just keyed on userId. Drops when the consuming paths flip.
export const updateByIdForUser = async (
  id: string,
  data: Partial<IRecurringTemplate>,
  userId: string
) =>
  RecurringTemplate.findOneAndUpdate(
    { _id: id, userId: new Types.ObjectId(userId) },
    data,
    { new: true, runValidators: true }
  )
    .lean<IRecurringTemplate>()
    .exec();

export const remove = async (id: string, workspaceId: string) =>
  RecurringTemplate.findOneAndDelete({ _id: id, workspaceId: new Types.ObjectId(workspaceId) })
    .lean<IRecurringTemplate>()
    .exec();

export const deleteMany = (filter: object, session?: ClientSession) =>
  RecurringTemplate.deleteMany(filter).session(session ?? null);
