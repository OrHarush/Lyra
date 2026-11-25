import crypto from 'crypto';

import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../src/app';
import { bearer, signTestToken } from '../helpers/tokens';

type Row = Record<string, any>;

const db = vi.hoisted(() => ({
  clients: [] as Row[],
  requests: [] as Row[],
  connections: [] as Row[],
  tokens: [] as Row[],
  audit: [] as Row[],
  members: new Map<string, Set<string>>(),
  users: new Set<string>(),
}));

const isLive = (row: Row, field = 'expiresAt') => !row[field] || row[field] > new Date();

vi.mock('../../src/repositories/mcpOAuthRepository', () => ({
  insertClient: async (clientId: string, clientInfo: Row) =>
    db.clients.push({ clientId, clientInfo }),
  findClient: async (clientId: string) => db.clients.find(c => c.clientId === clientId) ?? null,
  insertAuthorizationRequest: async (data: Row) => db.requests.push({ ...data, status: 'pending' }),
  findPendingRequest: async (requestId: string) =>
    db.requests.find(r => r.requestId === requestId && r.status === 'pending' && isLive(r)) ?? null,
  approvePendingRequest: async (requestId: string, approval: Row) => {
    const row = db.requests.find(
      r => r.requestId === requestId && r.status === 'pending' && isLive(r)
    );

    if (!row) {
      return null;
    }

    Object.assign(row, approval, {
      status: 'approved',
      userId: new Types.ObjectId(approval.userId),
    });

    return row;
  },
  denyPendingRequest: async (requestId: string) => {
    const row = db.requests.find(r => r.requestId === requestId && r.status === 'pending');

    return row ? Object.assign(row, { status: 'denied' }) : null;
  },
  findApprovedByCodeHash: async (codeHash: string) =>
    db.requests.find(
      r => r.codeHash === codeHash && r.status === 'approved' && isLive(r, 'codeExpiresAt')
    ) ?? null,
  consumeApprovedCode: async (codeHash: string) => {
    const row = db.requests.find(
      r => r.codeHash === codeHash && r.status === 'approved' && isLive(r, 'codeExpiresAt')
    );

    return row ? Object.assign(row, { status: 'used' }) : null;
  },
}));

vi.mock('../../src/repositories/mcpCredentialRepository', () => {
  const sameId = (a: unknown, b: unknown) => String(a) === String(b);
  const findActive = (id: unknown) =>
    db.connections.find(c => sameId(c._id, id) && !c.revokedAt) ?? null;

  return {
    insertConnection: async (data: Row) => {
      const row = {
        ...data,
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(data.userId),
        createdAt: new Date(),
      };
      db.connections.push(row);

      return row;
    },
    findActiveConnection: async (id: unknown) => findActive(id),
    findActiveConnectionsForUser: async (userId: string) =>
      db.connections.filter(c => sameId(c.userId, userId) && !c.revokedAt),
    findActiveOAuthConnectionsForClient: async (userId: string, clientId: string) =>
      db.connections.filter(
        c => sameId(c.userId, userId) && c.clientId === clientId && !c.revokedAt
      ),
    revokeConnection: async (id: unknown) => {
      const row = findActive(id);

      return row ? Object.assign(row, { revokedAt: new Date() }) : null;
    },
    touchConnectionLastUsed: async (id: unknown) => {
      const row = findActive(id);

      if (row) {
        row.lastUsedAt = new Date();
      }
    },
    insertToken: async (data: Row) => db.tokens.push({ ...data }),
    findLiveToken: async (tokenHash: string, type: string) =>
      db.tokens.find(t => t.tokenHash === tokenHash && t.type === type && isLive(t)) ?? null,
    consumeRefreshToken: async (tokenHash: string) => {
      const row = db.tokens.find(
        t => t.tokenHash === tokenHash && t.type === 'refresh' && !t.consumedAt && isLive(t)
      );

      return row ? Object.assign(row, { consumedAt: new Date() }) : null;
    },
    findTokenByHash: async (tokenHash: string) =>
      db.tokens.find(t => t.tokenHash === tokenHash) ?? null,
    deleteTokensForConnection: async (id: unknown) => {
      db.tokens = db.tokens.filter(t => !sameId(t.connectionId, id));
    },
  };
});

vi.mock('../../src/repositories/mcpAuditEventRepository', () => ({
  insert: async (data: Row) => db.audit.push(data),
}));

vi.mock('../../src/mcp/readModel', async importOriginal => ({
  ...(await importOriginal<object>()),
  findWorkspace: async () => {
    const mongoose = (await import('mongoose')).default;

    return mongoose.mongo.Collection.prototype.insertOne.call({}, { sneaky: true });
  },
}));

vi.mock('../../src/models/User', () => ({
  default: { exists: async ({ _id }: { _id: unknown }) => db.users.has(String(_id)) },
}));

vi.mock('../../src/repositories/workspaceMemberRepository', async importOriginal => ({
  ...(await importOriginal<object>()),
  findByUser: async (userId: string) =>
    [...(db.members.get(userId) ?? [])].map(id => ({ workspaceId: new Types.ObjectId(id) })),
}));

vi.mock('../../src/repositories/workspaceRepository', async importOriginal => ({
  ...(await importOriginal<object>()),
  findManyByIds: async (ids: unknown[]) =>
    ids.map(id => ({ _id: id, name: `Workspace ${String(id).slice(-4)}`, type: 'personal' })),
}));

vi.mock('../../src/services/workspaceService', async importOriginal => ({
  ...(await importOriginal<object>()),
  resolveWorkspaceForRequest: vi.fn(async () => new Types.ObjectId()),
  isUserMemberOf: async (userId: string, workspaceId: unknown) =>
    db.members.get(userId)?.has(String(workspaceId)) ?? false,
}));

const REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';
const RESOURCE = 'http://localhost:5000/mcp';
const MCP_HEADERS = { Accept: 'application/json, text/event-stream' };
const TOOLS_LIST = { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} };

const pkcePair = () => {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

  return { verifier, challenge };
};

const seedUser = () => {
  const userId = new Types.ObjectId().toString();
  const workspaceId = new Types.ObjectId().toString();
  db.users.add(userId);
  db.members.set(userId, new Set([workspaceId]));

  return { userId, workspaceId, webToken: bearer(signTestToken({ userId })) };
};

const registerClient = async () => {
  const res = await request(app)
    .post('/register')
    .send({
      client_name: 'Claude',
      redirect_uris: [REDIRECT_URI],
      token_endpoint_auth_method: 'none',
    });

  expect(res.status).toBe(201);

  return res.body.client_id as string;
};

const startAuthorization = async (clientId: string, challenge: string) => {
  const res = await request(app).get('/authorize').query({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: 'xyz',
    resource: RESOURCE,
  });

  expect(res.status).toBe(302);

  return new URL(res.headers.location).searchParams.get('request') as string;
};

const authorizeAndExchange = async () => {
  const user = seedUser();
  const clientId = await registerClient();
  const { verifier, challenge } = pkcePair();
  const requestId = await startAuthorization(clientId, challenge);

  const approve = await request(app)
    .post(`/api/mcp/oauth/requests/${requestId}/approve`)
    .set('Authorization', user.webToken)
    .send({ workspaceId: user.workspaceId });
  const callback = new URL(approve.body.data.redirectUrl);

  const tokenRes = await request(app)
    .post('/token')
    .type('form')
    .send({
      grant_type: 'authorization_code',
      client_id: clientId,
      code: callback.searchParams.get('code'),
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
      resource: RESOURCE,
    });

  return { user, clientId, callback, tokenRes };
};

const callMcp = (authorization?: string) => {
  const req = request(app).post('/mcp').set(MCP_HEADERS);

  return (authorization ? req.set('Authorization', authorization) : req).send(TOOLS_LIST);
};

beforeEach(() => {
  db.clients = [];
  db.requests = [];
  db.connections = [];
  db.tokens = [];
  db.audit = [];
  db.members.clear();
  db.users.clear();
});

describe('MCP discovery', () => {
  it('serves protected resource metadata pointing at Lyra as the authorization server', async () => {
    const res = await request(app).get('/.well-known/oauth-protected-resource/mcp');

    expect(res.status).toBe(200);
    expect(res.body.resource).toBe(RESOURCE);
    expect(res.body.scopes_supported).toEqual(['mcp:read']);
  });

  it('serves authorization server metadata with PKCE S256', async () => {
    const res = await request(app).get('/.well-known/oauth-authorization-server');

    expect(res.status).toBe(200);
    expect(res.body.code_challenge_methods_supported).toContain('S256');
    expect(res.body.registration_endpoint).toBeDefined();
  });

  it('rejects client registration with a non-https redirect', async () => {
    const res = await request(app)
      .post('/register')
      .send({ client_name: 'Evil', redirect_uris: ['http://evil.example/cb'] });

    expect(res.status).toBe(400);
  });
});

describe('/mcp token separation', () => {
  it('returns 401 with a resource_metadata challenge when no token is sent', async () => {
    const res = await callMcp();

    expect(res.status).toBe(401);
    expect(res.headers['www-authenticate']).toContain(
      'resource_metadata="http://localhost:5000/.well-known/oauth-protected-resource/mcp"'
    );
  });

  it('rejects the web login JWT', async () => {
    const res = await callMcp(bearer(signTestToken()));

    expect(res.status).toBe(401);
  });

  it('rejects the MCP token on /api', async () => {
    const { tokenRes } = await authorizeAndExchange();
    const res = await request(app)
      .get('/api/mcp/connections')
      .set('Authorization', bearer(tokenRes.body.access_token));

    expect(res.status).toBe(401);
  });
});

describe('OAuth authorization code flow', () => {
  it('issues a scoped token bound to the approving session user and pinned workspace', async () => {
    const { user, callback, tokenRes } = await authorizeAndExchange();

    expect(callback.searchParams.get('state')).toBe('xyz');
    expect(tokenRes.status).toBe(200);
    expect(tokenRes.body.scope).toBe('mcp:read');
    expect(db.connections[0].userId.toString()).toBe(user.userId);
    expect(db.connections[0].workspaceId.toString()).toBe(user.workspaceId);
    expect(db.audit.map(e => e.type)).toContain('MCP_CONNECTED');

    const res = await callMcp(bearer(tokenRes.body.access_token));

    expect(res.status).toBe(200);
    expect(res.text).toContain('getOverview');
  });

  it('refuses to approve a workspace the session user is not a member of', async () => {
    const user = seedUser();
    const clientId = await registerClient();
    const requestId = await startAuthorization(clientId, pkcePair().challenge);

    const res = await request(app)
      .post(`/api/mcp/oauth/requests/${requestId}/approve`)
      .set('Authorization', user.webToken)
      .send({ workspaceId: new Types.ObjectId().toString() });

    expect(res.status).toBe(403);
  });

  it('rejects a wrong PKCE verifier', async () => {
    const user = seedUser();
    const clientId = await registerClient();
    const requestId = await startAuthorization(clientId, pkcePair().challenge);
    const approve = await request(app)
      .post(`/api/mcp/oauth/requests/${requestId}/approve`)
      .set('Authorization', user.webToken)
      .send({ workspaceId: user.workspaceId });
    const code = new URL(approve.body.data.redirectUrl).searchParams.get('code');

    const res = await request(app).post('/token').type('form').send({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      code_verifier: pkcePair().verifier,
    });

    expect(res.status).toBe(400);
  });

  it('does not let an authorization code be used twice', async () => {
    const { clientId, callback } = await authorizeAndExchange();

    const res = await request(app)
      .post('/token')
      .type('form')
      .send({
        grant_type: 'authorization_code',
        client_id: clientId,
        code: callback.searchParams.get('code'),
        code_verifier: 'irrelevant',
      });

    expect(res.status).toBe(400);
  });
});

describe('revocation and lifecycle', () => {
  it('stops a revoked connection immediately', async () => {
    const { user, tokenRes } = await authorizeAndExchange();
    const list = await request(app).get('/api/mcp/connections').set('Authorization', user.webToken);

    await request(app)
      .delete(`/api/mcp/connections/${list.body.data[0].id}`)
      .set('Authorization', user.webToken)
      .expect(200);

    expect((await callMcp(bearer(tokenRes.body.access_token))).status).toBe(401);
  });

  it('rejects the token once the user is removed from the pinned workspace', async () => {
    const { user, tokenRes } = await authorizeAndExchange();
    db.members.get(user.userId)?.clear();

    expect((await callMcp(bearer(tokenRes.body.access_token))).status).toBe(401);
  });

  it('rejects the token once the user is deleted', async () => {
    const { user, tokenRes } = await authorizeAndExchange();
    db.users.delete(user.userId);

    expect((await callMcp(bearer(tokenRes.body.access_token))).status).toBe(401);
  });

  it('rotates refresh tokens and revokes the connection when an old one is replayed', async () => {
    const { clientId, tokenRes } = await authorizeAndExchange();
    const refresh = (token: string) =>
      request(app)
        .post('/token')
        .type('form')
        .send({ grant_type: 'refresh_token', client_id: clientId, refresh_token: token });

    const rotated = await refresh(tokenRes.body.refresh_token);
    expect(rotated.status).toBe(200);

    const replay = await refresh(tokenRes.body.refresh_token);
    expect(replay.status).toBe(400);
    expect((await callMcp(bearer(rotated.body.access_token))).status).toBe(401);
    expect(db.audit.map(e => e.type)).toContain('MCP_REFRESH_REUSE_DETECTED');
  });

  it('blocks any database write a tool attempts during an MCP request', async () => {
    const { tokenRes } = await authorizeAndExchange();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = await request(app)
      .post('/mcp')
      .set(MCP_HEADERS)
      .set('Authorization', bearer(tokenRes.body.access_token))
      .send({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'getInvestments', arguments: {} },
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain('"isError":true');
    expect(errorSpy.mock.calls.flat().some(arg => arg?.name === 'ReadOnlyViolationError')).toBe(
      true
    );
    errorSpy.mockRestore();
  });

  it('mints a working personal token from Settings', async () => {
    const user = seedUser();
    const created = await request(app)
      .post('/api/mcp/connections/personal')
      .set('Authorization', user.webToken)
      .send({ workspaceId: user.workspaceId, name: 'My laptop' });

    expect(created.status).toBe(201);
    expect(created.body.data.token).toMatch(/^lyra_pat_/);
    expect((await callMcp(bearer(created.body.data.token))).status).toBe(200);
  });
});
