import mongoose, { Schema, Types } from 'mongoose';

export type McpAuditEventType =
  'MCP_CONNECTED' | 'MCP_REVOKED' | 'MCP_TOKEN_USED' | 'MCP_REFRESH_REUSE_DETECTED';

export interface IMcpAuditEvent {
  _id: Types.ObjectId;
  type: McpAuditEventType;
  userId: Types.ObjectId;
  connectionId: Types.ObjectId;
  clientId?: string;
  detail?: string;
  createdAt?: Date;
}

// Audit class: records who granted, used and revoked AI access to financial data. 365-day TTL
// (not 7 years) because this collection covers only MCP access, not every audit event in the app.
// `detail` holds the JSON-RPC method / tool name only — never arguments, which carry user data.
const McpAuditEventSchema = new Schema<IMcpAuditEvent>(
  {
    type: {
      type: String,
      enum: ['MCP_CONNECTED', 'MCP_REVOKED', 'MCP_TOKEN_USED', 'MCP_REFRESH_REUSE_DETECTED'],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    connectionId: { type: Schema.Types.ObjectId, ref: 'McpConnection', required: true },
    clientId: { type: String },
    detail: { type: String, maxlength: 100 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'mcp_audit_events' }
);

McpAuditEventSchema.index({ userId: 1, createdAt: -1 });
McpAuditEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export default mongoose.model<IMcpAuditEvent>('McpAuditEvent', McpAuditEventSchema);
