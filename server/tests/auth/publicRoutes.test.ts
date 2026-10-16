import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../src/app';

describe('public routes', () => {
  it('GET /health is 200', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
  });

  it('GET / is 200', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
  });

  it('POST /api/auth/google-login is reachable without a token', async () => {
    const res = await request(app).post('/api/auth/google-login').send({});

    expect(res.status).toBe(200);
  });

  it('GET /api/invitations/:token is reachable without a token', async () => {
    const res = await request(app).get('/api/invitations/some-token');

    expect(res.status).toBe(200);
  });

  it('GET /api/shortcut/token is intentionally open (no auth middleware)', async () => {
    const res = await request(app).get('/api/shortcut/token');

    expect(res.status).toBe(200);
  });

  it('POST /api/auth/dev-login is not served when DEV_AUTH_BYPASS is off', async () => {
    const res = await request(app).post('/api/auth/dev-login').send({});

    expect(res.status).toBe(401);
  });
});
