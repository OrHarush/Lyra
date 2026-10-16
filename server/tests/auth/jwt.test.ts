import { describe, expect, it } from 'vitest';

import { verifyAndExtractBearerToken } from '../../src/auth/jwt';
import { bearer, invalidAuthHeaders, signAdminToken, signUserToken } from '../helpers/tokens';

describe('verifyAndExtractBearerToken', () => {
  it.each(invalidAuthHeaders)('rejects %s', (_label, header) => {
    expect(verifyAndExtractBearerToken(header)).toBeNull();
  });

  it('returns userId and role for a valid user token', () => {
    expect(verifyAndExtractBearerToken(bearer(signUserToken()))).toEqual({
      userId: 'user-1',
      role: 'user',
    });
  });

  it('returns the admin role for an admin token', () => {
    expect(verifyAndExtractBearerToken(bearer(signAdminToken()))?.role).toBe('admin');
  });
});
