import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as categoryRepository from '../../src/repositories/categoryRepository';
import * as transactionRepository from '../../src/repositories/transactionRepository';
import * as merchantRulesService from '../../src/services/merchantRulesService';
import { categorizePendingAutomationTransaction } from '../../src/services/transactions/transactionReviewService';
import * as transactionService from '../../src/services/transactions/transactionService';
import { findPersonalWorkspaceIdForUser } from '../../src/services/workspaceService';

vi.mock('../../src/repositories/transactionRepository', () => ({
  findById: vi.fn(),
  countNeedsReview: vi.fn(async () => 0),
}));
vi.mock('../../src/repositories/categoryRepository', () => ({ findMany: vi.fn() }));
vi.mock('../../src/services/merchantRulesService', () => ({ upsertRule: vi.fn() }));
vi.mock('../../src/services/transactions/transactionService', () => ({ update: vi.fn() }));
vi.mock('../../src/services/workspaceService', () => ({
  findPersonalWorkspaceIdForUser: vi.fn(),
}));

const USER_ID = '64b7f0c2a1b2c3d4e5f60718';
const OTHER_USER_ID = '64b7f0c2a1b2c3d4e5f60719';
const WORKSPACE_ID = new Types.ObjectId();
const TRANSACTION_ID = new Types.ObjectId().toString();
const CATEGORY_ID = new Types.ObjectId().toString();

const pendingTransaction = (overrides: Record<string, unknown> = {}) => ({
  _id: TRANSACTION_ID,
  userId: new Types.ObjectId(USER_ID),
  source: 'google_pay',
  name: 'a m p m',
  sourceMerchant: 'a m p m',
  reviewedAt: null,
  category: undefined,
  ...overrides,
});

const findById = vi.mocked(transactionRepository.findById);
const update = vi.mocked(transactionService.update);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(findPersonalWorkspaceIdForUser).mockResolvedValue(WORKSPACE_ID);
  vi.mocked(categoryRepository.findMany).mockResolvedValue([
    { _id: new Types.ObjectId(CATEGORY_ID) },
  ] as never);
  update.mockResolvedValue({ transaction: { sourceMerchant: 'a m p m' } } as never);
});

describe('categorizePendingAutomationTransaction', () => {
  it('sets the category on an unreviewed automation transaction and learns the merchant', async () => {
    findById.mockResolvedValue(pendingTransaction() as never);

    const result = await categorizePendingAutomationTransaction(
      USER_ID,
      TRANSACTION_ID,
      CATEGORY_ID,
      true
    );

    expect(result).toEqual({ changed: true });
    expect(update).toHaveBeenCalledWith(
      TRANSACTION_ID,
      { name: 'a m p m', categoryId: CATEGORY_ID },
      WORKSPACE_ID.toString(),
      USER_ID
    );
    expect(merchantRulesService.upsertRule).toHaveBeenCalledWith(USER_ID, 'a m p m', {
      alias: 'a m p m',
      categoryId: CATEGORY_ID,
    });
  });

  it('does not learn the merchant when applyToFuture is false', async () => {
    findById.mockResolvedValue(pendingTransaction() as never);

    await categorizePendingAutomationTransaction(USER_ID, TRANSACTION_ID, CATEGORY_ID, false);

    expect(merchantRulesService.upsertRule).not.toHaveBeenCalled();
  });

  it.each([
    ['does not exist', null],
    ['was entered manually', pendingTransaction({ source: 'manual' })],
    ['was imported from CSV', pendingTransaction({ source: 'csv' })],
    ['belongs to another user', pendingTransaction({ userId: new Types.ObjectId(OTHER_USER_ID) })],
  ])('answers 404 when the transaction %s', async (_label, transaction) => {
    findById.mockResolvedValue(transaction as never);

    await expect(
      categorizePendingAutomationTransaction(USER_ID, TRANSACTION_ID, CATEGORY_ID, true)
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects a malformed transaction id', async () => {
    await expect(
      categorizePendingAutomationTransaction(USER_ID, 'nope', CATEGORY_ID, true)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('is a no-op when the same category was already applied', async () => {
    findById.mockResolvedValue(
      pendingTransaction({
        reviewedAt: new Date(),
        category: { _id: new Types.ObjectId(CATEGORY_ID) },
      }) as never
    );

    const result = await categorizePendingAutomationTransaction(
      USER_ID,
      TRANSACTION_ID,
      CATEGORY_ID,
      true
    );

    expect(result).toEqual({ changed: false });
    expect(update).not.toHaveBeenCalled();
  });

  it('refuses to change a category on an already reviewed transaction', async () => {
    findById.mockResolvedValue(
      pendingTransaction({
        reviewedAt: new Date(),
        category: { _id: new Types.ObjectId() },
      }) as never
    );

    await expect(
      categorizePendingAutomationTransaction(USER_ID, TRANSACTION_ID, CATEGORY_ID, true)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('falls back to a default name when the transaction has none', async () => {
    findById.mockResolvedValue(pendingTransaction({ name: '', sourceMerchant: null }) as never);

    await categorizePendingAutomationTransaction(USER_ID, TRANSACTION_ID, CATEGORY_ID, true);

    expect(update).toHaveBeenCalledWith(
      TRANSACTION_ID,
      { name: 'Google Wallet', categoryId: CATEGORY_ID },
      WORKSPACE_ID.toString(),
      USER_ID
    );
  });
});
