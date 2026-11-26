import { AppNotification } from '../../types/Notification';
import { findBillApprovalNotifications } from './billApprovalNotifications';

type NotificationSource = (userId: string, workspaceId: string) => Promise<AppNotification[]>;

// Notifications are worked out from current data rather than stored, so handling something
// anywhere in the app removes its notification.
const SOURCES: NotificationSource[] = [findBillApprovalNotifications];

export const getNotifications = async (userId: string, workspaceId: string) => {
  const results = await Promise.all(SOURCES.map(source => source(userId, workspaceId)));

  return results.flat();
};
