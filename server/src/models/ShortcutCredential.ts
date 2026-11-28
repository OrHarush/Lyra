import mongoose, { Schema, Types } from 'mongoose';

export type ShortcutPlatform = 'ios' | 'android';

export interface IShortcutCredential {
  _id: string;
  tokenId: string;
  userId: Types.ObjectId;
  platform: ShortcutPlatform;
  active: boolean;
  revokedAt?: Date;
  lastSeenAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ShortcutCredentialSchema: Schema = new Schema(
  {
    tokenId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: { type: String, enum: ['ios', 'android'], required: true },
    active: { type: Boolean, required: true, default: true },
    revokedAt: { type: Date },
    lastSeenAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IShortcutCredential>(
  'ShortcutCredential',
  ShortcutCredentialSchema,
  'shortcut_credentials'
);
