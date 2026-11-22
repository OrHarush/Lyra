import { Typography } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';
import { FundColor, OTHER_FUND_COLOR } from '@/theme/investmentColors';

interface ChartLegendProps {
  funds: Array<{ yahooSymbol: string; badge: string }>;
  colors: Map<string, FundColor>;
}

const ChartLegend = ({ funds, colors }: ChartLegendProps) => (
  <Row spacing={2} flexWrap="wrap" useFlexGap alignItems="center">
    {funds.map(({ yahooSymbol, badge }) => (
      <Row key={yahooSymbol} spacing={0.75} alignItems="center">
        <Typography
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: (colors.get(yahooSymbol) ?? OTHER_FUND_COLOR).main,
          }}
        />
        <Typography color="text.secondary" dir="ltr" sx={{ fontSize: '0.75rem' }}>
          {badge}
        </Typography>
      </Row>
    ))}
  </Row>
);

export default ChartLegend;
