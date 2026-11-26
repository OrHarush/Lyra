import { Divider } from '@mui/material';
import { Fragment } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import ChargeRow from '@/pages/FixedExpenses/ChargeRow';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface ChargeListProps {
  items: FixedExpenseDto[];
  onEdit: (item: FixedExpenseDto) => void;
  onCancel: (item: FixedExpenseDto) => void;
}

const ChargeList = ({ items, onEdit, onCancel }: ChargeListProps) => (
  <Column>
    {items.map((item, index) => (
      <Fragment key={item._id}>
        {index > 0 && <Divider />}
        <ChargeRow item={item} onEdit={onEdit} onCancel={onCancel} />
      </Fragment>
    ))}
  </Column>
);

export default ChargeList;
