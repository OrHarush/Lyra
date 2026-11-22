import { ReactNode, Ref } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import {
  getRecentListContentStyle,
  getRecentListViewportStyle,
} from '@/pages/Overview/RecentTransactions/styles';

interface RecentTransactionsListProps {
  viewportRef: Ref<HTMLDivElement>;
  isFitMode: boolean;
  children: ReactNode;
}

const RecentTransactionsList = ({ viewportRef, isFitMode, children }: RecentTransactionsListProps) => (
  <Column ref={viewportRef} sx={getRecentListViewportStyle(isFitMode)}>
    <Column spacing={1} sx={getRecentListContentStyle(isFitMode)}>
      {children}
    </Column>
  </Column>
);

export default RecentTransactionsList;
