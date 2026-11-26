import { Button, Card, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import ChargeList from '@/pages/FixedExpenses/ChargeList';
import { getChargeListStyle } from '@/pages/FixedExpenses/styles';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface UpcomingChargesProps {
  items: FixedExpenseDto[];
  onEdit: (item: FixedExpenseDto) => void;
  onCancel: (item: FixedExpenseDto) => void;
}

const ROWS_ON_SMALL_SCREENS = 3;

const UpcomingCharges = ({ items, onEdit, onCancel }: UpcomingChargesProps) => {
  const { t } = useTranslation('fixedExpenses');
  const isSmallScreen = useIsSmallScreen();
  const [isExpanded, setIsExpanded] = useState(false);

  const isTruncated = isSmallScreen && !isExpanded && items.length > ROWS_ON_SMALL_SCREENS;
  const shown = isTruncated ? items.slice(0, ROWS_ON_SMALL_SCREENS) : items;

  return (
    <Column spacing={1.5}>
      <Typography variant="h6" fontWeight={700}>
        {t('upcoming.title')}
      </Typography>
      <Card sx={getChargeListStyle()}>
        <ChargeList items={shown} onEdit={onEdit} onCancel={onCancel} />
      </Card>
      {isTruncated && (
        <Button onClick={() => setIsExpanded(true)}>{t('upcoming.showAll')}</Button>
      )}
    </Column>
  );
};

export default UpcomingCharges;
