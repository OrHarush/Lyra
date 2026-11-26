import { ButtonBase, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ReactNode } from 'react';

import { getNotificationRowStyle } from '@/components/features/notifications/styles';
import Column from '@/components/shared/layout/containers/Column';

dayjs.extend(relativeTime);

interface NotificationRowProps {
  icon: ReactNode;
  title: string;
  detail: ReactNode;
  createdAt: string;
  onOpen: () => void;
}

const NotificationRow = ({ icon, title, detail, createdAt, onOpen }: NotificationRowProps) => (
  <ButtonBase onClick={onOpen} sx={getNotificationRowStyle()}>
    {icon}
    <Column sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        {dayjs(createdAt).fromNow()}
      </Typography>
    </Column>
  </ButtonBase>
);

export default NotificationRow;
