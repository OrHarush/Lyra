import type { PurchaseCurrency } from '@/types/Investment';

const BIG_AMOUNT_THRESHOLD = 1000;

// Above 1,000 the fractions are noise; below it they carry meaning.
export const roundForDisplay = (value: number) =>
  Math.abs(value) >= BIG_AMOUNT_THRESHOLD ? Math.round(value) : value;

export const formatPercent = (ratio: number, hasSign = false) => {
  const percent = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(ratio * 100));
  const sign = ratio < 0 ? '−' : hasSign && ratio > 0 ? '+' : '';

  return `${sign}${percent}%`;
};

export const formatWholePercent = (ratio: number) => `${Math.round(Math.abs(ratio * 100))}%`;

// Plain YYYY-MM-DD strings are reordered, never parsed, so the local timezone cannot shift the day.
export const formatIsoDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-');

  return `${day}/${month}/${year}`;
};

export const ILS_DISPLAY = { currency: 'ILS', locale: 'he-IL' } as const;
export const USD_DISPLAY = { currency: 'USD', locale: 'en-US' } as const;

export const displayOf = (currency: PurchaseCurrency) =>
  currency === 'USD' ? USD_DISPLAY : ILS_DISPLAY;

export const formatShortDate = (isoDate: string, locale: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day))
  );
};

export const formatMonthYearLabel = (isoDate: string, locale: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

export const formatMonthYearLong = (isoDate: string, locale: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day))
  );
};

export const formatMonthLabel = (isoDate: string, locale: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day))
  );
};
