import { Box, Card, Divider, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import ChargeRowSkeleton from '@/pages/FixedExpenses/ChargeRowSkeleton';
import CompactSummarySkeleton from '@/pages/FixedExpenses/CompactSummarySkeleton';
import GroupCardSkeleton from '@/pages/FixedExpenses/GroupCardSkeleton';
import { getChargeListStyle, getGroupGridStyle } from '@/pages/FixedExpenses/styles';
import WideSummarySkeleton from '@/pages/FixedExpenses/WideSummarySkeleton';

const GROUP_CARDS = 3;
const CHARGE_ROWS = { small: 3, large: 6 };

// Mirrors the loaded page section by section. The classify prompt is left out: it's only
// shown when something is still unclassified.
const FixedExpensesSkeleton = () => {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallScreen = useIsSmallScreen();
  const chargeRows = isSmallScreen ? CHARGE_ROWS.small : CHARGE_ROWS.large;

  return (
    <>
      {isWide ? <WideSummarySkeleton /> : <CompactSummarySkeleton />}
      <Column spacing={1.5}>
        <Typography variant="h6">
          <Skeleton width={90} />
        </Typography>
        <Box sx={getGroupGridStyle()}>
          {Array.from({ length: GROUP_CARDS }, (_, index) => (
            <GroupCardSkeleton key={index} />
          ))}
        </Box>
      </Column>
      <Column spacing={1.5}>
        <Typography variant="h6">
          <Skeleton width={150} />
        </Typography>
        <Card sx={getChargeListStyle()}>
          {Array.from({ length: chargeRows }, (_, index) => (
            <Fragment key={index}>
              {index > 0 && <Divider />}
              <ChargeRowSkeleton />
            </Fragment>
          ))}
        </Card>
      </Column>
    </>
  );
};

export default FixedExpensesSkeleton;
