import { MAX_COMPOUND_YEARS } from '@lyra/shared';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';

const AssumptionsTable = () => {
  const { t } = useTranslation('publicCalculators');

  const rows = [
    {
      key: 'compounding',
      label: t('compoundInterest.assumptions.compounding'),
      value: t('compoundInterest.assumptions.compoundingValue'),
    },
    {
      key: 'return',
      label: t('compoundInterest.assumptions.returnRate'),
      value: t('compoundInterest.assumptions.returnRateValue'),
    },
    {
      key: 'deposit',
      label: t('compoundInterest.assumptions.deposit'),
      value: t('compoundInterest.assumptions.depositValue'),
    },
    {
      key: 'maxYears',
      label: t('compoundInterest.assumptions.maxYears'),
      value: t('compoundInterest.assumptions.maxYearsValue', { years: MAX_COMPOUND_YEARS }),
    },
  ];

  return (
    <Column component="section" spacing={1.5} sx={getProseStyle()}>
      <Typography component="h2" variant="h5" sx={headingSx}>
        {t('compoundInterest.assumptionsHeading')}
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('compoundInterest.assumptions.colName')}</TableCell>
              <TableCell>{t('compoundInterest.assumptions.colValue')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
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

export default AssumptionsTable;
