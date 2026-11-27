import { FixedExpenseDto } from '@/types/FixedExpense';

export type FixedExpenseGroupId =
  | 'housing'
  | 'loans'
  | 'subscriptions'
  | 'bills'
  | 'insurance';

export interface FixedExpenseGroup {
  id: FixedExpenseGroupId;
  items: FixedExpenseDto[];
  monthly: number;
  share: number;
}

// What the user chose wins; otherwise the category decides. Everything else that is paid
// regularly, installments included, sits with the loans and payments.
export const getFixedExpenseGroupId = (item: FixedExpenseDto): FixedExpenseGroupId => {
  if (item.kind === 'bill') {
    return 'bills';
  }

  if (item.kind === 'subscription') {
    return 'subscriptions';
  }

  switch (item.category?.key) {
    case 'housing':
      return 'housing';
    case 'insurance':
      return 'insurance';
    case 'subscriptions':
      return item.kind === null ? 'subscriptions' : 'loans';
    case 'utilities':
      return item.kind === null ? 'bills' : 'loans';
    default:
      return 'loans';
  }
};

export const buildFixedExpenseGroups = (items: FixedExpenseDto[]): FixedExpenseGroup[] => {
  const itemsByGroup = new Map<FixedExpenseGroupId, FixedExpenseDto[]>();

  for (const item of items) {
    const id = getFixedExpenseGroupId(item);
    itemsByGroup.set(id, [...(itemsByGroup.get(id) ?? []), item]);
  }

  const total = sumMonthly(items);

  return [...itemsByGroup]
    .map(([id, groupItems]) => {
      const monthly = sumMonthly(groupItems);

      return { id, items: groupItems, monthly, share: total > 0 ? monthly / total : 0 };
    })
    .sort((a, b) => b.monthly - a.monthly);
};

const sumMonthly = (items: FixedExpenseDto[]) =>
  items.reduce((total, item) => total + item.monthlyAmount, 0);
