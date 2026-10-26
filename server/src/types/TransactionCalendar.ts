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
  events: CalendarEvent[];
}
