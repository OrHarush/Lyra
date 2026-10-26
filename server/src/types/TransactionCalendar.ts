export type CalendarEventKind = 'income' | 'expense' | 'cardBill';

export interface CalendarEvent {
  id: string;
  kind: CalendarEventKind;
  name: string;
  amount: number;
  isVirtual: boolean;
  paymentMethodType: string | null;
  lastFourDigits: string | null;
  transactionCount: number;
}

export interface CalendarDay {
  date: string;
  balance: number | null;
  isProjected: boolean;
  events: CalendarEvent[];
}

export interface DatedCalendarEvent {
  date: string;
  event: CalendarEvent;
}

export interface TransactionCalendar {
  days: CalendarDay[];
  upcoming: DatedCalendarEvent[];
}

export interface CalendarBalanceContext {
  currentBalance: number;
  now: Date;
}
