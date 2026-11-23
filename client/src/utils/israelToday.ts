const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

const israelDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ISRAEL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const getIsraelToday = (now: Date = new Date()): string => israelDateFormatter.format(now);
