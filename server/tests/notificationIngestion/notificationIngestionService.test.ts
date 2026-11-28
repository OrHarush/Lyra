import { IngestNotificationDTO } from '@lyra/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lyraTransactions } from '../../src/notificationIngestion/lyraAdapters';
import * as ingestionRepository from '../../src/notificationIngestion/notificationIngestionRepository';
import { ingestNotification } from '../../src/notificationIngestion/notificationIngestionService';

vi.mock('../../src/notificationIngestion/notificationIngestionRepository', () => ({
  claim: vi.fn(),
  recordResult: vi.fn(),
  releaseClaim: vi.fn(),
}));

vi.mock('../../src/notificationIngestion/lyraAdapters', () => ({
  lyraTransactions: { createAutomationTransaction: vi.fn() },
}));

const USER_ID = 'user-1';

const walletNotification = (
  overrides: Partial<IngestNotificationDTO> = {}
): IngestNotificationDTO => ({
  eventKey: 'k'.repeat(64),
  packageName: 'com.google.android.apps.walletnfcrel',
  title: 'a m p m',
  text: '₪44.80 with American Express Hever ••1135',
  postedAt: '2026-11-28T14:00:00+02:00',
  appVersion: '1.0.0',
  ...overrides,
});

const claim = vi.mocked(ingestionRepository.claim);
const recordResult = vi.mocked(ingestionRepository.recordResult);
const releaseClaim = vi.mocked(ingestionRepository.releaseClaim);
const createTransaction = vi.mocked(lyraTransactions.createAutomationTransaction);

beforeEach(() => {
  vi.clearAllMocks();
  claim.mockResolvedValue('claimed');
  createTransaction.mockResolvedValue({ transactionId: 'tx-1', categoryId: null });
});

describe('ingestNotification', () => {
  it('creates the real sample on card 1135 with postedAt as the date', async () => {
    const result = await ingestNotification(USER_ID, walletNotification());

    expect(createTransaction).toHaveBeenCalledWith({
      userId: USER_ID,
      rawTitle: 'a m p m',
      merchantKeys: ['a m p m', 'ampm'],
      amount: 44.8,
      type: 'Expense',
      note: undefined,
      paymentLast4: '1135',
      date: '2026-11-28T14:00:00+02:00',
    });
    expect(recordResult).toHaveBeenCalledWith(USER_ID, 'k'.repeat(64), {
      outcome: 'created',
      transactionId: 'tx-1',
      rawText: null,
    });
    expect(result).toEqual({ outcome: 'created', transactionId: 'tx-1', needsCategory: true });
  });

  it('reports needsCategory false when a merchant rule set the category', async () => {
    createTransaction.mockResolvedValue({ transactionId: 'tx-1', categoryId: 'cat-1' });

    const result = await ingestNotification(USER_ID, walletNotification());

    expect(result.needsCategory).toBe(false);
  });

  it('returns duplicate without creating anything when the eventKey was already claimed', async () => {
    claim.mockResolvedValue('duplicate');

    const result = await ingestNotification(USER_ID, walletNotification());

    expect(result).toEqual({ outcome: 'duplicate', transactionId: null, needsCategory: false });
    expect(createTransaction).not.toHaveBeenCalled();
    expect(recordResult).not.toHaveBeenCalled();
  });

  it('ignores notifications from any other package without parsing them', async () => {
    const result = await ingestNotification(
      USER_ID,
      walletNotification({ packageName: 'com.whatsapp', text: '₪44.80 with Visa ••1234' })
    );

    expect(result).toEqual({ outcome: 'ignored', transactionId: null, needsCategory: false });
    expect(createTransaction).not.toHaveBeenCalled();
    expect(recordResult).toHaveBeenCalledWith(USER_ID, 'k'.repeat(64), {
      outcome: 'ignored',
      transactionId: null,
      rawText: null,
    });
  });

  it('queues a parse failure at amount 0 and stores the raw text', async () => {
    const result = await ingestNotification(
      USER_ID,
      walletNotification({ text: 'You paid ₪44.80 at ampm' })
    );

    expect(createTransaction).toHaveBeenCalledWith(expect.objectContaining({ amount: 0 }));
    expect(recordResult).toHaveBeenCalledWith(USER_ID, 'k'.repeat(64), {
      outcome: 'parse_failed',
      transactionId: 'tx-1',
      rawText: 'You paid ₪44.80 at ampm',
    });
    expect(result.outcome).toBe('parse_failed');
  });

  it('releases the claim when creating the transaction fails, so a retry is not a duplicate', async () => {
    createTransaction.mockRejectedValue(new Error('db down'));

    await expect(ingestNotification(USER_ID, walletNotification())).rejects.toThrow('db down');
    expect(releaseClaim).toHaveBeenCalledWith(USER_ID, 'k'.repeat(64));
    expect(recordResult).not.toHaveBeenCalled();
  });
});
