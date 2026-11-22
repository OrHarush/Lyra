import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import { getProfitPillStyle } from '@/pages/Investments/styles';
import { formatPercent } from '@/utils/investmentFormat';

interface ProfitPillProps {
  pl: number;
  plPct: number;
}

const ProfitPill = ({ pl, plPct }: ProfitPillProps) => {
  const { t } = useTranslation('investments');
  const isLoss = pl < 0;
  const TrendIcon = isLoss ? SouthEastIcon : NorthEastIcon;

  return (
    <Row spacing={0.5} alignItems="center" sx={getProfitPillStyle(isLoss)}>
      <TrendIcon sx={{ fontSize: 16 }} />
      <Typography component="span" dir="ltr" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
        {formatPercent(plPct, true)}
      </Typography>
      <Typography component="span" sx={{ fontSize: '0.8125rem' }}>
        {t('summary.fromInvested')}
      </Typography>
    </Row>
  );
};

export default ProfitPill;
