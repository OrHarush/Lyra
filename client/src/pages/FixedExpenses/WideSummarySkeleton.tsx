import { Box, Card, Divider, Skeleton, Typography } from '@mui/material';
import { Fragment } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import DonutSkeleton from '@/pages/FixedExpenses/DonutSkeleton';
import LegendRowSkeleton from '@/pages/FixedExpenses/LegendRowSkeleton';
import {
  CHARGE_ICON_SIZE,
  DONUT_SIZE,
  getCardStyle,
  getNextChargeBoxStyle,
  getSummaryGridStyle,
} from '@/pages/FixedExpenses/styles';

const LEGEND_ROWS = 4;

const WideSummarySkeleton = () => (
  <Box sx={getSummaryGridStyle()}>
    <Card sx={getCardStyle()}>
      <Column height="100%" justifyContent="space-between" spacing={2}>
        <Column spacing={0.5}>
          <Typography>
            <Skeleton width={130} />
          </Typography>
          <Typography variant="h2">
            <Skeleton width={220} />
          </Typography>
          <Typography>
            <Skeleton width={110} />
          </Typography>
        </Column>
        <Row alignItems="center" spacing={1.5} sx={getNextChargeBoxStyle()}>
          <Skeleton variant="circular" width={CHARGE_ICON_SIZE} height={CHARGE_ICON_SIZE} />
          <Typography variant="body2" sx={{ flex: 1 }}>
            <Skeleton width="70%" />
          </Typography>
          <Skeleton width={48} />
        </Row>
      </Column>
    </Card>
    <Card sx={getCardStyle()}>
      <Row height="100%" alignItems="center" spacing={4}>
        <DonutSkeleton size={DONUT_SIZE.wide} />
        <Column sx={{ flex: 1, minWidth: 0 }}>
          {Array.from({ length: LEGEND_ROWS }, (_, index) => (
            <Fragment key={index}>
              {index > 0 && <Divider />}
              <LegendRowSkeleton />
            </Fragment>
          ))}
        </Column>
      </Row>
    </Card>
  </Box>
);

export default WideSummarySkeleton;
