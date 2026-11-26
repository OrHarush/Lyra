import { FixedExpenseKind } from '@lyra/shared';
import { Card, Divider, Typography } from '@mui/material';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import FixedExpenseRow from '@/pages/FixedExpenses/FixedExpenseRow';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface FixedExpensesSectionProps {
  kind: FixedExpenseKind;
  items: FixedExpenseDto[];
  onCancel: (item: FixedExpenseDto) => void;
  onEdit: (item: FixedExpenseDto) => void;
}

const FixedExpensesSection = ({ kind, items, onCancel, onEdit }: FixedExpensesSectionProps) => {
  const { t } = useTranslation('fixedExpenses');

  if (items.length === 0) {
    return null;
  }

  return (
    <Column spacing={1}>
      <Row alignItems="baseline" spacing={1} flexWrap="wrap" useFlexGap>
        <Typography variant="h6" fontWeight={700}>
          {t(`sections.${kind}.title`)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(`sections.${kind}.hint`)}
        </Typography>
      </Row>
      <Card sx={{ px: { xs: 1.5, sm: 2 }, py: 0.5 }}>
        {items.map((item, index) => (
          <Fragment key={item._id}>
            {index > 0 && <Divider />}
            <FixedExpenseRow item={item} onCancel={onCancel} onEdit={onEdit} />
          </Fragment>
        ))}
      </Card>
    </Column>
  );
};

export default FixedExpensesSection;
