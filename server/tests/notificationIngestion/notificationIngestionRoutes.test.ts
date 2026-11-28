import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import app from '../../src/app';
import { ingestNotification } from '../../src/notificationIngestion/notificationIngestionService';

vi.mock('../../src/notificationIngestion/notificationIngestionService', () => ({
  ingestNotification: vi.fn(async () => ({
    outcome: 'created',
    transactionId: 'tx-1',
    needsCategory: true,
  })),
}));

const payload = {
  eventKey: 'k'.repeat(64),
  packageName: 'com.google.android.apps.walletnfcrel',
  title: 'a m p m',
  text: '₪44.80 with American Express Hever ••1135',
  postedAt: '2026-11-28T14:00:00+02:00',
  appVersion: '1.0.0',
};

describe('POST /api/shortcut/notifications', () => {
  it('passes the validated payload and token user to the service', async () => {
    const res = await request(app)
      .post('/api/shortcut/notifications')
      .set('Authorization', 'Shortcut valid-shortcut-token')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      outcome: 'created',
      transactionId: 'tx-1',
      needsCategory: true,
    });
    expect(ingestNotification).toHaveBeenCalledWith('shortcut-user-id', payload);
  });
});
