import { fromCents } from '@lyra/shared';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { CalendarDay, CalendarEvent } from '../../types/TransactionCalendar';
import { ITransactionPopulated } from '../../types/Transaction';
import { getEffectiveBalanceDate } from '../../utils/transaction';

dayjs.extend(utc);

const KIND_ORDER: Record<CalendarEvent['kind'], number> = { income: 0, cardBill: 1, expense: 2 };

export const buildCalendarDays = (
  transactions: ITransactionPopulated[],
  year: number,
  month: number,
  accountId?: string
): CalendarDay[] => {
  const eventsByDate = new Map<string, Map<string, CalendarEvent>>();

  for (const tx of transactions) {
    if (!isCalendarCandidate(tx, accountId)) {
      continue;
    }

    const effectiveDate = dayjs.utc(getEffectiveBalanceDate(tx));

    if (effectiveDate.year() !== year || effectiveDate.month() !== month) {
      continue;
    }

    const dateKey = effectiveDate.format('YYYY-MM-DD');
    const dayEvents = eventsByDate.get(dateKey) ?? new Map<string, CalendarEvent>();

    addToDay(dayEvents, tx);
    eventsByDate.set(dateKey, dayEvents);
  }

  return [...eventsByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, events]) => ({ date, events: toSortedEvents(events) }));
};

const isCalendarCandidate = (tx: ITransactionPopulated, accountId?: string) => {
  if (!tx.date || (tx.type !== 'Income' && tx.type !== 'Expense')) {
    return false;
  }

  return !accountId || tx.account?._id.toString() === accountId;
};

const isCardBillTransaction = (tx: ITransactionPopulated) =>
  tx.paymentMethod?.type === 'Credit Card' && typeof tx.paymentMethod.billingDay === 'number';

const signedAmount = (tx: ITransactionPopulated) => (tx.type === 'Income' ? tx.amount : -tx.amount);

const addToDay = (dayEvents: Map<string, CalendarEvent>, tx: ITransactionPopulated) => {
  if (!isCardBillTransaction(tx)) {
    const id = String(tx._id);
    dayEvents.set(id, {
      id,
      kind: tx.type === 'Income' ? 'income' : 'expense',
      name: tx.name ?? '',
      amount: tx.amount,
      isVirtual: !!tx.isVirtual,
      paymentMethodType: tx.paymentMethod?.type ?? null,
      lastFourDigits: null,
      transactionCount: 1,
    });

    return;
  }

  const paymentMethod = tx.paymentMethod!;
  const billId = `bill-${String(paymentMethod._id)}`;
  const bill = dayEvents.get(billId);

  // Bills accumulate a signed total so refunds on the card reduce the charge.
  if (bill) {
    bill.amount += -signedAmount(tx);
    bill.transactionCount += 1;
    bill.isVirtual = bill.isVirtual && !!tx.isVirtual;

    return;
  }

  dayEvents.set(billId, {
    id: billId,
    kind: 'cardBill',
    name: paymentMethod.name ?? paymentMethod.type,
    amount: -signedAmount(tx),
    isVirtual: !!tx.isVirtual,
    paymentMethodType: paymentMethod.type,
    lastFourDigits: paymentMethod.lastFourDigits ?? null,
    transactionCount: 1,
  });
};

const toSortedEvents = (events: Map<string, CalendarEvent>): CalendarEvent[] =>
  [...events.values()]
    .map(event => ({ ...event, amount: fromCents(event.amount) }))
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || b.amount - a.amount);
