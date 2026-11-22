// Dates here are plain YYYY-MM-DD strings; they never pass through the local timezone.

const MS_PER_DAY = 86_400_000;

const toUtcMs = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);

  return Date.UTC(year, month - 1, day);
};

const fromUtcMs = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const isIsoDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtcMs(toUtcMs(value)) === value;

export const addDaysIso = (isoDate: string, days: number) =>
  fromUtcMs(toUtcMs(isoDate) + days * MS_PER_DAY);

export const addMonthsIso = (isoDate: string, months: number) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();

  target.setUTCDate(Math.min(day, lastDay));

  return target.toISOString().slice(0, 10);
};

export const mondayOfWeekIso = (isoDate: string) => {
  const daysSinceMonday = (new Date(toUtcMs(isoDate)).getUTCDay() + 6) % 7;

  return addDaysIso(isoDate, -daysSinceMonday);
};

export const todayIso = (now: Date) => now.toISOString().slice(0, 10);
