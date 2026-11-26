import { Button, Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';

interface NotificationMessageProps {
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}

const NotificationMessage = ({ title, body, action }: NotificationMessageProps) => (
  <Column spacing={1} alignItems="center" sx={{ textAlign: 'center', px: 2, py: 3 }}>
    <Typography variant="body1" fontWeight={600}>
      {title}
    </Typography>
    {body && (
      <Typography variant="body2" color="text.secondary">
        {body}
      </Typography>
    )}
    {action && (
      <Button variant="outlined" size="small" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </Column>
);

export default NotificationMessage;
