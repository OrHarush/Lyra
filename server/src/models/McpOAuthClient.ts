import mongoose, { Schema } from 'mongoose';

export interface IMcpOAuthClient {
  _id: string;
  clientId: string;
  clientInfo: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Stores the RFC 7591 registration as-is: the SDK compares client_secret in plaintext, and a DCR
// secret alone grants nothing without a consented authorization code or a (hashed) refresh token.
const McpOAuthClientSchema = new Schema<IMcpOAuthClient>(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    clientInfo: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: 'mcp_oauth_clients', minimize: false }
);

export default mongoose.model<IMcpOAuthClient>('McpOAuthClient', McpOAuthClientSchema);
