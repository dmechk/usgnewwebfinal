const User = require('../../src/models/User');
const env = require('../../src/config/env');
const { signin, GENERIC_AUTH_FAILURE } = require('../../src/services/auth.service');
const { verifyAccessToken } = require('../../src/utils/jwt');

describe('auth.service signin', () => {
  async function createUser(overrides = {}) {
    return User.create({
      name: 'Clinic Admin',
      email: 'Admin@Example.com',
      password: 'correct-horse-battery',
      role: 'admin',
      isActive: true,
      passwordChangeRequired: false,
      ...overrides,
    });
  }

  it('verifies valid credentials and returns a signed token', async () => {
    await createUser();
    const result = await signin({
      email: 'admin@example.com',
      password: 'correct-horse-battery',
    });

    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(env.JWT_EXPIRES_IN_SECONDS);
    expect(result.user.email).toBe('admin@example.com');
    expect(result.user).not.toHaveProperty('password');
    expect(result.accessToken).toEqual(expect.any(String));

    const payload = verifyAccessToken(result.accessToken);
    expect(payload.sub).toBe(result.user.id);
    expect(result.user.lastLoginAt).toBeInstanceOf(Date);
  });

  it('rejects an incorrect password with a generic message', async () => {
    await createUser();
    await expect(
      signin({ email: 'admin@example.com', password: 'wrong-password' })
    ).rejects.toMatchObject({
      message: GENERIC_AUTH_FAILURE,
      statusCode: 401,
    });
  });

  it('rejects an unknown email with the same generic message', async () => {
    await expect(
      signin({ email: 'missing@example.com', password: 'correct-horse-battery' })
    ).rejects.toMatchObject({
      message: GENERIC_AUTH_FAILURE,
      statusCode: 401,
    });
  });

  it('rejects a disabled account without issuing a token', async () => {
    await createUser({ isActive: false });
    await expect(
      signin({ email: 'admin@example.com', password: 'correct-horse-battery' })
    ).rejects.toMatchObject({
      message: 'Account is disabled',
      statusCode: 403,
    });
  });

  it('rejects malformed credentials', async () => {
    await expect(signin({ email: 123, password: true })).rejects.toMatchObject({
      message: GENERIC_AUTH_FAILURE,
      statusCode: 401,
    });
  });
});
