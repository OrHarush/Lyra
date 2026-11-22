import { Card, CardContent, Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import CurrencyText from '@/components/shared/ui/CurrencyText';

interface HeadlineFigureProps {
  label: string;
  value: number;
  caption?: string;
  currency?: string;
}

const HeadlineFigure = ({ label, value, caption, currency }: HeadlineFigureProps) => (
  <Card sx={{ borderRadius: 2 }}>
    <CardContent>
      <Column spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <CurrencyText value={value} currency={currency} variant="h4" fontWeight={700} />
        {caption && (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        )}
      </Column>
    </CardContent>
  </Card>
);

export default HeadlineFigure;
