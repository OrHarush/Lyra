import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import { getLegendDotStyle } from '@/pages/FixedExpenses/styles';
import { FixedExpenseGroup } from '@/utils/entities/fixedExpenseGroups';

const DonutLegendRow = ({ group }: { group: FixedExpenseGroup }) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <Row justifyContent="space-between" alignItems="center" spacing={2} sx={{ py: 1 }}>
      <Row alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
        <Box sx={getLegendDotStyle(group.id)} />
        <Typography variant="body2" fontWeight={600} noWrap>
          {t(`groups.${group.id}`)}
        </Typography>
      </Row>
      <Typography variant="body2" color="text.secondary">
        {`${Math.round(group.share * 100)}%`}
      </Typography>
    </Row>
  );
};

export default DonutLegendRow;
