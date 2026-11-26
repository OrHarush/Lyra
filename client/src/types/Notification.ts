import { PendingBillDto } from '@/types/Bill';

export type NotificationSectionId = 'action' | 'update';

interface BaseNotificationDto<Type extends string, Data> {
  id: string;
  type: Type;
  section: NotificationSectionId;
  createdAt: string;
  data: Data;
}

export type NotificationDto = BaseNotificationDto<'billApproval', PendingBillDto>;

export interface NotificationItemProps<Type extends NotificationDto['type']> {
  notification: Extract<NotificationDto, { type: Type }>;
  closePanel: () => void;
}
