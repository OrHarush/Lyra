import { Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import KindSplitBar from '@/pages/FixedExpenses/KindSplitBar';
import { getSummaryCardStyle } from '@/pages/FixedExpenses/styles';
import SummaryLegendItem from '@/pages/FixedExpenses/SummaryLegendItem';
import { FixedExpenseDto, FixedExpenseListDto } from '@/types/FixedExpense';
import { sumMonthlyByKind } from '@/utils/entities/fixedExpense';

interface FixedExpensesSummaryProps {
  totals: FixedExpenseListDto['totals'];
  items: FixedExpenseDto[];
}

const FixedExpensesSummary = ({ totals, items }: FixedExpensesSummaryProps) => {
  const { t } = useTranslation('fixedExpenses');
  const monthlyByKind = sumMonthlyByKind(items);

  return (
    <Card sx={getSummaryCardStyle()}>
      <Column spacing={2}>
        <Column spacing={0.5}>
          <Row justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {t('summary.monthlyLabel')}
            </Typography>
            <Row spacing={0.5} alignItems="baseline">
              <CurrencyText value={totals.yearly} variant="body2" color="text.secondary" />
              <Typography variant="body2" color="text.secondary">
                {t('summary.perYear')}
              </Typography>
            </Row>
          </Row>
          <CurrencyText value={totals.monthly} variant="h3" fontWeight={800} color="error.main" />
        </Column>
        <KindSplitBar shares={monthlyByKind} />
        <Row spacing={2} flexWrap="wrap" useFlexGap justifyContent="space-between">
          {monthlyByKind.map(({ kind, monthly }) => (
            <SummaryLegendItem key={kind} kind={kind} monthly={monthly} />
          ))}
        </Row>
      </Column>
    </Card>
  );
};

export default FixedExpensesSummary;
