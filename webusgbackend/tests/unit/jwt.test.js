const jwt = require('jsonwebtoken');
const env = require('../../src/config/env');
const { signAccessToken, verifyAccessToken } = require('../../src/utils/jwt');
const AppError = require('../../src/utils/appError');

describe('jwt utils', () => {
  const user = { _id: '507f1f77bcf86cd799439011', role: 'admin' };

  it('signs a token with sub, role, iat, exp, issuer and audience', () => {
    const token = signAccessToken(user);
    const payload = jwt.decode(token);

    expect(payload.sub).toBe(String(user._id));
    expect(payload.role).toBe('admin');
    expect(payload.iss).toBe(env.JWT_ISSUER);
    expect(payload.aud).toBe(env.JWT_AUDIENCE);
    expect(typeof payload.iat).toBe('number');
    expect(typeof payload.exp).toBe('number');
    expect(payload.exp - payload.iat).toBe(env.JWT_EXPIRES_IN_SECONDS);
    expect(payload).not.toHaveProperty('password');
  });

  it('verifies a valid token', () => {
    const token = signAccessToken(user);
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(String(user._id));
  });

  it('rejects a token signed with a different secret', () => {
    const token = jwt.sign({ sub: user._id, role: user.role }, 'another-secret-that-is-32-chars-min', {
      algorithm: 'HS256',
      expiresIn: 60,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    expect(() => verifyAccessToken(token)).toThrow(AppError);
  });

  it('rejects an expired token', () => {
    const token = jwt.sign({ sub: user._id, role: user.role }, env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: 0,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    expect(() => verifyAccessToken(token)).toThrow(AppError);
    try {
      verifyAccessToken(token);
    } catch (err) {
      expect(err.code).toBe('TOKEN_EXPIRED');
    }
  });
});
