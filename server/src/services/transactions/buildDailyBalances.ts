import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { ITransactionPopulated } from '../../types/Transaction';
import { balanceAt, toBalanceDeltas } from '../balance/ledger';

dayjs.extend(utc);

export const buildDailyBalances = (
  transactions: ITransactionPopulated[],
  monthDays: Dayjs[],
  accountId: string,
  currentBalance: number,
  now: Date
): Map<string, number> => {
  const deltas = toBalanceDeltas(transactions, accountId);

  return new Map(
    monthDays.map(day => [
      day.format('YYYY-MM-DD'),
      balanceAt(day.endOf('day').toDate(), deltas, { currentBalance, now }),
    ])
  );
};
