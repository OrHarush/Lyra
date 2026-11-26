import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { ITransactionPopulated } from '../../types/Transaction';
import { CalendarBalanceContext } from '../../types/TransactionCalendar';
import { balanceAt, toBalanceDeltas } from '../balance/ledger';

dayjs.extend(utc);

export const buildDailyBalances = (
  transactions: ITransactionPopulated[],
  monthDays: Dayjs[],
  accountId: string,
  anchor: CalendarBalanceContext
): Map<string, number> => {
  const deltas = toBalanceDeltas(transactions, accountId);

  return new Map(
    monthDays.map(day => [
      day.format('YYYY-MM-DD'),
      balanceAt(day.endOf('day').toDate(), deltas, anchor),
    ])
  );
};
