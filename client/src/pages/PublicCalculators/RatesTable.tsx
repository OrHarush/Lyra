import type { IsraelTaxRates } from '@lyra/shared';
import { toPercent } from '@lyra/shared';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';
import { formatCurrency } from '@/utils/currency';

interface RatesTableProps {
  rates: IsraelTaxRates;
  ratesLabel: string;
}

const money = (value: number) => formatCurrency(value, 'ILS');

const RatesTable = ({ rates, ratesLabel }: RatesTableProps) => {
  const { t } = useTranslation('publicCalculators');
  const { nationalInsurance, pensionTaxCredit, studyFund, incomeTaxBrackets } = rates;

  const bracketRows = incomeTaxBrackets.map((bracket, index) => {
    const previousLimit = index === 0 ? 0 : incomeTaxBrackets[index - 1].upTo;
    const isTop = bracket.upTo === Infinity;

    return {
      key: `${bracket.upTo}`,
      label: isTop
        ? t('netSalary.rates.bracketTop', { from: money(previousLimit) })
        : money(bracket.upTo),
      rate: `${toPercent(bracket.rate)}%`,
    };
  });

  const otherRows = [
    {
      key: 'point',
      label: t('netSalary.rates.creditPointValue'),
      value: money(rates.creditPointValue),
    },
    {
      key: 'niReduced',
      label: t('netSalary.rates.niReduced', {
        ceiling: money(nationalInsurance.reducedBandCeiling),
      }),
      value: `${toPercent(nationalInsurance.reducedRate)}%`,
    },
    {
      key: 'niFull',
      label: t('netSalary.rates.niFull', { max: money(nationalInsurance.maxInsurableIncome) }),
      value: `${toPercent(nationalInsurance.fullRate)}%`,
    },
    {
      key: 'pension',
      label: t('netSalary.rates.pensionCredit'),
      value: t('netSalary.rates.pensionCreditValue', {
        rate: toPercent(pensionTaxCredit.rate),
        cap: money(pensionTaxCredit.monthlyCap),
        share: toPercent(pensionTaxCredit.maxSalaryShare),
      }),
    },
    {
      key: 'donation',
      label: t('netSalary.rates.donationCredit'),
      value: `${toPercent(rates.donationTaxCreditRate)}%`,
    },
    {
      key: 'studyFund',
      label: t('netSalary.rates.studyFundCeiling'),
      value: money(studyFund.salaryCeiling),
    },
  ];

  return (
    <Column component="section" spacing={1.5} sx={getProseStyle()}>
      <Typography component="h2" variant="h5" sx={headingSx}>
        {t('netSalary.ratesTitle')}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {ratesLabel}
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <caption style={{ captionSide: 'top', textAlign: 'start', padding: '8px 0' }}>
            {t('netSalary.rates.bracketsHeading')}
          </caption>
          <TableHead>
            <TableRow>
              <TableCell>{t('netSalary.rates.colUpTo')}</TableCell>
              <TableCell>{t('netSalary.rates.colRate')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bracketRows.map(row => (
              <TableRow key={row.key}>
                <TableCell>{row.label}</TableCell>
                <TableCell>{row.rate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <caption style={{ captionSide: 'top', textAlign: 'start', padding: '8px 0' }}>
            {t('netSalary.rates.otherHeading')}
          </caption>
          <TableBody>
            {otherRows.map(row => (
              <TableRow key={row.key}>
                <TableCell>{row.label}</TableCell>
                <TableCell>{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Column>
  );
};

export default RatesTable;
