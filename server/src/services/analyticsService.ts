import { AnalyticsEventType } from '../models/AnalyticsEvent';
import User from '../models/User';
import * as analyticsEventRepository from '../repositories/analyticsEventRepository';
import { isExcludedEmail } from '../utils/excludedEmails';

export interface UserAnalyticsSnapshot {
  email: string;
  name: string;
  picture: string;
  analyticsConsent: string;
}

export const captureUserSnapshot = async (
  userId: string,
): Promise<UserAnalyticsSnapshot | null> => {
  const user = await User.findById(userId)
    .select('email name picture analyticsConsent')
    .lean();

  if (!user) {
    return null;
  }

  return {
    email: user.email ?? '',
    name: user.name ?? '',
    picture: user.picture ?? '',
    analyticsConsent: user.analyticsConsent ?? '',
  };
};

const insertIfConsented = async (
  event: AnalyticsEventType,
  snapshot: UserAnalyticsSnapshot,
) => {
  if (isExcludedEmail(snapshot.email)) {
    return;
  }

  if (snapshot.analyticsConsent !== 'accepted') {
    return;
  }

  return analyticsEventRepository.insertEvent(event, snapshot.name, snapshot.picture);
};

export const track = async (userId: string, event: AnalyticsEventType) => {
  const snapshot = await captureUserSnapshot(userId);

  if (!snapshot) {
    return;
  }

  return insertIfConsented(event, snapshot);
};

export const trackWithSnapshot = async (
  event: AnalyticsEventType,
  snapshot: UserAnalyticsSnapshot,
) => insertIfConsented(event, snapshot);

export const countByEvent = async (event: AnalyticsEventType, since?: Date) =>
  analyticsEventRepository.countByEvent(event, since);

export const recordShareClick = async (userId: string) => {
  void track(userId, 'share_clicked').catch(err =>
    console.error('Failed to track share_clicked:', err)
  );
};

export const recordPwaInstall = async (userId: string) => {
  void track(userId, 'pwa_installed').catch(err =>
    console.error('Failed to track pwa_installed:', err)
  );
};

export const recordCategoryTrendsView = async (userId: string) => {
  void track(userId, 'category_trends_viewed').catch(err =>
    console.error('Failed to track category_trends_viewed:', err)
  );
};
