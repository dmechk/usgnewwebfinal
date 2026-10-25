const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { signAccessToken } = require('../../src/utils/jwt');

describe('Admin Staff Management Routes (/api/v1/users)', () => {
  async function createAdmin() {
    return User.create({
      name: 'Super Admin',
      email: 'admin_test@example.com',
      password: 'secure-password-123',
      role: 'admin',
      isActive: true,
      passwordChangeRequired: false,
    });
  }

  async function createTech() {
    return User.create({
      name: 'Tech User',
      email: 'tech_test@example.com',
      password: 'secure-password-123',
      role: 'technician',
      isActive: true,
      passwordChangeRequired: false,
    });
  }

  it('forbids non-admin users from accessing user management', async () => {
    const tech = await createTech();
    const token = signAccessToken(tech);

    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('allows admin to list users with pagination', async () => {
    const admin = await createAdmin();
    await createTech();
    const token = signAccessToken(admin);

    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.users.length).toBe(2);
    expect(response.body.data.pagination.total).toBe(2);
  });

  it('allows admin to create a new staff member', async () => {
    const admin = await createAdmin();
    const token = signAccessToken(admin);

    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dr. Jane Radiologist',
        email: 'jane@clinic.org',
        password: 'initial-secure-password',
        role: 'radiologist',
        passwordChangeRequired: true,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('jane@clinic.org');
    expect(response.body.data.user.role).toBe('radiologist');
    expect(response.body.data.user.passwordChangeRequired).toBe(true);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('allows admin to update user details and role', async () => {
    const admin = await createAdmin();
    const tech = await createTech();
    const token = signAccessToken(admin);

    const response = await request(app)
      .put(`/api/v1/users/${tech.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Senior Tech User',
        role: 'radiologist',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe('Senior Tech User');
    expect(response.body.data.user.role).toBe('radiologist');
  });

  it('prevents an admin from deactivating or deleting their own account', async () => {
    const admin = await createAdmin();
    const token = signAccessToken(admin);

    const deactivateResponse = await request(app)
      .put(`/api/v1/users/${admin.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false });

    expect(deactivateResponse.status).toBe(400);
    expect(deactivateResponse.body.code).toBe('SELF_DEACTIVATION_DENIED');

    const deleteResponse = await request(app)
      .delete(`/api/v1/users/${admin.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(400);
    expect(deleteResponse.body.code).toBe('SELF_DELETION_DENIED');
  });

  it('allows admin to delete another staff user', async () => {
    const admin = await createAdmin();
    const tech = await createTech();
    const token = signAccessToken(admin);

    const response = await request(app)
      .delete(`/api/v1/users/${tech.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const found = await User.findById(tech.id);
    expect(found).toBeNull();
  });
});
