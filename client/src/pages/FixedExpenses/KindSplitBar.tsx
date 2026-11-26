import { FixedExpenseKind } from '@lyra/shared';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import { getSplitBarStyle, getSplitSegmentStyle } from '@/pages/FixedExpenses/styles';

interface KindSplitBarProps {
  shares: { kind: FixedExpenseKind; monthly: number }[];
}

const KindSplitBar = ({ shares }: KindSplitBarProps) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <Row role="img" aria-label={t('summary.split')} sx={getSplitBarStyle()}>
      {shares.map(({ kind, monthly }) => (
        <Box key={kind} sx={getSplitSegmentStyle(kind, monthly)} />
      ))}
    </Row>
  );
};

export default KindSplitBar;
