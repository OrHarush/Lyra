import { Types } from 'mongoose';

import McpAuditEvent, { McpAuditEventType } from '../models/McpAuditEvent';

export const insert = (data: {
  type: McpAuditEventType;
  userId: Types.ObjectId;
  connectionId: Types.ObjectId;
  clientId?: string;
  detail?: string;
}) => McpAuditEvent.create(data);
