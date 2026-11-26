import { fromCents } from '@lyra/shared';
import { Types } from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import Account from '../../src/models/Account';
import * as recurringTemplateRepository from '../../src/repositories/recurringTemplateRepository';
import * as transactionRepository from '../../src/repositories/transactionRepository';
import { GetTransactionsOptions } from '../../src/schemas/transactionSchemas';
import { computeAccountBalance, getBalanceForecast } from '../../src/services/balanceService';
import * as transactionService from '../../src/services/transactions/transactionService';
import { IRecurringTemplatePopulated } from '../../src/types/RecurringTemplate';
import { ITransactionPopulated } from '../../src/types/Transaction';
import {
  ACCOUNT_ID,
  category,
  creditCard,
  day,
  expense,
  income,
  monthlyExpenseTemplate,
  OTHER_ACCOUNT_ID,
  transfer,
} from './fixtures';

vi.mock('../../src/repositories/transactionRepository', () => ({
  findMany: vi.fn(),
  findAwaitingApproval: vi.fn(async () => []),
}));
vi.mock('../../src/repositories/recurringTemplateRepository', () => ({
  findActiveForDateRangePopulated: vi.fn(),
}));

const WORKSPACE_ID = new Types.ObjectId().toString();
const NOW = new Date('2026-11-10T09:00:00.000Z');
const CHECKPOINT = day('2026-11-01');
const CHECKPOINT_BALANCE = 10_000;

let transactions: ITransactionPopulated[] = [];
let templates: IRecurringTemplatePopulated[] = [];

const touchesAccount = (tx: ITransactionPopulated, accountId?: string) =>
  !accountId ||
  [tx.account, tx.fromAccount, tx.toAccount].some(a => a?._id.toString() === accountId);

const findTransactions = async (_workspaceId: string, options: GetTransactionsOptions) =>
  transactions.filter(
    tx =>
      touchesAccount(tx, options.accountId) &&
      (!options.from || tx.date! >= options.from) &&
      (!options.to || tx.date! <= options.to)
  );

const findTemplates = async (_workspaceId: string, from: Date, to: Date) =>
  templates.filter(
    template => template.startDate <= to && (!template.endDate || template.endDate >= from)
  );

const currentBalance = async () =>
  fromCents((await computeAccountBalance(WORKSPACE_ID, ACCOUNT_ID)).finalBalance);

const calendarBalance = async (isoDay: string) => {
  const month = isoDay.slice(0, 7);
  const { days } = await transactionService.getTransactionCalendar(WORKSPACE_ID, {
    from: `${month}-01`,
    to: isoDay,
    accountId: ACCOUNT_ID,
  });

  return days.find(entry => entry.date === isoDay)?.balance;
};

// The only part of this file that knows how the projection is obtained.
const projectedBalance = async (year: number, month: number) =>
  (await getBalanceForecast(WORKSPACE_ID, ACCOUNT_ID, { year, month: month - 1 })).projectedBalance;

const monthTotals = (year: number, month: number) =>
  transactionService.getTransactionSummary(WORKSPACE_ID, {
    year,
    month: month - 1,
    accountId: ACCOUNT_ID,
    from: undefined,
  });

const novemberBalances = async () => ({
  current: await currentBalance(),
  calendar: await calendarBalance('2026-11-30'),
  projected: await projectedBalance(2026, 11),
});

describe('balance numbers', () => {
  const originalTimezone = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'UTC';
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterAll(() => {
    vi.useRealTimers();
    process.env.TZ = originalTimezone;
  });

  beforeEach(() => {
    transactions = [];
    templates = [];
    vi.mocked(transactionRepository.findMany).mockImplementation(findTransactions);
    vi.mocked(recurringTemplateRepository.findActiveForDateRangePopulated).mockImplementation(
      findTemplates
    );
    vi.spyOn(Account, 'findOne').mockResolvedValue({
      name: 'Main',
      checkpointBalance: CHECKPOINT_BALANCE * 100,
      checkpointDate: CHECKPOINT,
    } as never);
  });

  it('income', async () => {
    transactions = [income(1000, '2026-11-05'), income(500, '2026-11-20')];

    expect(await novemberBalances()).toEqual({
      current: 11_000,
      calendar: 11_500,
      projected: 11_500,
    });
  });

  it('expense', async () => {
    transactions = [expense(300, '2026-11-05'), expense(200, '2026-11-20')];

    expect(await novemberBalances()).toEqual({ current: 9700, calendar: 9500, projected: 9500 });
  });

  it('transfers out of and into the account', async () => {
    transactions = [
      transfer(400, '2026-11-03', ACCOUNT_ID, OTHER_ACCOUNT_ID),
      transfer(150, '2026-11-25', OTHER_ACCOUNT_ID, ACCOUNT_ID),
    ];

    expect(await novemberBalances()).toEqual({ current: 9600, calendar: 9750, projected: 9750 });
  });

  it('money moved to savings', async () => {
    transactions = [
      expense(600, '2026-11-04', { category: category('Savings') }),
      expense(500, '2026-11-20', { category: category('Savings') }),
    ];

    expect(await novemberBalances()).toEqual({ current: 9400, calendar: 8900, projected: 8900 });
    expect(await monthTotals(2026, 11)).toMatchObject({ monthlyExpenses: 0 });
  });

  it('money taken out of savings', async () => {
    transactions = [income(200, '2026-11-20', { category: category('Savings') })];

    expect(await novemberBalances()).toEqual({
      current: 10_000,
      calendar: 10_200,
      projected: 10_200,
    });
    expect(await monthTotals(2026, 11)).toMatchObject({ monthlyIncome: 0 });
  });

  describe('credit card', () => {
    it('charges a purchase made before the billing day on that day', async () => {
      transactions = [expense(300, '2026-11-05', { paymentMethod: creditCard(15) })];

      expect(await novemberBalances()).toEqual({
        current: 10_000,
        calendar: 9700,
        projected: 9700,
      });
    });

    it('has already charged once the billing day passed', async () => {
      transactions = [expense(300, '2026-11-03', { paymentMethod: creditCard(5) })];

      expect(await novemberBalances()).toEqual({ current: 9700, calendar: 9700, projected: 9700 });
    });

    it('charges a purchase made after the billing day next month, but projects it in its own month', async () => {
      transactions = [expense(300, '2026-11-08', { paymentMethod: creditCard(2) })];

      expect(await novemberBalances()).toEqual({
        current: 10_000,
        calendar: 10_000,
        projected: 9700,
      });
      expect(await calendarBalance('2026-12-02')).toBe(9700);
      expect(await projectedBalance(2026, 12)).toBe(9700);
      expect(await monthTotals(2026, 11)).toMatchObject({ monthlyExpenses: 300 });
    });

    it('charges a purchase made on the billing day next month, but projects it in its own month', async () => {
      transactions = [expense(300, '2026-11-15', { paymentMethod: creditCard(15) })];

      expect(await novemberBalances()).toEqual({
        current: 10_000,
        calendar: 10_000,
        projected: 9700,
      });
      expect(await calendarBalance('2026-12-15')).toBe(9700);
    });

    it('counts a purchase from before the checkpoint that is charged after it', async () => {
      transactions = [expense(300, '2026-10-25', { paymentMethod: creditCard(5) })];

      expect(await novemberBalances()).toEqual({ current: 9700, calendar: 9700, projected: 9700 });
    });
  });

  it('ignores rows on or before the checkpoint but still walks the calendar back over them', async () => {
    transactions = [
      expense(999, '2026-10-20'),
      expense(50, '2026-11-01'),
      expense(100, '2026-11-05'),
    ];

    expect(await novemberBalances()).toEqual({ current: 9900, calendar: 9900, projected: 9900 });
    expect(await calendarBalance('2026-10-15')).toBe(11_049);
  });

  it('splits rows on both sides of a month boundary', async () => {
    transactions = [expense(100, '2026-11-30'), expense(200, '2026-12-01')];

    expect(await novemberBalances()).toEqual({
      current: 10_000,
      calendar: 9900,
      projected: 9900,
    });
    expect(await calendarBalance('2026-12-01')).toBe(9700);
    expect(await projectedBalance(2026, 12)).toBe(9700);
  });

  describe('recurring rows', () => {
    it('counts an upcoming one in the forecast only', async () => {
      templates = [monthlyExpenseTemplate(100, 20, '2026-11-20')];

      expect(await novemberBalances()).toEqual({
        current: 10_000,
        calendar: 9900,
        projected: 9900,
      });
    });

    it('ignores one whose date passed without being generated', async () => {
      templates = [monthlyExpenseTemplate(100, 5, '2026-11-05')];

      expect(await novemberBalances()).toEqual({
        current: 10_000,
        calendar: 10_000,
        projected: 10_000,
      });
    });

    it('clamps day 31 to the end of a shorter month', async () => {
      templates = [
        monthlyExpenseTemplate(100, 31, '2026-10-31', { lastGeneratedDate: day('2026-10-31') }),
      ];

      expect(await calendarBalance('2026-11-29')).toBe(10_000);
      expect(await calendarBalance('2026-11-30')).toBe(9900);
      expect(await projectedBalance(2026, 11)).toBe(9900);
      expect(await calendarBalance('2027-02-28')).toBe(9600);
      expect(await projectedBalance(2027, 2)).toBe(9600);
    });
  });

  it('looks two and more months ahead', async () => {
    templates = [monthlyExpenseTemplate(100, 20, '2026-11-20')];

    expect(await calendarBalance('2027-01-31')).toBe(9700);
    expect(await projectedBalance(2027, 1)).toBe(9700);
    expect(await calendarBalance('2027-03-31')).toBe(9500);
    expect(await projectedBalance(2027, 3)).toBe(9500);
  });

  describe('rows that belong to an earlier month than their date', () => {
    it('salary on Dec 1 flagged as November lands in November’s projection', async () => {
      transactions = [income(1000, '2026-12-01', { belongToPreviousMonth: true })];

      expect(await novemberBalances()).toEqual({
        current: 10_000,
        calendar: 10_000,
        projected: 11_000,
      });
      expect(await calendarBalance('2026-12-01')).toBe(11_000);
      expect(await monthTotals(2026, 11)).toMatchObject({ monthlyIncome: 1000 });
    });

    it('an expense on Dec 15 flagged as November lands in November’s projection', async () => {
      transactions = [expense(400, '2026-12-15', { belongToPreviousMonth: true })];

      expect(await novemberBalances()).toEqual({
        current: 10_000,
        calendar: 10_000,
        projected: 9600,
      });
      expect(await calendarBalance('2026-12-14')).toBe(10_000);
      expect(await calendarBalance('2026-12-15')).toBe(9600);
    });

    it('an expense on Dec 29 flagged as November still lands in November’s projection', async () => {
      transactions = [expense(250, '2026-12-29', { belongToPreviousMonth: true })];

      expect(await projectedBalance(2026, 11)).toBe(9750);
      expect(await calendarBalance('2026-12-28')).toBe(10_000);
      expect(await calendarBalance('2026-12-29')).toBe(9750);
    });

    it('stays counted when looking further ahead', async () => {
      transactions = [expense(250, '2026-12-29', { belongToPreviousMonth: true })];

      expect(await projectedBalance(2026, 12)).toBe(9750);
      expect(await projectedBalance(2027, 2)).toBe(9750);
    });

    it('a Jan 3 row flagged as December belongs to December, not November', async () => {
      transactions = [expense(500, '2027-01-03', { belongToPreviousMonth: true })];

      expect(await projectedBalance(2026, 11)).toBe(10_000);
      expect(await projectedBalance(2026, 12)).toBe(9500);
    });

    it('an unflagged December row stays out of November’s projection', async () => {
      transactions = [expense(500, '2026-12-05'), expense(70, '2026-12-29')];

      expect(await projectedBalance(2026, 11)).toBe(10_000);
      expect(await projectedBalance(2026, 12)).toBe(9430);
    });

    it('a card purchase on Dec 1 before the billing day belongs to November', async () => {
      transactions = [expense(300, '2026-12-01', { paymentMethod: creditCard(10) })];

      expect(await projectedBalance(2026, 11)).toBe(9700);
      expect(await calendarBalance('2026-12-09')).toBe(10_000);
      expect(await calendarBalance('2026-12-10')).toBe(9700);
    });

    it('a card purchase on Dec 10, the billing day, belongs to December', async () => {
      transactions = [expense(300, '2026-12-10', { paymentMethod: creditCard(10) })];

      expect(await projectedBalance(2026, 11)).toBe(10_000);
      expect(await projectedBalance(2026, 12)).toBe(9700);
    });

    it('an October card purchase charged after today is still owed in November', async () => {
      transactions = [expense(300, '2026-10-28', { paymentMethod: creditCard(15) })];

      expect(await novemberBalances()).toEqual({
        current: 10_000,
        calendar: 9700,
        projected: 9700,
      });
    });

    it('a recurring salary flagged as previous month lands in the month before each payday', async () => {
      templates = [
        monthlyExpenseTemplate(2000, 1, '2026-12-01', {
          type: 'Income',
          category: category('Income') as never,
          belongToPreviousMonth: true,
        }),
      ];

      expect(await projectedBalance(2026, 11)).toBe(12_000);
      expect(await projectedBalance(2026, 12)).toBe(14_000);
      expect(await calendarBalance('2026-11-30')).toBe(10_000);
    });

    it('does not count a flagged row twice once its date has passed', async () => {
      transactions = [expense(400, '2026-11-02', { belongToPreviousMonth: true })];

      expect(await novemberBalances()).toEqual({ current: 9600, calendar: 9600, projected: 9600 });
    });
  });

  it('matches the production dashboard: card bill, loan and salary on Dec 1-2 belong to November', async () => {
    const amex = creditCard(1);
    transactions = [
      income(3733, '2026-11-05'),
      expense(8000, '2026-11-12', { paymentMethod: amex }),
      expense(991.5, '2026-11-20', { paymentMethod: amex }),
      income(1, '2026-12-01', { belongToPreviousMonth: true }),
      expense(1000, '2026-12-02', { belongToPreviousMonth: true }),
    ];

    expect(await getBalanceForecast(WORKSPACE_ID, ACCOUNT_ID, { year: 2026, month: 10 })).toEqual({
      currentBalance: 13_733,
      expectedIncome: 1,
      expectedExpenses: 9991.5,
      projectedBalance: 3742.5,
    });
    expect(await calendarBalance('2026-11-30')).toBe(13_733);
    expect(await calendarBalance('2026-12-02')).toBe(3742.5);
  });

  it('an upcoming row without a category', async () => {
    transactions = [expense(100, '2026-11-20', { category: undefined })];

    expect(await novemberBalances()).toEqual({
      current: 10_000,
      calendar: 9900,
      projected: 9900,
    });
  });
  it('answers a cached client asking the summary for a projection', async () => {
    transactions = [expense(600, '2026-11-20', { category: category('Savings') })];

    expect(
      await transactionService.getTransactionSummary(WORKSPACE_ID, {
        year: 2026,
        month: 10,
        accountId: ACCOUNT_ID,
        from: CHECKPOINT,
      })
    ).toEqual({
      monthlyIncome: 0,
      monthlyExpenses: 600,
      pendingPriorIncome: 0,
      pendingPriorExpenses: 0,
    });
  });
});
