import { Card, CardContent, Typography } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

interface CalculatorCardProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

const CalculatorCard = ({ title, icon, action, children }: CalculatorCardProps) => (
  <Card sx={{ borderRadius: 2 }}>
    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
      <Column spacing={1.5}>
        <Row alignItems="center" spacing={1}>
          {icon}
          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
            {title}
          </Typography>
          {action}
        </Row>
        {children}
      </Column>
    </CardContent>
  </Card>
);

export default CalculatorCard;
