import AddIcon from '@mui/icons-material/Add';
import { Button, Card, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { FixedExpenseListDto } from '@/types/FixedExpense';

interface FixedExpensesSummaryProps {
  totals: FixedExpenseListDto['totals'];
  count: number;
  onAdd: () => void;
}

const FixedExpensesSummary = ({ totals, count, onAdd }: FixedExpensesSummaryProps) => {
  const { t } = useTranslation('fixedExpenses');
  const isSmallScreen = useIsSmallScreen();

  return (
    <Card sx={{ p: { xs: 2, sm: 3 } }}>
      <Row alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap" useFlexGap>
        <Row spacing={{ xs: 2, sm: 4 }} alignItems="center">
          <Column spacing={0.25}>
            <Typography variant="body2" color="text.secondary">
              {t('summary.perMonth')}
            </Typography>
            <CurrencyText value={totals.monthly} variant="h4" fontWeight={700} />
          </Column>
          <Divider orientation="vertical" flexItem />
          <Column spacing={0.25}>
            <Typography variant="body2" color="text.secondary">
              {t('summary.perYear')}
            </Typography>
            <CurrencyText value={totals.yearly} variant="h5" fontWeight={600} />
          </Column>
        </Row>
        <Column spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
          <Typography variant="body2" color="text.secondary">
            {t('summary.count', { count })}
          </Typography>
          {!isSmallScreen && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
              {t('empty.cta')}
            </Button>
          )}
        </Column>
      </Row>
    </Card>
  );
};

export default FixedExpensesSummary;
