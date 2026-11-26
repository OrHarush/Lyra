import { FixedExpenseDetailsDTO } from '@lyra/shared';

import { IRecurringTemplate } from '../../models/RecurringTemplate';

export type FixedExpenseFields = Pick<
  IRecurringTemplate,
  'kind' | 'providerId' | 'cancelUrl' | 'billType'
>;

// Only expenses have a kind, and each kind keeps only its own details, so switching a
// subscription to a bill can't leave a stale cancellation link behind.
export const normalizeFixedExpenseDetails = (
  type: IRecurringTemplate['type'],
  details: FixedExpenseDetailsDTO
): FixedExpenseFields => {
  const kind = type === 'Expense' ? details.kind : undefined;
  const isSubscription = kind === 'subscription';

  return {
    kind,
    providerId: isSubscription ? details.providerId : undefined,
    cancelUrl: isSubscription ? details.cancelUrl || undefined : undefined,
    billType: kind === 'bill' ? details.billType : undefined,
  };
};
