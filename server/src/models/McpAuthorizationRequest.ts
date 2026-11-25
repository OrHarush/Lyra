import mongoose, { Schema, Types } from 'mongoose';

export type McpAuthorizationStatus = 'pending' | 'approved' | 'denied' | 'used';

export interface IMcpAuthorizationRequest {
  _id: string;
  requestId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state?: string;
  scopes: string[];
  resource?: string;
  status: McpAuthorizationStatus;
  userId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  codeHash?: string;
  codeExpiresAt?: Date;
  expiresAt: Date;
  createdAt?: Date;
}

const McpAuthorizationRequestSchema = new Schema<IMcpAuthorizationRequest>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    clientId: { type: String, required: true },
    redirectUri: { type: String, required: true },
    codeChallenge: { type: String, required: true },
    state: { type: String },
    scopes: { type: [String], default: [] },
    resource: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'used'],
      required: true,
      default: 'pending',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    codeHash: { type: String, index: { unique: true, sparse: true } },
    codeExpiresAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: 'mcp_authorization_requests' }
);

McpAuthorizationRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IMcpAuthorizationRequest>(
  'McpAuthorizationRequest',
  McpAuthorizationRequestSchema
);
