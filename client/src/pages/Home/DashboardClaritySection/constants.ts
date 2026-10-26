import { Dayjs } from 'dayjs';
import { TFunction } from 'i18next';

import { CalendarDayDto, CalendarEventKind } from '@/types/TransactionCalendar';

export const CLARITY_FIGURES = {
  balance: 6800,
  projected: 3600,
  income: 12000,
  expenses: 9150,
  breakdown: {
    futureIncome: 2000,
    futureExpenses: 5200,
    pendingPriorExpenses: 0,
  },
} as const;

export type AnnotationColor = 'purple' | 'grey';

export type AnnotationKey = 'projected' | 'balance' | 'why';

export interface ClarityCard {
  key: AnnotationKey;
  color?: AnnotationColor;
}

export const CLARITY_CARDS: ClarityCard[] = [
  { key: 'projected', color: 'purple' },
  { key: 'balance', color: 'grey' },
  { key: 'why' },
];

export const DEMO_SELECTED_DAY = 2;

const DEMO_EVENTS: { day: number; key: string; kind: CalendarEventKind; amount: number; count?: number }[] = [
  { day: 1, key: 'rent', kind: 'expense', amount: 5200 },
  { day: 2, key: 'visa', kind: 'cardBill', amount: 4850, count: 37 },
  { day: 10, key: 'salary', kind: 'income', amount: 12000 },
  { day: 15, key: 'max', kind: 'cardBill', amount: 2130, count: 14 },
  { day: 28, key: 'insurance', kind: 'expense', amount: 320 },
];

export const buildDemoCalendarDays = (month: Dayjs, t: TFunction<'overview'>): CalendarDayDto[] =>
  DEMO_EVENTS.map(({ day, key, kind, amount, count = 1 }) => ({
    date: month.date(day).format('YYYY-MM-DD'),
    events: [
      {
        id: key,
        kind,
        name: t(`calendar.demo.${key}`),
        amount,
        isVirtual: kind !== 'cardBill',
        paymentMethodType: null,
        lastFourDigits: kind === 'cardBill' ? '1234' : null,
        transactionCount: count,
      },
    ],
  }));
