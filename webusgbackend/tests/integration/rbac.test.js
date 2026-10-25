'use strict';

const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { signAccessToken } = require('../../src/utils/jwt');
const { ROLES } = require('../../src/config/roles');

describe('Role-Based Access Control (RBAC) Integration Tests', () => {
  async function createRoleUser(role, email) {
    return User.create({
      name: `${role} Test User`,
      email,
      password: 'password123!',
      role,
      isActive: true,
      passwordChangeRequired: false,
    });
  }

  let adminItUser;
  let adminGalleryUser;
  let adminHrUser;
  let dafUser;
  let mdUser;

  let tokenAdminIt;
  let tokenAdmin;
  let tokenAdminHr;
  let tokenDaf;
  let tokenMd;

  beforeEach(async () => {
    adminItUser = await createRoleUser(ROLES.ADMIN_IT, 'admin_it@usg.org');
    adminGalleryUser = await createRoleUser(ROLES.ADMIN, 'admin_gallery@usg.org');
    adminHrUser = await createRoleUser(ROLES.ADMIN_HR, 'admin_hr@usg.org');
    dafUser = await createRoleUser(ROLES.DAF, 'daf@usg.org');
    mdUser = await createRoleUser(ROLES.MD, 'md@usg.org');

    tokenAdminIt = signAccessToken(adminItUser);
    tokenAdmin = signAccessToken(adminGalleryUser);
    tokenAdminHr = signAccessToken(adminHrUser);
    tokenDaf = signAccessToken(dafUser);
    tokenMd = signAccessToken(mdUser);
  });

  describe('1. Roles and Permissions Matrix Discovery', () => {
    it('GET /api/v1/auth/roles returns all 5 canonical roles and permission matrices', async () => {
      const res = await request(app).get('/api/v1/auth/roles');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roles).toContain(ROLES.ADMIN_IT);
      expect(res.body.data.roles).toContain(ROLES.ADMIN);
      expect(res.body.data.roles).toContain(ROLES.ADMIN_HR);
      expect(res.body.data.roles).toContain(ROLES.DAF);
      expect(res.body.data.roles).toContain(ROLES.MD);
    });

    it('Signin response includes permissions array and role-appropriate dashboard landing URL', async () => {
      const res = await request(app).post('/api/v1/auth/signin').send({
        email: 'admin_gallery@usg.org',
        password: 'password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe(ROLES.ADMIN);
      expect(res.body.data.user.dashboardUrl).toBe('/admin/gallery-news');
      expect(Array.isArray(res.body.data.user.permissions)).toBe(true);
      expect(res.body.data.user.permissions).toContain('gallery:create');
      expect(res.body.data.user.permissions).not.toContain('applicants:status:update');
    });
  });

  describe('2. Gallery & News Access Control (ADMIN vs Others)', () => {
    it('ADMIN can create gallery items', async () => {
      const res = await request(app)
        .post('/api/v1/gallery')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: 'New Ultrasound Suite',
          imageUrl: 'https://example.com/gallery1.jpg',
          category: 'Facilities',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.title).toBe('New Ultrasound Suite');
    });

    it('ADMIN_HR is FORBIDDEN from creating gallery items', async () => {
      const res = await request(app)
        .post('/api/v1/gallery')
        .set('Authorization', `Bearer ${tokenAdminHr}`)
        .send({
          title: 'Unauthorized Suite',
          imageUrl: 'https://example.com/gallery1.jpg',
        });

      expect(res.status).toBe(403);
    });

    it('ADMIN can create news articles', async () => {
      const res = await request(app)
        .post('/api/v1/news')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: 'Annual Ultrasound Seminar 2026',
          content: 'Seminar details and schedule.',
          summary: 'Annual gathering.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.article.title).toBe('Annual Ultrasound Seminar 2026');
    });

    it('DAF is FORBIDDEN from creating news articles', async () => {
      const res = await request(app)
        .post('/api/v1/news')
        .set('Authorization', `Bearer ${tokenDaf}`)
        .send({
          title: 'DAF News',
          content: 'Content',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('3. Careers Access Control (DAF vs Others)', () => {
    it('DAF can create a new career posting', async () => {
      const res = await request(app)
        .post('/api/v1/careers')
        .set('Authorization', `Bearer ${tokenDaf}`)
        .send({
          title: 'Senior Sonographer',
          department: 'Radiology',
          description: 'Looking for an experienced sonographer.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.career.title).toBe('Senior Sonographer');
    });

    it('ADMIN (Gallery) is FORBIDDEN from creating career postings', async () => {
      const res = await request(app)
        .post('/api/v1/careers')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          title: 'Invalid Posting',
          department: 'Radiology',
          description: 'Description',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('4. Recruitment Access Control (ADMIN_HR vs Others)', () => {
    let applicantId;

    beforeEach(async () => {
      const applicantRes = await request(app).post('/api/v1/applicants').send({
        fullName: 'Candidate Alex',
        email: 'alex@example.com',
        phone: '+1234567890',
        coverLetter: 'Passionate about ultrasound imaging.',
      });
      applicantId = applicantRes.body.data.applicant.id;
    });

    it('ADMIN_HR can view applicants and update applicant status', async () => {
      const listRes = await request(app)
        .get('/api/v1/applicants')
        .set('Authorization', `Bearer ${tokenAdminHr}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.applicants.length).toBeGreaterThan(0);

      const statusRes = await request(app)
        .put(`/api/v1/applicants/${applicantId}/status`)
        .set('Authorization', `Bearer ${tokenAdminHr}`)
        .send({ status: 'INTERVIEW' });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.applicant.status).toBe('INTERVIEW');
    });

    it('DAF is FORBIDDEN from reading or modifying applicant pipeline', async () => {
      const getRes = await request(app)
        .get('/api/v1/applicants')
        .set('Authorization', `Bearer ${tokenDaf}`);

      expect(getRes.status).toBe(403);

      const updateRes = await request(app)
        .put(`/api/v1/applicants/${applicantId}/status`)
        .set('Authorization', `Bearer ${tokenDaf}`)
        .send({ status: 'REJECTED' });

      expect(updateRes.status).toBe(403);
    });
  });

  describe('5. MD (Managing Director) Oversight Permissions', () => {
    it('MD can read applicants and reports overview', async () => {
      const appRes = await request(app)
        .get('/api/v1/applicants')
        .set('Authorization', `Bearer ${tokenMd}`);

      expect(appRes.status).toBe(200);

      const repRes = await request(app)
        .get('/api/v1/reports/overview')
        .set('Authorization', `Bearer ${tokenMd}`);

      expect(repRes.status).toBe(200);
      expect(repRes.body.data.metrics).toBeDefined();
    });

    it('MD is read-only and FORBIDDEN from creating gallery items or careers', async () => {
      const postGallery = await request(app)
        .post('/api/v1/gallery')
        .set('Authorization', `Bearer ${tokenMd}`)
        .send({ title: 'MD Suite', imageUrl: 'https://example.com/test.jpg' });

      expect(postGallery.status).toBe(403);

      const postCareer = await request(app)
        .post('/api/v1/careers')
        .set('Authorization', `Bearer ${tokenMd}`)
        .send({ title: 'MD Job', department: 'Executive', description: 'Desc' });

      expect(postCareer.status).toBe(403);
    });
  });

  describe('6. ADMIN_IT Super Admin and Role Assignment', () => {
    it('ADMIN_IT can assign and promote user roles', async () => {
      const targetUser = await createRoleUser(ROLES.ADMIN, 'promotee@usg.org');

      const res = await request(app)
        .put(`/api/v1/users/${targetUser.id}/role`)
        .set('Authorization', `Bearer ${tokenAdminIt}`)
        .send({ role: ROLES.ADMIN_HR });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe(ROLES.ADMIN_HR);

      const refreshed = await User.findById(targetUser.id);
      expect(refreshed.role).toBe(ROLES.ADMIN_HR);
    });

    it('Non-super-admins cannot assign roles', async () => {
      const targetUser = await createRoleUser(ROLES.ADMIN, 'promotee2@usg.org');

      const res = await request(app)
        .put(`/api/v1/users/${targetUser.id}/role`)
        .set('Authorization', `Bearer ${tokenAdminHr}`)
        .send({ role: ROLES.ADMIN_IT });

      expect(res.status).toBe(403);
    });

    it('ADMIN_IT can view audit logs', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${tokenAdminIt}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.logs)).toBe(true);
    });

    it('DAF is FORBIDDEN from viewing audit logs', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${tokenDaf}`);

      expect(res.status).toBe(403);
    });
  });
});
