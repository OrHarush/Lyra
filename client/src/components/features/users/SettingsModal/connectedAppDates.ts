import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const RELATIVE_WINDOW_DAYS = 7;

export const formatConnectionDate = (iso: string): string => dayjs(iso).format('DD/MM/YYYY');

export const formatLastUsed = (iso: string): string => {
  const date = dayjs(iso);
  const isRecent = dayjs().diff(date, 'day') < RELATIVE_WINDOW_DAYS;

  return isRecent ? date.fromNow() : formatConnectionDate(iso);
};
