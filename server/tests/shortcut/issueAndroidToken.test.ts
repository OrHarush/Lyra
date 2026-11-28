import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as shortcutCredentialRepository from '../../src/repositories/shortcutCredentialRepository';
import * as userActivityRepository from '../../src/repositories/userActivityRepository';
import * as userRepository from '../../src/repositories/userRepository';
import { issueAndroidToken, revokeAllForUser } from '../../src/services/shortcutService';

vi.mock('../../src/repositories/shortcutCredentialRepository', () => ({
  create: vi.fn(),
  deactivateForUserByPlatform: vi.fn(),
  deactivateAllForUser: vi.fn(),
}));

vi.mock('../../src/repositories/userActivityRepository', () => ({ createEvent: vi.fn() }));
vi.mock('../../src/repositories/userRepository', () => ({ findById: vi.fn() }));

vi.mock('../../src/models/ShortcutPairingCode', () => ({
  default: { deleteMany: vi.fn() },
}));

const USER_ID = '64b7f0c2a1b2c3d4e5f60718';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(userRepository.findById).mockResolvedValue({ name: 'Or' } as never);
  vi.mocked(userActivityRepository.createEvent).mockResolvedValue(undefined as never);
});

describe('issueAndroidToken', () => {
  it('replaces the previous android credential, signs a token for the new one and audits it', async () => {
    const token = await issueAndroidToken(USER_ID);

    const claims = jwt.verify(token, process.env.SHORTCUT_JWT_SECRET as string) as jwt.JwtPayload;
    expect(claims.userId).toBe(USER_ID);
    expect(shortcutCredentialRepository.deactivateForUserByPlatform).toHaveBeenCalledWith(
      USER_ID,
      'android'
    );
    expect(shortcutCredentialRepository.create).toHaveBeenCalledWith(
      claims.tokenId,
      USER_ID,
      'android'
    );
    expect(userActivityRepository.createEvent).toHaveBeenCalledWith(
      USER_ID,
      'Or',
      'SHORTCUT_TOKEN_ISSUED'
    );
  });

  it('does not hand out a token when the audit write fails', async () => {
    vi.mocked(userActivityRepository.createEvent).mockRejectedValue(new Error('db down'));

    await expect(issueAndroidToken(USER_ID)).rejects.toThrow('db down');
  });
});

describe('revokeAllForUser', () => {
  it('audits the revocation', async () => {
    await revokeAllForUser(USER_ID);

    expect(shortcutCredentialRepository.deactivateAllForUser).toHaveBeenCalledWith(USER_ID);
    expect(userActivityRepository.createEvent).toHaveBeenCalledWith(
      USER_ID,
      'Or',
      'SHORTCUT_TOKEN_REVOKED'
    );
  });
});
