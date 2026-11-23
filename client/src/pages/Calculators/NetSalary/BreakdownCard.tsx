import { getLatestRates, NetSalaryBreakdown, toPercent } from '@lyra/shared';
import { Card, CardContent, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import BreakdownRow from '@/pages/Calculators/components/BreakdownRow';
import { getBreakdownCardStyle } from '@/pages/Calculators/styles';

interface BreakdownCardProps {
  breakdown: NetSalaryBreakdown;
}

const SALARY_CURRENCY = 'ILS';
const { ratesYear, pensionTaxCredit, donationTaxCreditRate } = getLatestRates();

const BreakdownCard = ({ breakdown }: BreakdownCardProps) => {
  const { t } = useTranslation('calculators');

  const rows = [
    { key: 'gross', value: breakdown.grossSalary, isShown: true },
    { key: 'employeePension', value: -breakdown.employeePension, isShown: true },
    { key: 'employeeStudyFund', value: -breakdown.employeeStudyFund, isShown: breakdown.employeeStudyFund > 0 },
    { key: 'nationalInsurance', value: -breakdown.nationalInsurance, isShown: true },
    { key: 'incomeTax', value: -breakdown.incomeTax, isShown: true },
  ];

  const taxDetails = [
    { label: t('netSalary.taxBeforeCredits'), value: breakdown.incomeTaxBeforeCredits, isShown: true },
    {
      label: t('netSalary.studyFundTaxableBenefit'),
      value: breakdown.studyFundTaxableBenefit,
      isShown: breakdown.studyFundTaxableBenefit > 0,
    },
    {
      label: t('netSalary.creditPoints', { points: Number(breakdown.creditPoints.toFixed(2)) }),
      value: -breakdown.creditPointsValue,
      isShown: true,
    },
    { label: t('netSalary.pensionTaxCredit', { pct: toPercent(pensionTaxCredit.rate) }), value: -breakdown.pensionTaxCredit, isShown: true },
    {
      label: t('netSalary.donationsCredit', { pct: toPercent(donationTaxCreditRate) }),
      value: -breakdown.donationsTaxCredit,
      isShown: breakdown.donationsTaxCredit > 0,
    },
  ];

  return (
    <Card sx={getBreakdownCardStyle()}>
      <CardContent
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2, '&:last-child': { pb: 2 } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
          {t('netSalary.breakdownTitle')}
        </Typography>
        {rows
          .filter(row => row.isShown)
          .map(row => (
            <BreakdownRow
              key={row.key}
              label={t(`netSalary.${row.key}`)}
              value={Math.round(row.value)}
              currency={SALARY_CURRENCY}
            />
          ))}
        {taxDetails
          .filter(detail => detail.isShown)
          .map(detail => (
            <BreakdownRow
              key={detail.label}
              label={detail.label}
              value={Math.round(detail.value)}
              currency={SALARY_CURRENCY}
              isDetail
            />
          ))}
        <Column sx={{ mt: 'auto', pt: 0.75 }}>
          <Divider sx={{ my: 0.75 }} />
          <BreakdownRow
            label={t('netSalary.net')}
            value={Math.round(breakdown.netSalary)}
            currency={SALARY_CURRENCY}
            isTotal
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
            {t('netSalary.disclaimer', { year: ratesYear })}
          </Typography>
        </Column>
      </CardContent>
    </Card>
  );
};

export default BreakdownCard;
