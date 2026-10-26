import dayjs, { Dayjs } from 'dayjs';

import { CalendarDayDto, CalendarEventDto, DatedCalendarEvent } from '@/types/TransactionCalendar';

export const countCalendarWeeks = (month: Dayjs) =>
  Math.ceil((month.startOf('month').day() + month.daysInMonth()) / 7);

export const getVisibleRange = (month: Dayjs) => {
  const monthStart = month.startOf('month');
  const monthEnd = month.endOf('month').startOf('day');

  return {
    start: monthStart.subtract(monthStart.day(), 'day'),
    end: monthEnd.add(6 - monthEnd.day(), 'day'),
  };
};

export const listVisibleDays = (month: Dayjs) => {
  const { start } = getVisibleRange(month);

  return Array.from({ length: countCalendarWeeks(month) * 7 }, (_, index) =>
    start.add(index, 'day')
  );
};

export const isInMonth = (date: string, month: Dayjs) => dayjs(date).isSame(month, 'month');

export const isOpenCardBill = (event: CalendarEventDto, date: string, today: Dayjs) =>
  event.kind === 'cardBill' && dayjs(date).isAfter(today, 'day');

export const toSignedAmount = (event: CalendarEventDto) =>
  event.kind === 'income' ? event.amount : -event.amount;

export const isIncomeEvent = (event: CalendarEventDto) => event.kind === 'income';

export const flattenCalendarEvents = (days: CalendarDayDto[]): DatedCalendarEvent[] =>
  days.flatMap(day => day.events.map(event => ({ date: day.date, event })));

export const selectEventsFrom = (days: CalendarDayDto[], fromDate: string) =>
  flattenCalendarEvents(days.filter(day => day.date >= fromDate));

export const selectLargestEvents = (days: CalendarDayDto[], limit: number) =>
  flattenCalendarEvents(days)
    .sort((a, b) => b.event.amount - a.event.amount)
    .slice(0, limit);

export const sumSignedAmounts = (events: DatedCalendarEvent[]) =>
  events.reduce((total, { event }) => total + toSignedAmount(event), 0);

export const findDay = (days: CalendarDayDto[], date: string): CalendarDayDto =>
  days.find(day => day.date === date) ?? { date, balance: null, isProjected: false, events: [] };
