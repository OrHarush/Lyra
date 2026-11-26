import { RecurringFrequency } from '@lyra/shared';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const MONTHS_BETWEEN: Record<RecurringFrequency, number> = {
  Monthly: 1,
  Bimonthly: 2,
  Yearly: 12,
};

// Occurrences are phased on the start month: a two-month bill starting in January runs in
// January, March, May and so on.
export const isOccurrenceMonth = (
  frequency: RecurringFrequency,
  startDate: Date,
  month: Dayjs
): boolean => {
  const monthsSinceStart = month.startOf('month').diff(dayjs.utc(startDate).startOf('month'), 'month');

  return monthsSinceStart >= 0 && monthsSinceStart % MONTHS_BETWEEN[frequency] === 0;
};

export const occurrencesPerYear = (frequency: RecurringFrequency) => 12 / MONTHS_BETWEEN[frequency];
