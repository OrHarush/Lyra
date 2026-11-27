import { Divider, Typography } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';

interface SettingsGroupProps {
  title: string;
  children: ReactNode;
}

const SettingsGroup = ({ title, children }: SettingsGroupProps) => (
  <Column>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
    <Column divider={<Divider />}>{children}</Column>
  </Column>
);

export default SettingsGroup;
