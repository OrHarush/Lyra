import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import mongoose, { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMcpServer } from '../../src/mcp/mcpServer';
import * as readModel from '../../src/mcp/readModel';
import { ReadOnlyViolationError, runReadOnly } from '../../src/mcp/readOnlyGuard';

vi.mock('../../src/mcp/readModel', () => ({
  findWorkspace: vi.fn(),
  loadReferenceData: vi.fn(),
  findTransactions: vi.fn(),
  getMonthSummary: vi.fn(),
  getCashflowCalendar: vi.fn(),
  getCategoryTrends: vi.fn(),
  listRecurringTemplates: vi.fn(),
  listGoals: vi.fn(),
  getGoalProjection: vi.fn(),
  getInvestmentSummary: vi.fn(),
  getInvestmentHistory: vi.fn(),
}));

const mocked = vi.mocked(readModel);

const ids = {
  food: new Types.ObjectId().toString(),
  fuel: new Types.ObjectId().toString(),
  salary: new Types.ObjectId().toString(),
  checking: new Types.ObjectId().toString(),
  savings: new Types.ObjectId().toString(),
  visa: new Types.ObjectId().toString(),
};

const reference = {
  accounts: [
    { _id: ids.checking, name: 'Checking', balance: 1234500, isPrimary: true, currency: 'ILS' },
    { _id: ids.savings, name: 'Savings', balance: 500000, isPrimary: false, currency: 'ILS' },
  ],
  categories: [
    { _id: ids.food, name: 'Food', type: 'Expense' },
    { _id: ids.fuel, name: 'Fuel', type: 'Expense' },
    { _id: ids.salary, name: 'Salary', type: 'Income' },
  ],
  paymentMethods: [{ _id: ids.visa, name: '', key: 'visa', type: 'credit' }],
};

const tx = (overrides: Record<string, unknown>) => ({
  _id: new Types.ObjectId().toString(),
  type: 'Expense',
  amount: 10,
  date: new Date('2026-11-10T00:00:00Z'),
  name: 'Something',
  category: { _id: ids.food, name: 'Food' },
  account: { _id: ids.checking, name: 'Checking' },
  ...overrides,
});

const connect = async (workspaceId = new Types.ObjectId().toString()) => {
  const server = createMcpServer({ userId: new Types.ObjectId().toString(), workspaceId });
  const client = new Client({ name: 'test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return client;
};

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const client = await connect();
  const result = await client.callTool({ name, arguments: args });
  await client.close();

  return result as { isError?: boolean; content: Array<{ text: string }>; structuredContent?: any };
};

beforeEach(() => {
  mocked.loadReferenceData.mockResolvedValue(reference as never);
  mocked.findWorkspace.mockResolvedValue({
    name: 'Home',
    type: 'personal',
    currency: 'ILS',
  } as never);
});

afterEach(() => vi.clearAllMocks());

describe('tool registry', () => {
  it('exposes exactly the six read-only tools', async () => {
    const client = await connect();
    const { tools } = await client.listTools();

    expect(tools.map(tool => tool.name).sort()).toEqual([
      'analyzeSpending',
      'getCashflow',
      'getGoals',
      'getInvestments',
      'getOverview',
      'searchTransactions',
    ]);
    tools.forEach(tool => {
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
      expect(tool.annotations?.title).toBeTruthy();
    });
  });
});

describe('searchTransactions', () => {
  it('resolves names to ids and totals every match, not just the page', async () => {
    mocked.findTransactions.mockResolvedValue({
      data: [
        tx({ amount: 100, name: 'Wolt' }),
        tx({ amount: 40, name: 'Wolt' }),
        tx({ amount: 5, name: 'Wolt' }),
        tx({ type: 'Income', amount: 1000, name: 'Refund' }),
      ],
    } as never);

    const result = await call('searchTransactions', {
      categories: ['food'],
      accounts: ['check'],
      minAmount: 10,
      limit: 1,
      sortBy: 'amount',
    });

    expect(mocked.findTransactions.mock.calls[0][1]).toMatchObject({
      categoryIds: [ids.food],
      accountIds: [ids.checking],
    });
    expect(result.structuredContent.totals).toEqual({
      count: 3,
      income: 1000,
      expenses: 140,
      net: 860,
    });
    expect(result.structuredContent.transactions).toHaveLength(1);
    expect(result.structuredContent.transactions[0]).toMatchObject({
      amount: 1000,
      account: 'Checking',
    });
    expect(result.structuredContent.hasMore).toBe(true);
    expect(result.structuredContent.transactions[0]).not.toHaveProperty('note');
  });

  it('returns the available names when a filter matches nothing', async () => {
    const result = await call('searchTransactions', { categories: ['Travel'] });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Available categories: Food, Fuel, Salary');
    expect(mocked.findTransactions).not.toHaveBeenCalled();
  });

  it('rejects ranges over two years', async () => {
    const result = await call('searchTransactions', { from: '2020-01-01', to: '2026-01-01' });

    expect(result.isError).toBe(true);
  });
});

describe('analyzeSpending', () => {
  it('spans the year boundary for monthly totals', async () => {
    mocked.getCategoryTrends.mockResolvedValue({
      periods: [],
      asOf: '2026-01-15',
      categories: [],
    } as never);
    mocked.getMonthSummary.mockImplementation((async (_ws: string, { year }: { year: number }) =>
      Array.from({ length: 12 }, (_, month) => ({
        month,
        monthlyIncome: year * 0 + 100,
        monthlyExpenses: 40,
      }))) as never);

    const result = await call('analyzeSpending', { endMonth: '2026-01', months: 3 });

    expect(result.structuredContent.periods).toEqual(['2025-11', '2025-12', '2026-01']);
    expect(
      mocked.getMonthSummary.mock.calls.map(c => (c[1] as { year: number }).year).sort()
    ).toEqual([2025, 2026]);
    expect(result.structuredContent.byMonth[0]).toEqual({
      period: '2025-11',
      income: 100,
      expenses: 40,
      net: 60,
    });
  });
});

describe('getInvestments', () => {
  it('is unavailable on a shared workspace connection', async () => {
    mocked.findWorkspace.mockResolvedValue({
      name: 'Us',
      type: 'shared',
      currency: 'ILS',
    } as never);

    const result = await call('getInvestments');

    expect(result.structuredContent.available).toBe(false);
    expect(mocked.getInvestmentSummary).not.toHaveBeenCalled();
  });
});

describe('getCashflow', () => {
  it('defaults the balance to the primary account', async () => {
    mocked.getCashflowCalendar.mockResolvedValue({ days: [], upcoming: [] } as never);
    mocked.listRecurringTemplates.mockResolvedValue([] as never);

    const result = await call('getCashflow', { month: '2026-11' });

    expect(mocked.getCashflowCalendar.mock.calls[0][1]).toEqual({
      from: '2026-11-01',
      to: '2026-11-30',
      accountId: ids.checking,
    });
    expect(result.structuredContent.balanceAccount).toBe('Checking');
  });
});

describe('read-only guard', () => {
  const collectionProto = () =>
    mongoose.mongo.Collection.prototype as unknown as Record<
      string,
      (...args: unknown[]) => unknown
    >;

  it('rejects driver writes inside a read-only scope', async () => {
    await expect(
      runReadOnly(async () => collectionProto().updateMany.call({}, {}, {}))
    ).rejects.toThrow(ReadOnlyViolationError);
    await expect(
      runReadOnly(async () => collectionProto().aggregate.call({}, [{ $merge: 'x' }]))
    ).rejects.toThrow(ReadOnlyViolationError);
  });

  it('leaves writes outside the scope untouched', async () => {
    const attemptWrite = async () => {
      try {
        return await collectionProto().updateMany.call({}, {}, {});
      } catch (error) {
        return error;
      }
    };

    expect(await attemptWrite()).not.toBeInstanceOf(ReadOnlyViolationError);
  });
});
