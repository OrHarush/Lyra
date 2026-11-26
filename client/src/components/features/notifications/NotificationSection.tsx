import { Typography } from '@mui/material';

import { NOTIFICATION_ITEMS } from '@/components/features/notifications/notificationItems';
import Column from '@/components/shared/layout/containers/Column';
import { NotificationDto } from '@/types/Notification';

interface NotificationSectionProps {
  title: string;
  notifications: NotificationDto[];
  closePanel: () => void;
}

const NotificationSection = ({ title, notifications, closePanel }: NotificationSectionProps) => (
  <Column spacing={0.5}>
    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ px: 1 }}>
      {title}
    </Typography>
    {notifications.map(notification => {
      const Item = NOTIFICATION_ITEMS[notification.type];

      return <Item key={notification.id} notification={notification} closePanel={closePanel} />;
    })}
  </Column>
);

export default NotificationSection;
