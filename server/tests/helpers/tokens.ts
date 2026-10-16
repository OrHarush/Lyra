import jwt from 'jsonwebtoken';

interface TokenOptions {
  userId?: string;
  role?: string;
  secret?: string;
  issuer?: string;
  audience?: string;
  expiresIn?: jwt.SignOptions['expiresIn'];
}

const toBase64Url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

export const signTestToken = ({
  userId = 'user-1',
  role = 'user',
  secret = process.env.JWT_SECRET!,
  issuer = process.env.JWT_ISSUER!,
  audience = process.env.JWT_AUDIENCE!,
  expiresIn = '1h',
}: TokenOptions = {}) =>
  jwt.sign({ userId, role }, secret, { algorithm: 'HS256', issuer, audience, expiresIn });

export const signUserToken = () => signTestToken({ role: 'user' });

export const signAdminToken = () => signTestToken({ role: 'admin' });

export const signExpiredToken = () => signTestToken({ expiresIn: -60 });

export const signTokenWithoutUserId = () =>
  jwt.sign({ role: 'user' }, process.env.JWT_SECRET!, {
    algorithm: 'HS256',
    issuer: process.env.JWT_ISSUER!,
    audience: process.env.JWT_AUDIENCE!,
  });

export const signUnsignedToken = () => {
  const header = toBase64Url({ alg: 'none', typ: 'JWT' });
  const payload = toBase64Url({
    userId: 'user-1',
    role: 'admin',
    iss: process.env.JWT_ISSUER,
    aud: process.env.JWT_AUDIENCE,
  });

  return `${header}.${payload}.`;
};

export const bearer = (token: string) => `Bearer ${token}`;

export const invalidAuthHeaders: Array<[string, string | undefined]> = [
  ['no header', undefined],
  ['Basic scheme', 'Basic dXNlcjpwYXNz'],
  ['empty bearer token', 'Bearer '],
  ['garbage token', 'Bearer not-a-jwt'],
  ['expired token', bearer(signExpiredToken())],
  ['wrong secret', bearer(signTestToken({ secret: 'some-other-secret' }))],
  ['wrong issuer', bearer(signTestToken({ issuer: 'evil-issuer' }))],
  ['wrong audience', bearer(signTestToken({ audience: 'evil-audience' }))],
  ['alg none', bearer(signUnsignedToken())],
  ['payload without userId', bearer(signTokenWithoutUserId())],
];
