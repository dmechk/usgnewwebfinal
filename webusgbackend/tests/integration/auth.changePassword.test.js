const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { signAccessToken } = require('../../src/utils/jwt');

describe('POST /api/v1/auth/change-password', () => {
  async function createInitialUser() {
    return User.create({
      name: 'Dr. Initial',
      email: 'doctor@clinic.org',
      password: 'old-temporary-password',
      role: 'radiologist',
      isActive: true,
      passwordChangeRequired: true,
    });
  }

  it('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .post('/api/v1/auth/change-password')
      .send({
        currentPassword: 'old-temporary-password',
        newPassword: 'brand-new-secure-password',
      });

    expect(response.status).toBe(401);
  });

  it('rejects when current password does not match', async () => {
    const user = await createInitialUser();
    const token = signAccessToken(user);

    const response = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrong-current-password',
        newPassword: 'brand-new-secure-password',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_PASSWORD');
  });

  it('changes password successfully and sets passwordChangeRequired to false', async () => {
    const user = await createInitialUser();
    const token = signAccessToken(user);

    const response = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'old-temporary-password',
        newPassword: 'brand-new-secure-password',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.passwordChangeRequired).toBe(false);

    // Verify user can now sign in with the new password
    const signinResponse = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'doctor@clinic.org',
        password: 'brand-new-secure-password',
      });

    expect(signinResponse.status).toBe(200);
    expect(signinResponse.body.success).toBe(true);
  });
});
