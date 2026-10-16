import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../src/app';
import { bearer, invalidAuthHeaders, signUserToken } from '../helpers/tokens';

const protectedPrefixes = [
  '/api/workspaces',
  '/api/invitations',
  '/api/users',
  '/api/transactions',
  '/api/accounts',
  '/api/categories',
  '/api/budgets',
  '/api/goals',
  '/api/recurring-templates',
  '/api/payment-methods',
  '/api/feedback',
  '/api/monthly-report',
  '/api/admin/overview',
  '/api/analytics',
  '/api/chat',
  '/api/import',
];

describe('protected boundary', () => {
  it.each(protectedPrefixes)('GET %s without a token is 401', async path => {
    const res = await request(app).get(path);

    expect(res.status).toBe(401);
  });

  it('unknown /api paths without a token are 401, not 404', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(401);
  });

  describe('GET /api/auth/me', () => {
    it.each(invalidAuthHeaders)('rejects %s', async (_label, header) => {
      const req = request(app).get('/api/auth/me');
      const res = await (header ? req.set('Authorization', header) : req);

      expect(res.status).toBe(401);
    });

    it('accepts a valid token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', bearer(signUserToken()));

      expect(res.status).toBe(200);
    });
  });

  it('lets a valid token through the protected stack (reaches the admin role gate)', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', bearer(signUserToken()));

    expect(res.status).toBe(403);
  });

  it('POST /api/auth/accept-terms requires a token', async () => {
    const res = await request(app).post('/api/auth/accept-terms').send({});

    expect(res.status).toBe(401);
  });
});
