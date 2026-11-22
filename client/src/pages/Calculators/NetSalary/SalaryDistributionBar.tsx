import type { NetSalaryBreakdown } from '@lyra/shared';
import { Box } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import {
  buildDistributionSegments,
  toThemeColorPath,
} from '@/pages/Calculators/NetSalary/distributionSegments';
import SalaryDistributionLegend from '@/pages/Calculators/NetSalary/SalaryDistributionLegend';

interface SalaryDistributionBarProps {
  breakdown: NetSalaryBreakdown;
}

const SalaryDistributionBar = ({ breakdown }: SalaryDistributionBarProps) => {
  const segments = buildDistributionSegments(breakdown);
  const total = segments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0);

  return (
    <Column spacing={1}>
      <Row sx={{ height: 10, borderRadius: 5, overflow: 'hidden', bgcolor: 'action.hover' }}>
        {segments.map(segment => (
          <Box
            key={segment.key}
            component="span"
            sx={{
              width: total > 0 ? `${(Math.max(segment.value, 0) / total) * 100}%` : 0,
              bgcolor: toThemeColorPath(segment.paletteColor),
            }}
          />
        ))}
      </Row>
      <SalaryDistributionLegend segments={segments} />
    </Column>
  );
};

export default SalaryDistributionBar;
