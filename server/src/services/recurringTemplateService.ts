import {
  CreateRecurringTemplateDTO,
  DeactivateFromDTO,
  fromCents,
  MaterializeRecurringOccurrenceDTO,
  SplitRecurringTemplateDTO,
  toCents,
  UpdateFixedExpenseDetailsDTO,
  UpdateRecurringTemplateDTO,
} from '@lyra/shared';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import mongoose, { Types } from 'mongoose';

import { ApiError } from '../errors/ApiError';
import Account from '../models/Account';
import Category from '../models/Category';
import PaymentMethod from '../models/PaymentMethod';
import { IRecurringTemplate } from '../models/RecurringTemplate';
import { ITransaction } from '../models/Transaction';
import * as recurringTemplateRepository from '../repositories/recurringTemplateRepository';
import * as transactionRepository from '../repositories/transactionRepository';
import { isCategoryCompatibleWithTransactionType } from '../utils/categoryCompatibility';
import { fingerprintForTransaction } from '../utils/importFingerprint';
import * as analyticsService from './analyticsService';
import { syncAllAccountsForUser } from './balanceService';
import { buildFixedExpenses } from './recurring/buildFixedExpenses';
import { normalizeFixedExpenseDetails } from './recurring/fixedExpenseDetails';
import { isOccurrenceMonth } from './recurring/occurrence';
import { clampedDate } from './transactions/buildVirtualTransactions';
import { invalidateQuickChipsCache } from './transactions/quickChipsService';

dayjs.extend(utc);

type RefFields = {
  categoryId?: string;
  accountId?: string;
  paymentMethodId?: string;
  fromAccountId?: string;
  toAccountId?: string;
};

const validateRefs = async (
  type: 'Income' | 'Expense' | 'Transfer',
  refs: RefFields,
  workspaceId: string
) => {
  const workspaceFilter = { workspaceId: new Types.ObjectId(workspaceId) };

  if (type === 'Income' || type === 'Expense') {
    if (refs.categoryId) {
      const category = await Category.findOne({ _id: refs.categoryId, ...workspaceFilter });

      if (!category) {
        throw ApiError.badRequest('Invalid category for this workspace');
      }

      if (!isCategoryCompatibleWithTransactionType(category.type, type)) {
        throw ApiError.badRequest(
          `Category type mismatch: category is ${category.type} but template is ${type}`
        );
      }
    }

    if (refs.accountId) {
      const account = await Account.findOne({ _id: refs.accountId, ...workspaceFilter });

      if (!account) {
        throw ApiError.badRequest('Invalid account for this workspace');
      }
    }
  }

  if (type === 'Transfer') {
    if (refs.fromAccountId) {
      const fromAccount = await Account.findOne({
        _id: refs.fromAccountId,
        ...workspaceFilter,
      });

      if (!fromAccount) {
        throw ApiError.badRequest('Invalid fromAccount for this workspace');
      }
    }

    if (refs.toAccountId) {
      const toAccount = await Account.findOne({
        _id: refs.toAccountId,
        ...workspaceFilter,
      });

      if (!toAccount) {
        throw ApiError.badRequest('Invalid toAccount for this workspace');
      }
    }
  }

  if (!refs.paymentMethodId) {
    throw ApiError.badRequest('Payment method is required');
  }

  const paymentMethod = await PaymentMethod.findOne({
    _id: refs.paymentMethodId,
    ...workspaceFilter,
  });

  if (!paymentMethod) {
    throw ApiError.badRequest('Invalid payment method for this workspace');
  }
};

export const getByWorkspace = async (workspaceId: string) => {
  const templates = await recurringTemplateRepository.findMany(workspaceId);

  return templates.map(t => ({ ...t, amount: fromCents(t.amount) }));
};

export const getById = async (id: string, workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid recurring template ID');
  }

  const template = await recurringTemplateRepository.findById(id, workspaceId);

  if (!template) {
    throw ApiError.notFound('Recurring template not found');
  }

  return { ...template, amount: fromCents(template.amount) };
};

export const create = async (
  dto: CreateRecurringTemplateDTO,
  userId: string,
  workspaceId: string
) => {
  await validateRefs(dto.type, dto, workspaceId);

  const mapped: Omit<IRecurringTemplate, '_id'> = {
    userId: new Types.ObjectId(userId),
    workspaceId: new Types.ObjectId(workspaceId),
    frequency: dto.frequency,
    dayOfMonth: dto.dayOfMonth,
    startDate: new Date(dto.startDate),
    endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    name: dto.name,
    note: dto.note,
    type: dto.type,
    amount: toCents(dto.amount),
    belongToPreviousMonth: dto.belongToPreviousMonth ?? false,
    category: dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined,
    paymentMethod: dto.paymentMethodId ? new Types.ObjectId(dto.paymentMethodId) : undefined,
    account: dto.accountId ? new Types.ObjectId(dto.accountId) : undefined,
    fromAccount: dto.fromAccountId ? new Types.ObjectId(dto.fromAccountId) : undefined,
    toAccount: dto.toAccountId ? new Types.ObjectId(dto.toAccountId) : undefined,
    isActive: true,
    lastGeneratedDate: null,
    ...normalizeFixedExpenseDetails(dto.type, dto),
  };

  const created = await recurringTemplateRepository.insert(mapped);

  void analyticsService.track(userId, 'recurring_created').catch(err =>
    console.error('Failed to track recurring_created:', err)
  );

  return { ...created.toObject(), amount: fromCents(created.amount) };
};

export const update = async (
  id: string,
  dto: UpdateRecurringTemplateDTO,
  workspaceId: string,
  userId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid recurring template ID');
  }

  const existing = await recurringTemplateRepository.findById(id, workspaceId);

  if (!existing) {
    throw ApiError.notFound('Recurring template not found');
  }

  const effectiveType = (dto.type ?? existing.type) as 'Income' | 'Expense' | 'Transfer';

  await validateRefs(effectiveType, dto, workspaceId);

  const mapped: Partial<IRecurringTemplate> = {};

  if (dto.frequency !== undefined) mapped.frequency = dto.frequency;
  if (dto.dayOfMonth !== undefined) mapped.dayOfMonth = dto.dayOfMonth;
  if (dto.startDate !== undefined) mapped.startDate = new Date(dto.startDate);
  if (dto.endDate !== undefined) mapped.endDate = new Date(dto.endDate);
  if (dto.name !== undefined) mapped.name = dto.name;
  if (dto.note !== undefined) mapped.note = dto.note;
  if (dto.type !== undefined) mapped.type = dto.type;
  if (dto.amount !== undefined) mapped.amount = toCents(dto.amount);
  if (dto.belongToPreviousMonth !== undefined)
    mapped.belongToPreviousMonth = dto.belongToPreviousMonth;
  if (dto.categoryId !== undefined) mapped.category = new Types.ObjectId(dto.categoryId);
  if (dto.paymentMethodId !== undefined)
    mapped.paymentMethod = new Types.ObjectId(dto.paymentMethodId);
  if (dto.accountId !== undefined) mapped.account = new Types.ObjectId(dto.accountId);
  if (dto.fromAccountId !== undefined) mapped.fromAccount = new Types.ObjectId(dto.fromAccountId);
  if (dto.toAccountId !== undefined) mapped.toAccount = new Types.ObjectId(dto.toAccountId);

  await recurringTemplateRepository.updateById(id, mapped, workspaceId);

  const updated =
    dto.kind !== undefined
      ? await recurringTemplateRepository.replaceFixedExpenseDetails(
          id,
          normalizeFixedExpenseDetails(effectiveType, dto),
          workspaceId
        )
      : await recurringTemplateRepository.findById(id, workspaceId);

  if (!updated) {
    throw ApiError.internal('Unexpected error updating recurring template');
  }

  return { ...updated, amount: fromCents(updated.amount) };
};

export const deleteTemplate = async (id: string, workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid recurring template ID');
  }

  const existing = await recurringTemplateRepository.findById(id, workspaceId);

  if (!existing) {
    throw ApiError.notFound('Recurring template not found');
  }

  const deleted = await recurringTemplateRepository.remove(id, workspaceId);

  if (!deleted) {
    throw ApiError.internal('Unexpected error deleting recurring template');
  }

  return { ...deleted, amount: fromCents(deleted.amount) };
};

export const createWithTransactions = async (
  dto: CreateRecurringTemplateDTO,
  userId: string,
  workspaceId: string
) => {
  const template = await create(dto, userId, workspaceId);
  const rawTransactions = await generatePendingTransactions(userId);
  const transactions = rawTransactions.map(tx => ({
    ...tx.toObject(),
    amount: fromCents(tx.amount),
  }));

  return { template, transactions };
};

export const deactivateFrom = async (
  templateId: string,
  dto: DeactivateFromDTO,
  workspaceId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw ApiError.badRequest('Invalid recurring template ID');
  }

  const existing = await recurringTemplateRepository.findById(templateId, workspaceId);

  if (!existing) {
    throw ApiError.notFound('Recurring template not found');
  }

  const fromPoint = dayjs.utc(dto.fromDate).startOf('month');
  const startMonth = dayjs.utc(existing.startDate).startOf('month');
  const isDeletingFromStart = fromPoint.isSame(startMonth, 'month');

  if (isDeletingFromStart) {
    await recurringTemplateRepository.updateById(templateId, { isActive: false }, workspaceId);
    await transactionRepository.deleteByTemplateIdFromDate(templateId, existing.startDate);
  } else {
    const endOfPrevMonth = fromPoint.subtract(1, 'day').toDate();
    await recurringTemplateRepository.updateById(templateId, { endDate: endOfPrevMonth }, workspaceId);
    await transactionRepository.deleteByTemplateIdFromDate(templateId, fromPoint.toDate());
  }

  const updated = await recurringTemplateRepository.findById(templateId, workspaceId);

  return updated ? { ...updated, amount: fromCents(updated.amount) } : null;
};

export const splitTemplate = async (
  templateId: string,
  dto: SplitRecurringTemplateDTO,
  workspaceId: string,
  userId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw ApiError.badRequest('Invalid recurring template ID');
  }

  const existing = await recurringTemplateRepository.findById(templateId, workspaceId);

  if (!existing) {
    throw ApiError.notFound('Recurring template not found');
  }

  const { fromDate, ...changes } = dto;
  const splitPoint = dayjs.utc(fromDate).startOf('month');
  const endOfPrevMonth = splitPoint.subtract(1, 'day').toDate();

  await recurringTemplateRepository.updateById(
    templateId,
    { endDate: endOfPrevMonth },
    workspaceId
  );

  const effectiveType = (changes.type ?? existing.type) as 'Income' | 'Expense' | 'Transfer';

  await validateRefs(effectiveType, changes, workspaceId);

  const newTemplateData: Omit<IRecurringTemplate, '_id'> = {
    userId: existing.userId,
    workspaceId: new Types.ObjectId(workspaceId),
    frequency: changes.frequency ?? existing.frequency,
    dayOfMonth: changes.dayOfMonth ?? existing.dayOfMonth,
    startDate: splitPoint.toDate(),
    endDate: changes.endDate ? new Date(changes.endDate) : undefined,
    name: changes.name ?? existing.name,
    note: changes.note ?? existing.note,
    type: effectiveType,
    amount: changes.amount !== undefined ? toCents(changes.amount) : existing.amount,
    belongToPreviousMonth: changes.belongToPreviousMonth ?? existing.belongToPreviousMonth,
    category: changes.categoryId ? new Types.ObjectId(changes.categoryId) : existing.category,
    paymentMethod: changes.paymentMethodId
      ? new Types.ObjectId(changes.paymentMethodId)
      : existing.paymentMethod,
    account: changes.accountId ? new Types.ObjectId(changes.accountId) : existing.account,
    fromAccount: changes.fromAccountId
      ? new Types.ObjectId(changes.fromAccountId)
      : existing.fromAccount,
    toAccount: changes.toAccountId ? new Types.ObjectId(changes.toAccountId) : existing.toAccount,
    isActive: true,
    lastGeneratedDate: null,
    ...normalizeFixedExpenseDetails(effectiveType, {
      kind: changes.kind ?? existing.kind,
      providerId: changes.providerId ?? existing.providerId,
      cancelUrl: changes.cancelUrl ?? existing.cancelUrl,
      billType: changes.billType ?? existing.billType,
    }),
  };

  const newTemplate = await recurringTemplateRepository.insert(newTemplateData);

  await transactionRepository.deleteByTemplateIdFromDate(templateId, splitPoint.toDate());

  await materializeOccurrence(
    (newTemplate._id as Types.ObjectId).toString(),
    { occurrenceDate: fromDate },
    workspaceId
  );

  generatePendingTransactions(userId).catch(err =>
    console.error('Failed to generate pending transactions after split:', err)
  );

  return {
    oldTemplate: existing,
    newTemplate: { ...newTemplate.toObject(), amount: fromCents(newTemplate.amount) },
  };
};

export const getFixedExpenses = async (workspaceId: string) => {
  const templates = await recurringTemplateRepository.findActiveExpensesPopulated(workspaceId);
  const { items, totals } = buildFixedExpenses(templates, dayjs.utc().add(3, 'hours').toDate());

  return {
    items: items.map(({ template, kind, nextDate, monthlyAmount, yearlyAmount }) => ({
      _id: template._id.toString(),
      name: template.name ?? '',
      kind,
      frequency: template.frequency,
      amount: fromCents(template.amount),
      nextDate,
      endDate: template.endDate ?? null,
      monthlyAmount: fromCents(monthlyAmount),
      yearlyAmount: fromCents(yearlyAmount),
      providerId: template.providerId ?? null,
      cancelUrl: template.cancelUrl ?? null,
      billType: template.billType ?? null,
      category: template.category ?? null,
      paymentMethod: template.paymentMethod ?? null,
    })),
    totals: { monthly: fromCents(totals.monthly), yearly: fromCents(totals.yearly) },
  };
};

export const updateFixedExpenseDetails = async (
  id: string,
  dto: UpdateFixedExpenseDetailsDTO,
  workspaceId: string
) => {
  const existing = await findExistingTemplate(id, workspaceId);

  if (existing.type !== 'Expense') {
    throw ApiError.badRequest('Only expenses can be fixed expenses');
  }

  const updated = await recurringTemplateRepository.replaceFixedExpenseDetails(
    id,
    normalizeFixedExpenseDetails(existing.type, dto),
    workspaceId
  );

  if (!updated) {
    throw ApiError.internal('Unexpected error updating recurring template');
  }

  return { ...updated, amount: fromCents(updated.amount) };
};

// Stops a recurring expense from today: occurrences already due are recorded first, so the
// history stays complete, and nothing is generated or forecast after it.
export const cancelTemplate = async (id: string, workspaceId: string, userId: string) => {
  const existing = await findExistingTemplate(id, workspaceId);

  if (!existing.isActive) {
    return { ...existing, amount: fromCents(existing.amount) };
  }

  const generated = await generatePendingTransactions(userId);

  if (generated.length > 0) {
    await syncAllAccountsForUser(userId);
  }

  const now = new Date();
  const updated = await recurringTemplateRepository.updateById(
    id,
    { isActive: false, cancelledAt: now, endDate: earlierOf(existing.endDate, now) },
    workspaceId
  );

  if (!updated) {
    throw ApiError.internal('Unexpected error cancelling recurring template');
  }

  return { ...updated, amount: fromCents(updated.amount) };
};

const earlierOf = (endDate: Date | undefined, now: Date) =>
  endDate && endDate < now ? endDate : now;

const findExistingTemplate = async (id: string, workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid recurring template ID');
  }

  const existing = await recurringTemplateRepository.findById(id, workspaceId);

  if (!existing) {
    throw ApiError.notFound('Recurring template not found');
  }

  return existing;
};

export const materializeOccurrence = async (
  templateId: string,
  dto: MaterializeRecurringOccurrenceDTO,
  workspaceId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw ApiError.badRequest('Invalid recurring template ID');
  }

  const template = await recurringTemplateRepository.findById(templateId, workspaceId);

  if (!template) {
    throw ApiError.notFound('Recurring template not found');
  }

  const occurrence = dayjs.utc(dto.occurrenceDate);

  if (!occurrence.isValid()) {
    throw ApiError.badRequest('Invalid occurrence date');
  }

  const effectiveType = (dto.type ?? template.type) as 'Income' | 'Expense' | 'Transfer';

  await validateRefs(effectiveType, {
    categoryId: dto.categoryId ?? template.category?.toString(),
    accountId: dto.accountId ?? template.account?.toString(),
    paymentMethodId: dto.paymentMethodId ?? template.paymentMethod?.toString(),
    fromAccountId: dto.fromAccountId ?? template.fromAccount?.toString(),
    toAccountId: dto.toAccountId ?? template.toAccount?.toString(),
  }, workspaceId);

  const txDate = dto.date ? new Date(dto.date) : clampedDate(occurrence.year(), occurrence.month(), template.dayOfMonth);

  const buildTxData = (): Omit<ITransaction, '_id'> => ({
    name: dto.name ?? template.name ?? '',
    note: dto.note ?? template.note,
    type: effectiveType,
    amount: dto.amount !== undefined ? toCents(dto.amount) : template.amount,
    date: txDate,
    frequency: template.frequency,
    belongToPreviousMonth: dto.belongToPreviousMonth ?? template.belongToPreviousMonth ?? false,
    category: dto.categoryId ? new Types.ObjectId(dto.categoryId) : template.category,
    paymentMethod: dto.paymentMethodId ? new Types.ObjectId(dto.paymentMethodId) : template.paymentMethod,
    account: dto.accountId ? new Types.ObjectId(dto.accountId) : template.account,
    fromAccount: dto.fromAccountId ? new Types.ObjectId(dto.fromAccountId) : template.fromAccount,
    toAccount: dto.toAccountId ? new Types.ObjectId(dto.toAccountId) : template.toAccount,
    userId: template.userId,
    workspaceId: new Types.ObjectId(workspaceId),
    templateId: new Types.ObjectId(templateId),
    source: 'manual',
  });

  const existing = await transactionRepository.findOneByTemplateAndMonth(
    templateId,
    workspaceId,
    occurrence.year(),
    occurrence.month()
  );

  if (existing) {
    const txData = buildTxData();
    const updated = await transactionRepository.updateById(
      existing._id.toString(),
      txData,
      workspaceId
    );

    if (!updated) {
      throw ApiError.internal('Unexpected error updating materialized occurrence');
    }

    if (template.workspaceId) {
      invalidateQuickChipsCache(template.workspaceId.toString());
    }

    return { ...updated, amount: fromCents(updated.amount) };
  }

  const txData = buildTxData();
  txData.importFingerprint = fingerprintForTransaction(txData);

  const created = await transactionRepository.insert(txData);

  if (template.workspaceId) {
    invalidateQuickChipsCache(template.workspaceId.toString());
  }

  return { ...created.toObject(), amount: fromCents(created.amount) };
};

// Per-user cron-driven generator. Templates query stays userId-scoped (findActiveByUser),
// updates use the userId-variant repo helper. Both flip when the cron path moves to workspace iteration.
export const generatePendingTransactions = async (userId: string, upToDate: Date = dayjs.utc().add(3, 'hours').toDate()) => {
  const templates = await recurringTemplateRepository.findActiveByUser(userId);
  const created: Awaited<ReturnType<typeof transactionRepository.insert>>[] = [];
  const upToMonth = dayjs.utc(upToDate).startOf('month');

  for (const template of templates) {
    const startMonth = dayjs.utc(template.startDate).startOf('month');

    if (startMonth.isAfter(upToMonth)) {
      continue;
    }

    const fromMonth = template.lastGeneratedDate
      ? dayjs.utc(template.lastGeneratedDate).startOf('month').add(1, 'month')
      : startMonth;

    if (fromMonth.isAfter(upToMonth)) {
      continue;
    }

    if (template.endDate && dayjs.utc(template.endDate).startOf('month').isBefore(fromMonth)) {
      continue;
    }

    let lastMonth: dayjs.Dayjs | null = null;
    let current = fromMonth;

    while (!current.isAfter(upToMonth)) {
      if (template.endDate && current.isAfter(dayjs.utc(template.endDate).startOf('month'))) {
        break;
      }

      if (!isOccurrenceMonth(template.frequency, template.startDate, current)) {
        current = current.add(1, 'month');
        continue;
      }

      const txDate = clampedDate(current.year(), current.month(), template.dayOfMonth);

      if (dayjs.utc(txDate).startOf('day').isAfter(dayjs.utc(upToDate).startOf('day'))) {
        break;
      }

      const alreadyMaterialized = template.workspaceId
        ? await transactionRepository.findOneByTemplateAndMonth(
            template._id as string,
            template.workspaceId.toString(),
            current.year(),
            current.month()
          )
        : null;

      if (alreadyMaterialized) {
        lastMonth = current;
        current = current.add(1, 'month');
        continue;
      }

      const txData: Omit<ITransaction, '_id'> = {
        name: template.name ?? '',
        note: template.note,
        type: template.type,
        amount: template.amount,
        date: txDate,
        frequency: template.frequency,
        belongToPreviousMonth: template.belongToPreviousMonth ?? false,
        category: template.category,
        paymentMethod: template.paymentMethod,
        account: template.account,
        fromAccount: template.fromAccount,
        toAccount: template.toAccount,
        userId: template.userId,
        workspaceId: template.workspaceId,
        templateId: new Types.ObjectId(template._id as string),
        source: 'manual',
      };

      txData.importFingerprint = fingerprintForTransaction(txData);

      const tx = await transactionRepository.insert(txData);

      created.push(tx);
      // template.workspaceId is set by Step 1.5 stamping + the migration backfill.
      if (template.workspaceId) {
        invalidateQuickChipsCache(template.workspaceId.toString());
      }
      lastMonth = current;
      current = current.add(1, 'month');
    }

    if (lastMonth) {
      await recurringTemplateRepository.updateByIdForUser(
        template._id as string,
        {
          lastGeneratedDate: clampedDate(lastMonth.year(), lastMonth.month(), template.dayOfMonth),
        },
        userId
      );
    }
  }

  return created;
};
