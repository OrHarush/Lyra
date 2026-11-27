import { Typography } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

interface SettingsRowProps {
  label: string;
  helper?: string;
  children: ReactNode;
}

const SettingsRow = ({ label, helper, children }: SettingsRowProps) => (
  <Row alignItems="center" justifyContent="space-between" spacing={2} sx={{ py: 1.5 }}>
    <Column spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
      {helper && (
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      )}
    </Column>
    {children}
  </Row>
);

export default SettingsRow;
