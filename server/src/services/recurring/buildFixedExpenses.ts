import { FixedExpenseKind } from '@lyra/shared';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { IRecurringTemplatePopulated } from '../../types/RecurringTemplate';
import { clampedDate } from '../transactions/buildVirtualTransactions';
import { isOccurrenceMonth, occurrencesPerYear } from './occurrence';

dayjs.extend(utc);

// Longest gap between occurrences is a year; one extra month covers clamping at month ends.
const MAX_MONTHS_TO_NEXT_OCCURRENCE = 13;

export interface FixedExpense {
  template: IRecurringTemplatePopulated;
  // Null when the user never chose a kind, so the page can offer to classify it.
  kind: FixedExpenseKind | null;
  nextDate: Date;
  monthlyAmount: number;
  yearlyAmount: number;
}

export interface FixedExpenseList {
  items: FixedExpense[];
  totals: { monthly: number; yearly: number };
}

// Amounts stay in cents. Savings transfers are money kept, not money spent, so they're left out.
export const buildFixedExpenses = (
  templates: IRecurringTemplatePopulated[],
  today: Date
): FixedExpenseList => {
  const items = templates
    .filter(template => template.type === 'Expense' && template.category?.type !== 'Savings')
    .map(template => toFixedExpense(template, today))
    .filter((item): item is FixedExpense => item !== null)
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

  const yearly = items.reduce((total, item) => total + item.yearlyAmount, 0);

  return { items, totals: { monthly: Math.round(yearly / 12), yearly } };
};

export const findNextOccurrence = (
  template: Pick<IRecurringTemplatePopulated, 'frequency' | 'startDate' | 'endDate' | 'dayOfMonth'>,
  today: Date
): Date | null => {
  const startOfToday = dayjs.utc(today).startOf('day');
  const startMonth = dayjs.utc(template.startDate).startOf('month');
  const firstMonth = startMonth.isAfter(startOfToday) ? startMonth : startOfToday.startOf('month');

  for (let offset = 0; offset <= MAX_MONTHS_TO_NEXT_OCCURRENCE; offset++) {
    const month = firstMonth.add(offset, 'month');

    if (hasEnded(template.endDate, month)) {
      return null;
    }

    if (!isOccurrenceMonth(template.frequency, template.startDate, month)) {
      continue;
    }

    const date = clampedDate(month.year(), month.month(), template.dayOfMonth);

    if (!dayjs.utc(date).isBefore(startOfToday)) {
      return date;
    }
  }

  return null;
};

const toFixedExpense = (template: IRecurringTemplatePopulated, today: Date): FixedExpense | null => {
  const nextDate = findNextOccurrence(template, today);

  if (!nextDate) {
    return null;
  }

  const yearlyAmount = template.amount * occurrencesPerYear(template.frequency);

  return {
    template,
    kind: template.kind ?? null,
    nextDate,
    monthlyAmount: Math.round(yearlyAmount / 12),
    yearlyAmount,
  };
};

const hasEnded = (endDate: Date | undefined, month: Dayjs) =>
  !!endDate && month.isAfter(dayjs.utc(endDate).startOf('month'));
