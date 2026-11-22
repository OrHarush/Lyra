import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import {
  DistributionSegment,
  toThemeColorPath,
} from '@/pages/Calculators/NetSalary/distributionSegments';

interface SalaryDistributionLegendProps {
  segments: DistributionSegment[];
}

const SalaryDistributionLegend = ({ segments }: SalaryDistributionLegendProps) => {
  const { t } = useTranslation('calculators');

  return (
    <Row sx={{ flexWrap: 'wrap', columnGap: 1, rowGap: 0.25 }}>
      {segments.map(segment => (
        <Row key={segment.key} alignItems="center" spacing={0.5}>
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '2px',
              bgcolor: toThemeColorPath(segment.paletteColor),
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {t(`netSalary.legend.${segment.key}`)}
          </Typography>
        </Row>
      ))}
    </Row>
  );
};

export default SalaryDistributionLegend;
