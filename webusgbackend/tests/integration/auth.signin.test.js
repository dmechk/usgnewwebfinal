const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const env = require('../../src/config/env');

describe('POST /api/v1/auth/signin', () => {
  async function createUser(overrides = {}) {
    return User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'replace-with-a-secure-password',
      role: 'admin',
      isActive: true,
      passwordChangeRequired: false,
      ...overrides,
    });
  }

  it('returns a token, public user, and configured expiry', async () => {
    await createUser();

    const response = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'admin@example.com',
        password: 'replace-with-a-secure-password',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokenType).toBe('Bearer');
    expect(response.body.data.expiresIn).toBe(env.JWT_EXPIRES_IN_SECONDS);
    expect(response.body.data.user.email).toBe('admin@example.com');
    expect(JSON.stringify(response.body)).not.toMatch(/"password":/i);

    const payload = jwt.verify(response.body.data.accessToken, env.JWT_SECRET, {
      algorithms: [env.JWT_ALGORITHM],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
    expect(payload.sub).toBe(response.body.data.user.id);
    expect(payload.exp - payload.iat).toBe(env.JWT_EXPIRES_IN_SECONDS);
  });

  it('does not issue a token for invalid credentials', async () => {
    await createUser();

    const response = await request(app).post('/api/v1/auth/signin').send({
      email: 'admin@example.com',
      password: 'not-the-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
    expect(response.body.data).toBeUndefined();
  });

  it('rejects disabled accounts', async () => {
    await createUser({ isActive: false });

    const response = await request(app).post('/api/v1/auth/signin').send({
      email: 'admin@example.com',
      password: 'replace-with-a-secure-password',
    });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('ACCOUNT_DISABLED');
    expect(response.body.data).toBeUndefined();
  });

  it('rejects malformed input', async () => {
    const response = await request(app).post('/api/v1/auth/signin').send({
      email: 'not-an-email',
      password: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('rate limits repeated sign-in attempts', async () => {
    const limit = env.AUTH_RATE_LIMIT_MAX + 2;
    let got429 = false;
    for (let i = 0; i < limit; i += 1) {
      // Sequential requests so the in-memory counter accumulates reliably
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send({ email: `ratelimituser${i}@example.com`, password: 'whatever-password' });
      if (res.status === 429) {
        got429 = true;
        break;
      }
    }
    expect(got429).toBe(true);
  });
});
