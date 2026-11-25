import { ClientSession, Types } from 'mongoose';

import Budget, { IBudget } from '../models/Budget';

interface BudgetFilter {
  year?: number;
  month?: number;
}

export const findMany = async (workspaceId: string, filter: BudgetFilter) => {
  const query: Record<string, unknown> = { workspaceId: new Types.ObjectId(workspaceId) };

  if (filter.year !== undefined) {
    query.year = filter.year;
  }

  if (filter.month !== undefined) {
    query.month = filter.month;
  }

  return Budget.find(query).sort({ year: -1, month: -1, createdAt: -1 }).lean<IBudget[]>().exec();
};

export const findInYearRange = async (workspaceId: string, fromYear: number, toYear: number) =>
  Budget.find({
    workspaceId: new Types.ObjectId(workspaceId),
    year: { $gte: fromYear, $lte: toYear },
  })
    .lean<IBudget[]>()
    .exec();

export const findById = async (id: string, workspaceId: string) =>
  Budget.findOne({ _id: id, workspaceId: new Types.ObjectId(workspaceId) })
    .lean<IBudget>()
    .exec();

export const findByMonthYearCategory = async (
  workspaceId: string,
  categoryId: string,
  year: number,
  month: number
) =>
  Budget.findOne({
    workspaceId: new Types.ObjectId(workspaceId),
    categoryId: new Types.ObjectId(categoryId),
    year,
    month,
  })
    .lean<IBudget>()
    .exec();

export const insert = async (data: Omit<IBudget, '_id'>) => {
  const budget = new Budget(data);

  return budget.save();
};

export const insertMany = (budgets: Omit<IBudget, '_id'>[]) => Budget.insertMany(budgets);

export const updateById = async (id: string, data: Partial<IBudget>, workspaceId: string) =>
  Budget.findOneAndUpdate(
    { _id: id, workspaceId: new Types.ObjectId(workspaceId) },
    data,
    { new: true, runValidators: true }
  )
    .lean<IBudget>()
    .exec();

export const remove = async (id: string, workspaceId: string) =>
  Budget.findOneAndDelete({ _id: id, workspaceId: new Types.ObjectId(workspaceId) })
    .lean<IBudget>()
    .exec();

export const deleteMany = (filter: object, session?: ClientSession) =>
  Budget.deleteMany(filter).session(session ?? null);

export const findAllByWorkspace = async (workspaceId: string) =>
  Budget.find({ workspaceId: new Types.ObjectId(workspaceId) }).lean<IBudget[]>().exec();
