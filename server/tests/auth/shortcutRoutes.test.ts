import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../src/app';
import { bearer, signUserToken } from '../helpers/tokens';

type Method = 'get' | 'post' | 'delete';

const userJwtRoutes: Array<[Method, string]> = [
  ['post', '/api/shortcut/init'],
  ['post', '/api/shortcut/approve'],
  ['post', '/api/shortcut/android/token'],
  ['get', '/api/shortcut/macro'],
  ['get', '/api/shortcut/connection'],
  ['delete', '/api/shortcut/revoke'],
];

const shortcutTokenRoutes: Array<[Method, string]> = [
  ['get', '/api/shortcut/status'],
  ['get', '/api/shortcut/categories'],
  ['post', '/api/shortcut/transaction'],
  ['post', '/api/shortcut/transaction/android'],
  ['post', '/api/shortcut/notifications'],
];

describe('shortcut routes that need a user JWT', () => {
  it.each(userJwtRoutes)('%s %s without a token is 401', async (method, path) => {
    const res = await request(app)[method](path);

    expect(res.status).toBe(401);
  });

  it.each(userJwtRoutes)('%s %s with a shortcut token is 401', async (method, path) => {
    const res = await request(app)[method](path).set('Authorization', 'Shortcut valid-shortcut-token');

    expect(res.status).toBe(401);
  });
});

describe('shortcut routes that need a shortcut token', () => {
  it.each(shortcutTokenRoutes)('%s %s without a token is 401', async (method, path) => {
    const res = await request(app)[method](path);

    expect(res.status).toBe(401);
  });

  it.each(shortcutTokenRoutes)('%s %s with a user JWT is 401', async (method, path) => {
    const res = await request(app)[method](path).set('Authorization', bearer(signUserToken()));

    expect(res.status).toBe(401);
  });

  it.each(shortcutTokenRoutes)('%s %s with an invalid shortcut token is 401', async (method, path) => {
    const res = await request(app)[method](path).set('Authorization', 'Shortcut bad-token');

    expect(res.status).toBe(401);
  });

  it.each([
    ['get', '/api/shortcut/status'],
    ['get', '/api/shortcut/categories'],
  ] as const)('%s %s with a valid shortcut token is allowed', async (method, path) => {
    const res = await request(app)[method](path).set('Authorization', 'Shortcut valid-shortcut-token');

    expect(res.status).toBe(200);
  });

  it('POST /api/shortcut/notifications with a valid token rejects an invalid body with 400', async () => {
    const res = await request(app)
      .post('/api/shortcut/notifications')
      .set('Authorization', 'Shortcut valid-shortcut-token')
      .send({ eventKey: 'short' });

    expect(res.status).toBe(400);
  });
});
