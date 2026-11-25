import mongoose, { Schema, Types } from 'mongoose';

export type McpConnectionKind = 'oauth' | 'personal';

export interface IMcpConnection {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  kind: McpConnectionKind;
  clientId?: string;
  name: string;
  scopes: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const McpConnectionSchema = new Schema<IMcpConnection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    kind: { type: String, enum: ['oauth', 'personal'], required: true },
    clientId: { type: String },
    name: { type: String, required: true, trim: true },
    scopes: { type: [String], default: [] },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true, collection: 'mcp_connections' }
);

McpConnectionSchema.index({ userId: 1, revokedAt: 1 });

export default mongoose.model<IMcpConnection>('McpConnection', McpConnectionSchema);
