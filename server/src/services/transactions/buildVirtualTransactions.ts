import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Types } from 'mongoose';

import { IRecurringTemplatePopulated } from '../../types/RecurringTemplate';
import { ITransactionPopulated } from '../../types/Transaction';
import { isOccurrenceMonth } from '../recurring/occurrence';

dayjs.extend(utc);

export const buildVirtualTransactions = (
  templates: IRecurringTemplatePopulated[],
  realTransactions: ITransactionPopulated[],
  from: Date,
  to: Date
): ITransactionPopulated[] => {
  const virtualTransactions: ITransactionPopulated[] = [];
  const fromMonth = dayjs.utc(from).startOf('month');
  const toMonth = dayjs.utc(to).subtract(1, 'ms').startOf('month');

  for (const template of templates) {
    const templateStartMonth = dayjs.utc(template.startDate).startOf('month');
    const templateEndMonth = template.endDate ? dayjs.utc(template.endDate).startOf('month') : null;
    const lastGeneratedMonth = template.lastGeneratedDate
      ? dayjs.utc(template.lastGeneratedDate).startOf('month')
      : null;

    let current = fromMonth.isBefore(templateStartMonth) ? templateStartMonth : fromMonth;

    while (!current.isAfter(toMonth)) {
      if (templateEndMonth && current.isAfter(templateEndMonth)) {
        break;
      }

      if (lastGeneratedMonth && !current.isAfter(lastGeneratedMonth)) {
        current = current.add(1, 'month');
        continue;
      }

      if (!isOccurrenceMonth(template.frequency, template.startDate, current)) {
        current = current.add(1, 'month');
        continue;
      }

      const year = current.year();
      const month = current.month();
      const templateIdStr = (template._id as Types.ObjectId).toString();

      const realExists = realTransactions.some(tx => {
        if (!tx.templateId) {
          return false;
        }

        if (tx.templateId.toString() !== templateIdStr) {
          return false;
        }

        const txDate = tx.date;

        if (!txDate) {
          return false;
        }

        const txDay = dayjs.utc(txDate);

        return txDay.year() === year && txDay.month() === month;
      });

      if (!realExists) {
        const virtualId = `virtual-${templateIdStr}-${year}-${month}`;
        const date = clampedDate(year, month, template.dayOfMonth);

        const virtual: ITransactionPopulated = {
          _id: virtualId,
          name: template.name,
          note: template.note,
          type: template.type,
          amount: template.amount,
          date,
          frequency: template.frequency,
          belongToPreviousMonth: template.belongToPreviousMonth ?? false,
          category: template.category,
          paymentMethod: template.paymentMethod,
          account: template.account,
          fromAccount: template.fromAccount,
          toAccount: template.toAccount,
          userId: template.userId,
          templateId: new Types.ObjectId(templateIdStr),
          source: 'manual',
          isVirtual: true,
        };

        virtualTransactions.push(virtual);
      }

      current = current.add(1, 'month');
    }
  }

  return virtualTransactions;
};

export const clampedDate = (year: number, month: number, dayOfMonth: number): Date => {
  const d = dayjs.utc().year(year).month(month).startOf('month');
  const day = Math.min(dayOfMonth, d.daysInMonth());

  return d.date(day).toDate();
};
