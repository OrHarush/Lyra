import { describe, expect, it } from 'vitest';

import { IngestNotificationSchema } from '../notificationIngestion';

const valid = {
  eventKey: 'a'.repeat(64),
  packageName: 'com.google.android.apps.walletnfcrel',
  title: 'a m p m',
  text: '₪44.80 with American Express Hever ••1135',
  postedAt: '2026-11-28T14:00:00+02:00',
  appVersion: '1.0.0',
};

describe('IngestNotificationSchema', () => {
  it('accepts the real Wallet payload', () => {
    expect(IngestNotificationSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts UTC postedAt', () => {
    expect(
      IngestNotificationSchema.safeParse({ ...valid, postedAt: '2026-11-28T12:00:00Z' }).success
    ).toBe(true);
  });

  it.each([
    ['postedAt without a time', { postedAt: '2026-11-28' }],
    ['short eventKey', { eventKey: 'abc' }],
    ['missing appVersion', { appVersion: '' }],
  ])('rejects %s', (_label, override) => {
    expect(IngestNotificationSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });
});
