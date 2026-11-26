import { FixedExpenseKind } from '@lyra/shared';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { getLegendDotStyle } from '@/pages/FixedExpenses/styles';

interface SummaryLegendItemProps {
  kind: FixedExpenseKind;
  monthly: number;
}

const SummaryLegendItem = ({ kind, monthly }: SummaryLegendItemProps) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <Row spacing={0.75} alignItems="center">
      <Box sx={getLegendDotStyle(kind)} />
      <Typography variant="body2" color="text.secondary">
        {t(`kinds.${kind}`)}
      </Typography>
      <CurrencyText value={monthly} variant="body2" fontWeight={600} />
    </Row>
  );
};

export default SummaryLegendItem;
