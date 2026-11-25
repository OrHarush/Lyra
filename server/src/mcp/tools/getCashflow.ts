import { z } from 'zod';

import { CalendarDay } from '../../types/TransactionCalendar';
import * as readModel from '../readModel';
import { loadReference, resolveName, WorkspaceReference } from './reference';
import {
  defineTool,
  formatYearMonth,
  monthBounds,
  nowInLyraTime,
  parseYearMonth,
  roundMoney,
  toIsoDay,
  UNTRUSTED_TEXT_NOTICE,
  yearMonthArg,
} from './toolKit';

type RecurringTemplate = Awaited<ReturnType<typeof readModel.listRecurringTemplates>>[number];

export const getCashflow = defineTool({
  name: 'getCashflow',
  title: 'Cash flow and recurring payments',
  description:
    'Day-by-day cash flow for a month: each day with money in/out and the account balance ' +
    '(actual for past days, projected for future ones), plus the full list of active recurring ' +
    'payments and income (subscriptions, salary, rent, fixed bills). Use for "will I have enough ' +
    'at the end of the month", "what do I pay every month", or an account\'s balance history. ' +
    UNTRUSTED_TEXT_NOTICE,
  inputSchema: {
    month: yearMonthArg.describe('Month as YYYY-MM. Defaults to the current month.'),
    account: z
      .string()
      .optional()
      .describe('Account (name) whose balance to track. Defaults to the primary account.'),
  },
  run: async (args, { workspaceId }) => {
    const reference = await loadReference(workspaceId);
    const period = parseYearMonth(args.month);
    const { start, end } = monthBounds(period);
    const accountId =
      resolveName('accounts', args.account, reference.accounts) ??
      reference.accounts.find(entry => entry.account.isPrimary)?.id;

    const [calendar, templates] = await Promise.all([
      readModel.getCashflowCalendar(workspaceId, {
        from: toIsoDay(start),
        to: toIsoDay(end),
        accountId,
      }),
      readModel.listRecurringTemplates(workspaceId),
    ]);

    const days = calendar.days;

    return {
      month: formatYearMonth(period),
      balanceAccount: accountId ? reference.nameOf(accountId) : null,
      openingBalance: days[0]?.balance ?? null,
      closingBalance: days[days.length - 1]?.balance ?? null,
      lowestBalance: lowestBalanceOf(days),
      days: days.filter(day => day.events.length > 0).map(presentDay),
      recurring: activeTemplates(templates).map(template => presentTemplate(template, reference)),
    };
  },
});

const lowestBalanceOf = (days: CalendarDay[]) =>
  days.reduce<{ date: string; balance: number } | null>((lowest, day) => {
    if (day.balance === null || (lowest && lowest.balance <= day.balance)) {
      return lowest;
    }

    return { date: day.date.slice(0, 10), balance: day.balance };
  }, null);

const presentDay = (day: CalendarDay) => ({
  date: day.date.slice(0, 10),
  balance: day.balance,
  isProjected: day.isProjected,
  events: day.events.map(event => ({
    name: event.name,
    kind: event.kind,
    amount: event.amount,
    isRecurring: event.isVirtual,
  })),
});

const activeTemplates = (templates: RecurringTemplate[]) => {
  const now = nowInLyraTime();

  return templates.filter(
    template => template.isActive && (!template.endDate || new Date(template.endDate) >= now)
  );
};

const presentTemplate = (template: RecurringTemplate, reference: WorkspaceReference) => ({
  name: template.name ?? null,
  type: template.type,
  amount: roundMoney(template.amount),
  frequency: template.frequency,
  dayOfMonth: template.dayOfMonth,
  category: reference.nameOf(template.category),
  account: reference.nameOf(template.account ?? template.fromAccount),
  paymentMethod: reference.nameOf(template.paymentMethod),
  endsOn: template.endDate ? toIsoDay(new Date(template.endDate)) : null,
});
