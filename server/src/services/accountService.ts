import { CreateAccountDTO, fromCents, toCents, UpdateAccountDTO } from '@lyra/shared';
import mongoose, { Types } from 'mongoose';

import { ApiError } from '../errors/ApiError';
import { IAccount } from '../models/Account';
import * as accountRepository from '../repositories/accountRepository';
import * as transactionRepository from '../repositories/transactionRepository';
import * as analyticsService from './analyticsService';
import { setBalanceCheckpoint, syncAccountBalance } from './balanceService';

export const findAll = async (workspaceId: string) => {
  const accounts = await accountRepository.findMany(workspaceId);

  return accounts.map(a => ({ ...a, balance: fromCents(a.balance) }));
};

export const getAccountById = async (id: string, workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid account ID');
  }

  const account = await accountRepository.findById(id, workspaceId);

  if (!account) {
    throw ApiError.notFound('Account not found');
  }

  return { ...account, balance: fromCents(account.balance) };
};

export const create = async (
  data: CreateAccountDTO,
  userId: string,
  workspaceId: string
) => {
  const numOfAccounts = await accountRepository.countByWorkspace(workspaceId);

  const mapped: Omit<IAccount, '_id'> = {
    name: data.name,
    balance: toCents(data.balance),
    checkpointBalance: toCents(data.balance),
    checkpointDate: new Date(),
    institution: data.institution,
    accountNumber: data.accountNumber,
    icon: data.icon,
    currency: data.currency ?? 'ILS',
    isPrimary: numOfAccounts === 0 ? true : (data.isPrimary ?? false),
    userId: new Types.ObjectId(userId),
    workspaceId: new Types.ObjectId(workspaceId),
  };

  if (mapped.isPrimary && numOfAccounts > 0) {
    await accountRepository.unsetPrimary(workspaceId);
  }

  const created = await accountRepository.insert(mapped);

  created.balance = fromCents(created.balance);

  void analyticsService
    .track(userId, 'account_created')
    .catch(err => console.error('Failed to track account_created:', err));

  return created;
};

export const update = async (id: string, data: UpdateAccountDTO, workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid account ID');
  }

  const existing = await accountRepository.findById(id, workspaceId);

  if (!existing) {
    throw ApiError.notFound('Account not found');
  }

  if (typeof data.balance === 'number') {
    await setBalanceCheckpoint(workspaceId, id, data.balance);
  }

  const { balance: _stripped, ...rest } = data as UpdateAccountDTO & { balance?: number };
  const mapped: Partial<IAccount> = { ...rest };

  const updated = await accountRepository.updateById(id, mapped, workspaceId);

  if (!updated) {
    throw ApiError.internal('Unexpected error updating account');
  }

  return { ...updated, balance: fromCents(updated.balance) };
};

export const setPrimary = async (id: string, workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid account ID');
  }

  const account = await accountRepository.findById(id, workspaceId);

  if (!account) {
    throw ApiError.notFound('Account not found');
  }

  await accountRepository.unsetPrimary(workspaceId, id);

  const updated = await accountRepository.updateById(id, { isPrimary: true }, workspaceId);

  if (!updated) {
    throw ApiError.internal('Unexpected error setting primary account');
  }

  return { ...updated, balance: fromCents(updated.balance) };
};

// Transfers between the two accounts would become transfers from an account to itself.
const moveTransactions = async (workspaceId: string, fromId: string, toId: string) => {
  await transactionRepository.removeTransfersBetween(workspaceId, fromId, toId);
  await transactionRepository.reassignAccount(workspaceId, fromId, toId);
  await syncAccountBalance(workspaceId, toId);
};

export const deleteAccount = async (id: string, workspaceId: string, replacementId?: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid account ID');
  }

  const account = await accountRepository.findById(id, workspaceId);

  if (!account) {
    throw ApiError.notFound('Account not found');
  }

  const totalCount = await accountRepository.countByWorkspace(workspaceId);

  if (totalCount <= 1) {
    throw ApiError.badRequest('Cannot delete the only account');
  }

  const txCount = await transactionRepository.countByAccountId(workspaceId, id);

  if (txCount > 0) {
    if (replacementId) {
      if (!mongoose.Types.ObjectId.isValid(replacementId)) {
        throw ApiError.badRequest('Invalid replacement account ID');
      }

      await moveTransactions(workspaceId, id, replacementId);
    } else if (totalCount === 2) {
      const other = await accountRepository.findAnother(workspaceId, id);

      if (other) {
        await moveTransactions(workspaceId, id, other._id.toString());
      }
    } else {
      throw ApiError.badRequest('Replacement account is required when transactions exist');
    }
  }

  const deletedAccount = await accountRepository.remove(id, workspaceId);

  if (!deletedAccount) {
    throw ApiError.internal('Unexpected error deleting account');
  }

  if (deletedAccount.isPrimary) {
    const newPrimary = await accountRepository.findAnother(workspaceId);

    if (newPrimary) {
      await accountRepository.updateById(
        newPrimary._id.toString(),
        { isPrimary: true },
        workspaceId
      );
    }
  }

  return deletedAccount;
};

export const getLinkedTransactionsCount = async (workspaceId: string, accountId: string) => {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw ApiError.badRequest('Invalid account ID');
  }

  const account = await accountRepository.findById(accountId, workspaceId);

  if (!account) {
    throw ApiError.notFound('Account not found');
  }

  return transactionRepository.countByAccountId(workspaceId, accountId);
};
