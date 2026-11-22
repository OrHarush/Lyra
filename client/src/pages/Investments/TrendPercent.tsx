import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import { Typography } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';
import { getProfitPillStyle } from '@/pages/Investments/styles';
import { formatPercent } from '@/utils/investmentFormat';

interface TrendPercentProps {
  pl: number;
  plPct: number;
}

const TrendPercent = ({ pl, plPct }: TrendPercentProps) => {
  const isLoss = pl < 0;
  const TrendIcon = isLoss ? SouthEastIcon : NorthEastIcon;

  return (
    <Row spacing={0.5} alignItems="center" dir="ltr" sx={getProfitPillStyle(isLoss)}>
      <TrendIcon sx={{ fontSize: 16 }} />
      <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
        {formatPercent(plPct, true)}
      </Typography>
    </Row>
  );
};

export default TrendPercent;
