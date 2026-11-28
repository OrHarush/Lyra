import { Types } from 'mongoose';

import ShortcutCredential, {
  IShortcutCredential,
  ShortcutPlatform,
} from '../models/ShortcutCredential';

export const create = (
  tokenId: string,
  userId: string,
  platform: ShortcutPlatform
) =>
  ShortcutCredential.create({
    tokenId,
    userId: new Types.ObjectId(userId),
    platform,
    active: true,
  });

export const findActiveByTokenId = (tokenId: string): Promise<IShortcutCredential | null> =>
  ShortcutCredential.findOne({ tokenId, active: true }).lean();

export const findLatestActiveForUserByPlatform = (
  userId: string,
  platform: ShortcutPlatform
): Promise<IShortcutCredential | null> =>
  ShortcutCredential.findOne({ userId: new Types.ObjectId(userId), platform, active: true })
    .sort({ createdAt: -1 })
    .lean();

export const deactivateAllForUser = (userId: string) =>
  ShortcutCredential.updateMany(
    { userId: new Types.ObjectId(userId), active: true },
    { $set: { active: false, revokedAt: new Date() } }
  );

export const deactivateForUserByPlatform = (userId: string, platform: ShortcutPlatform) =>
  ShortcutCredential.updateMany(
    { userId: new Types.ObjectId(userId), platform, active: true },
    { $set: { active: false, revokedAt: new Date() } }
  );

export const touchLastSeen = (tokenId: string) =>
  ShortcutCredential.updateOne({ tokenId, active: true }, { $set: { lastSeenAt: new Date() } });
