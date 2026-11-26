import { PendingBill } from './PendingBill';

// 'action' items count on the bell until the thing itself is handled; 'update' items only inform.
export type NotificationSection = 'action' | 'update';

interface BaseNotification<Type extends string, Data> {
  id: string;
  type: Type;
  section: NotificationSection;
  createdAt: Date;
  data: Data;
}

// A new notification type joins this union and gets its own source in notificationService.
export type AppNotification = BaseNotification<'billApproval', PendingBill>;
