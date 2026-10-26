export type CalendarEventKind = 'income' | 'expense' | 'cardBill';

export interface CalendarEventDto {
  id: string;
  kind: CalendarEventKind;
  name: string;
  amount: number;
  isVirtual: boolean;
  paymentMethodType: string | null;
  lastFourDigits: string | null;
  transactionCount: number;
}

export interface CalendarDayDto {
  date: string;
  balance: number | null;
  isProjected: boolean;
  events: CalendarEventDto[];
}

export interface DatedCalendarEvent {
  date: string;
  event: CalendarEventDto;
}
