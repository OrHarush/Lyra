import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../src/app';
import { bearer, signAdminToken, signUserToken } from '../helpers/tokens';

const adminRoutes: Array<['get' | 'post' | 'delete', string]> = [
  ['get', '/api/admin/overview'],
  ['get', '/api/admin/activity'],
  ['get', '/api/admin/analytics'],
  ['get', '/api/admin/analytics/activity'],
  ['get', '/api/admin/retention'],
  ['get', '/api/admin/snapshot'],
  ['get', '/api/admin/users'],
  ['post', '/api/admin/debug/run-for-me'],
  ['post', '/api/admin/debug/restore-for-me'],
  ['get', '/api/admin/debug/snapshots'],
  ['delete', '/api/admin/debug/snapshots/abc'],
  ['get', '/api/admin/debug/balance-breakdown'],
];

describe('admin authorization', () => {
  it.each(adminRoutes)('%s %s without a token is 401', async (method, path) => {
    const res = await request(app)[method](path);

    expect(res.status).toBe(401);
  });

  it.each(adminRoutes)('%s %s with a non-admin token is 403', async (method, path) => {
    const res = await request(app)[method](path).set('Authorization', bearer(signUserToken()));

    expect(res.status).toBe(403);
  });

  it.each([
    ['get', '/api/admin/overview'],
    ['get', '/api/admin/users'],
  ] as const)('%s %s with an admin token is allowed', async (method, path) => {
    const res = await request(app)[method](path).set('Authorization', bearer(signAdminToken()));

    expect(res.status).toBe(200);
  });
});
