import 'dayjs/locale/he';
import 'dayjs/locale/en';

import dayjs from 'dayjs';

const numberFormatter = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });

export const formatGoalAmount = (value: number): string =>
  numberFormatter.format(Math.max(value, 0));

export const parseTargetDate = (value: Date | string | undefined | null): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatLocalizedMonth = (date: Date | string, language: string): string =>
  dayjs(date)
    .locale(language === 'he' ? 'he' : 'en')
    .format('MMMM YYYY');
