import { Card, CardContent } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';

const McpConsentCard = ({ children }: { children: ReactNode }) => (
  <Column alignItems="center" justifyContent="center" sx={{ minHeight: '100%', p: 2 }}>
    <Card sx={{ width: '100%', maxWidth: 460, borderRadius: 4 }}>
      <CardContent sx={{ py: { xs: 4, sm: 5 }, px: { xs: 2.5, sm: 4 } }}>{children}</CardContent>
    </Card>
  </Column>
);

export default McpConsentCard;
