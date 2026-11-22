import { Typography } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

interface BreakdownStatProps {
  label: string;
  dotColor: string;
  children: ReactNode;
}

const DOT_SIZE = 8;

const BreakdownStat = ({ label, dotColor, children }: BreakdownStatProps) => (
  <Column spacing={0.5} alignItems="flex-start">
    <Row spacing={0.75} alignItems="center">
      <Typography
        component="span"
        sx={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%', bgcolor: dotColor }}
      />
      <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
        {label}
      </Typography>
    </Row>
    {children}
  </Column>
);

export default BreakdownStat;
