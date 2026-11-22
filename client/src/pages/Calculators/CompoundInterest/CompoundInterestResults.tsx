import type { CompoundInterestResult } from '@lyra/shared';
import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import BreakdownRow from '@/pages/Calculators/components/BreakdownRow';
import HeadlineFigure from '@/pages/Calculators/components/HeadlineFigure';
import GrowthChart from '@/pages/Calculators/CompoundInterest/GrowthChart';
import { getCalculatorResultsStyle } from '@/pages/Calculators/styles';

interface CompoundInterestResultsProps {
  result: CompoundInterestResult;
  years: number;
}

const CompoundInterestResults = ({ result, years }: CompoundInterestResultsProps) => {
  const { t } = useTranslation('calculators');

  return (
    <Column sx={getCalculatorResultsStyle()}>
      <HeadlineFigure
        label={t('compoundInterest.finalBalance', { years })}
        value={Math.round(result.finalBalance)}
      />
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <BreakdownRow label={t('compoundInterest.totalDeposited')} value={Math.round(result.totalDeposited)} />
          <BreakdownRow label={t('compoundInterest.totalInterest')} value={Math.round(result.totalInterest)} />
        </CardContent>
      </Card>
      <GrowthChart points={result.yearlyPoints} />
      <Typography variant="caption" color="text.secondary">
        {t('compoundInterest.disclaimer')}
      </Typography>
    </Column>
  );
};

export default CompoundInterestResults;
