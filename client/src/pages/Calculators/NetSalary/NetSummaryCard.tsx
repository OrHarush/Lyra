import { calculateShareOfGross, NetSalaryBreakdown } from '@lyra/shared';
import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import CopyCalculationButton from '@/pages/Calculators/NetSalary/CopyCalculationButton';
import SalaryDistributionBar from '@/pages/Calculators/NetSalary/SalaryDistributionBar';
import { getNetSummaryCardStyle } from '@/pages/Calculators/styles';

interface NetSummaryCardProps {
  breakdown: NetSalaryBreakdown;
  getSummaryText: () => string;
}

const SALARY_CURRENCY = 'ILS';

const NetSummaryCard = ({ breakdown, getSummaryText }: NetSummaryCardProps) => {
  const { t } = useTranslation('calculators');

  return (
    <Card sx={getNetSummaryCardStyle()}>
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Column spacing={1.5}>
          <Column alignItems="flex-start">
            <Row justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                {t('netSalary.netLabel')}
              </Typography>
              <CopyCalculationButton getText={getSummaryText} />
            </Row>
            <CurrencyText
              value={Math.round(breakdown.netSalary)}
              currency={SALARY_CURRENCY}
              variant="h3"
              fontWeight={700}
              sx={{ lineHeight: 1.15 }}
            />
            <Row sx={{ flexWrap: 'wrap', columnGap: 1, alignItems: 'baseline' }}>
              <Typography variant="caption" color="text.secondary">
                {t('netSalary.netShareOfGross', { pct: calculateShareOfGross(breakdown) })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ·
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('netSalary.employerCost')}
              </Typography>
              <CurrencyText
                value={Math.round(breakdown.employerCost)}
                currency={SALARY_CURRENCY}
                variant="caption"
                color="text.secondary"
              />
            </Row>
          </Column>
          <SalaryDistributionBar breakdown={breakdown} />
        </Column>
      </CardContent>
    </Card>
  );
};

export default NetSummaryCard;
