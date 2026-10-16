import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../src/app';
import { bearer, signAdminToken } from '../helpers/tokens';

const cronPaths = [
  '/api/cron/recurring-transactions',
  '/api/cron/sync-balances',
  '/api/cron/debug-run-for-me',
];

describe('cron authorization', () => {
  it.each(cronPaths)('POST %s without the secret is 401', async path => {
    const res = await request(app).post(path);

    expect(res.status).toBe(401);
  });

  it.each(cronPaths)('POST %s with a wrong secret is 401', async path => {
    const res = await request(app).post(path).set('x-cron-secret', 'wrong-secret');

    expect(res.status).toBe(401);
  });

  it.each(cronPaths)('POST %s with a wrong-length secret is 401', async path => {
    const res = await request(app).post(path).set('x-cron-secret', 'x');

    expect(res.status).toBe(401);
  });

  it.each(cronPaths)('POST %s with an admin JWT instead of the secret is 401', async path => {
    const res = await request(app).post(path).set('Authorization', bearer(signAdminToken()));

    expect(res.status).toBe(401);
  });

  it.each(cronPaths)('POST %s with the correct secret is allowed', async path => {
    const res = await request(app).post(path).set('x-cron-secret', process.env.CRON_SECRET!);

    expect(res.status).toBe(200);
  });
});
