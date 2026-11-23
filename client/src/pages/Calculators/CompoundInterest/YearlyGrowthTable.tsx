import type { CompoundInterestYearPoint } from '@lyra/shared';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CurrencyText from '@/components/shared/ui/CurrencyText';

interface YearlyGrowthTableProps {
  points: CompoundInterestYearPoint[];
}

const YearlyGrowthTable = ({ points }: YearlyGrowthTableProps) => {
  const { t } = useTranslation('calculators');

  return (
    <Box component="details" sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
      <Typography component="summary" variant="subtitle2" sx={{ cursor: 'pointer' }}>
        {t('compoundInterest.tableTitle')}
      </Typography>
      <Box sx={{ overflowX: 'auto', mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('compoundInterest.tableYear')}</TableCell>
              <TableCell>{t('compoundInterest.chartDeposited')}</TableCell>
              <TableCell>{t('compoundInterest.chartInterest')}</TableCell>
              <TableCell>{t('compoundInterest.tableBalance')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {points.map(point => (
              <TableRow key={point.year}>
                <TableCell>{point.year}</TableCell>
                <TableCell>
                  <CurrencyText value={Math.round(point.deposited)} currency="ILS" variant="body2" />
                </TableCell>
                <TableCell>
                  <CurrencyText value={Math.round(point.interest)} currency="ILS" variant="body2" />
                </TableCell>
                <TableCell>
                  <CurrencyText value={Math.round(point.balance)} currency="ILS" variant="body2" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default YearlyGrowthTable;
