import mongoose, { Schema, Types } from 'mongoose';

export type McpTokenType = 'access' | 'refresh';

export interface IMcpToken {
  _id: Types.ObjectId;
  connectionId: Types.ObjectId;
  type: McpTokenType;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt?: Date;
}

const McpTokenSchema = new Schema<IMcpToken>(
  {
    connectionId: {
      type: Schema.Types.ObjectId,
      ref: 'McpConnection',
      required: true,
      index: true,
    },
    type: { type: String, enum: ['access', 'refresh'], required: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'mcp_tokens' }
);

McpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IMcpToken>('McpToken', McpTokenSchema);
