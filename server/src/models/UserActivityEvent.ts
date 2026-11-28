import mongoose, { Schema, Types } from 'mongoose';

export type UserActivityType =
  | 'LOGIN'
  | 'DB_BACKUP_EXPORTED'
  | 'SHORTCUT_TOKEN_ISSUED'
  | 'SHORTCUT_TOKEN_REVOKED';

export interface IUserActivityEvent {
  _id: string;
  userId: Types.ObjectId | null;
  userName: string; // denormalized, for readability only; cleared on user deletion
  type: UserActivityType;
  occurredAt: Date;
}

const UserActivityEventSchema = new Schema<IUserActivityEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userName: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['LOGIN', 'DB_BACKUP_EXPORTED', 'SHORTCUT_TOKEN_ISSUED', 'SHORTCUT_TOKEN_REVOKED'],
      required: true,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
  },
  {
    collection: 'user_activity_events',
  }
);

UserActivityEventSchema.index({ userId: 1, occurredAt: -1 });
UserActivityEventSchema.index(
  { occurredAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 * 7 } // 7 years — Amendment 13 civil statute window
);

export default mongoose.model<IUserActivityEvent>('UserActivityEvent', UserActivityEventSchema);
