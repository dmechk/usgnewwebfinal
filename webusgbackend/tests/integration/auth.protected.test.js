const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const env = require('../../src/config/env');
const { signAccessToken } = require('../../src/utils/jwt');

describe('protected auth routes', () => {
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

  it('rejects missing tokens', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });

  it('rejects malformed tokens', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-jwt');
    expect(response.status).toBe(401);
  });

  it('returns the authenticated identity', async () => {
    const user = await createUser();
    const token = signAccessToken(user);

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('admin@example.com');
    expect(response.body.data.user.role).toBe('admin');
    expect(JSON.stringify(response.body)).not.toMatch(/"password"/);
  });

  it('allows admins and rejects other roles on the admin probe', async () => {
    const admin = await createUser();
    const technician = await createUser({
      email: 'tech@example.com',
      role: 'technician',
    });

    const allowed = await request(app)
      .get('/api/v1/auth/admin')
      .set('Authorization', `Bearer ${signAccessToken(admin)}`);
    expect(allowed.status).toBe(200);

    const denied = await request(app)
      .get('/api/v1/auth/admin')
      .set('Authorization', `Bearer ${signAccessToken(technician)}`);
    expect(denied.status).toBe(403);
  });

  it('rejects a token after the password changes', async () => {
    const user = await createUser();
    const token = jwt.sign(
      { sub: String(user._id), role: user.role, iat: Math.floor(Date.now() / 1000) - 10 },
      env.JWT_SECRET,
      {
        algorithm: env.JWT_ALGORITHM,
        expiresIn: env.JWT_EXPIRES_IN_SECONDS,
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      }
    );

    user.password = 'brand-new-password';
    await user.save();

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const user = await createUser();
    const token = jwt.sign({ sub: String(user._id), role: user.role }, env.JWT_SECRET, {
      algorithm: env.JWT_ALGORITHM,
      expiresIn: 0,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});
