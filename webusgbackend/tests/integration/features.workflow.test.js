const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Applicant = require('../../src/models/Applicant');
const Inquiry = require('../../src/models/Inquiry');
const AuditLog = require('../../src/models/AuditLog');
const { signAccessToken } = require('../../src/utils/jwt');

describe('Full Workflow Integration Tests - Ubumwe SACCO System Features', () => {
  let adminUser;
  let adminToken;

  beforeEach(async () => {
    // Clean up collections for isolated workflow tests
    await User.deleteMany({});
    await Applicant.deleteMany({});
    await Inquiry.deleteMany({});
    await AuditLog.deleteMany({});

    adminUser = await User.create({
      name: 'IT Administrator',
      email: 'admin.it@ubumwesacco.rw',
      password: 'StrongAdminPassword123!',
      role: 'ADMIN_IT',
      isActive: true,
      passwordChangeRequired: false,
    });

    adminToken = signAccessToken(adminUser);
  });

  describe('Phase 1 & 8: Job Application & Reference Number Generation', () => {
    it('creates job application with unique reference number and email notification tracking', async () => {
      const payload = {
        jobTitle: 'Senior Credit Analyst',
        fullName: 'Jean Claude Mugisha',
        email: 'jean.claude@example.com',
        phone: '+250788123456',
        coverLetter: 'I am applying for the Senior Credit Analyst position with 5 years experience.',
      };

      const res = await request(app)
        .post('/api/applicants')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceNumber).toBeDefined();
      expect(res.body.referenceNumber).toMatch(/^UB-JOB-\d{4}-[A-Z0-9]{6}$/);

      // Verify saved in MongoDB
      const saved = await Applicant.findOne({ email: 'jean.claude@example.com' });
      expect(saved).not.toBeNull();
      expect(saved.referenceNumber).toBe(res.body.referenceNumber);
      expect(saved.emailNotification).toBeDefined();
      expect(['PENDING', 'SENT', 'FAILED']).toContain(saved.emailNotification.status);
    });

    it('allows retry of application email notification', async () => {
      const applicant = await Applicant.create({
        jobTitle: 'Accountant',
        fullName: 'Marie Claire',
        email: 'marie.claire@example.com',
        phone: '+250788654321',
        referenceNumber: 'UB-JOB-2026-TEST01',
        emailNotification: { status: 'FAILED', attempts: 1, lastError: 'SMTP timeout' },
      });

      const res = await request(app)
        .post(`/api/applicants/${applicant._id}/retry-email`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await Applicant.findById(applicant._id);
      expect(updated.emailNotification.attempts).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Phase 2 & 3: Customer Inquiries, Acknowledgment, and Staff Replies', () => {
    it('creates customer inquiry with unique tracking reference number', async () => {
      const payload = {
        name: 'Eric Ndayisaba',
        email: 'eric.n@example.com',
        phone: '+250783111222',
        subject: 'Inquiry on SME Loan Interest Rates',
        message: 'Hello, what are the current annual interest rates and requirements for SME loan applications?',
      };

      const res = await request(app)
        .post('/api/inquiries')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceNumber).toBeDefined();
      expect(res.body.referenceNumber).toMatch(/^UB-INQ-\d{4}-[A-Z0-9]{6}$/);

      const saved = await Inquiry.findOne({ email: 'eric.n@example.com' });
      expect(saved).not.toBeNull();
      expect(saved.referenceNumber).toBe(res.body.referenceNumber);
      expect(saved.emailNotification).toBeDefined();
    });

    it('allows authorized staff to reply to customer inquiry with email notification', async () => {
      const inquiry = await Inquiry.create({
        name: 'Aline Umutoni',
        email: 'aline.u@example.com',
        phone: '+250788333444',
        subject: 'Savings Account Minimum Balance',
        message: 'What is the required minimum initial deposit for opening an individual savings account?',
        referenceNumber: 'UB-INQ-2026-ALIN01',
      });

      const feedbackPayload = {
        message: 'Dear Aline, the minimum opening deposit for an individual savings account is 5,000 RWF.',
        newStatus: 'resolved',
      };

      const res = await request(app)
        .post(`/api/inquiries/${inquiry._id}/feedback`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(feedbackPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inquiry.status).toBe('resolved');
      expect(res.body.data.feedback).toBeDefined();
      expect(res.body.data.feedback.message).toBe(feedbackPayload.message);
      expect(res.body.data.feedback.senderName).toBe(adminUser.name);

      // Verify audit log captured the feedback reply
      const audit = await AuditLog.findOne({ action: 'INQUIRY_FEEDBACK_SENT', resourceId: inquiry.id });
      expect(audit).not.toBeNull();
    });
  });

  describe('Phase 5: Staff Registration & Tokenized Onboarding Flow', () => {
    it('creates staff user with activation token and activates account via public endpoint', async () => {
      // 1. Admin creates a new staff user
      const createRes = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Patrick Habimana',
          email: 'patrick.h@ubumwesacco.rw',
          role: 'ADMIN_HR',
          department: 'Human Resources',
          phone: '+250788777888',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.user.email).toBe('patrick.h@ubumwesacco.rw');
      expect(createRes.body.data.user.isActivated).toBe(false);

      // 2. Inspect database for activation token hash
      const newUser = await User.findOne({ email: 'patrick.h@ubumwesacco.rw' }).select('+activationTokenHash');
      expect(newUser).not.toBeNull();
      expect(newUser.isActivated).toBe(false);
      expect(newUser.activationTokenHash).toBeDefined();
      expect(newUser.activationExpiresAt).toBeDefined();

      // 3. Resend onboarding endpoint can be invoked
      const resendRes = await request(app)
        .post(`/api/users/${newUser._id}/resend-onboarding`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resendRes.status).toBe(200);
      expect(resendRes.body.success).toBe(true);

      // 4. Retrieve newly generated token hash and activate account
      // Simulate user clicking email link with valid activation token
      const crypto = require('crypto');
      const testToken = crypto.randomBytes(32).toString('hex');
      const testTokenHash = crypto.createHash('sha256').update(testToken).digest('hex');

      await User.findByIdAndUpdate(newUser._id, {
        activationTokenHash: testTokenHash,
        activationExpiresAt: new Date(Date.now() + 3600000),
      });

      const activateRes = await request(app)
        .post('/api/auth/activate')
        .send({
          email: 'patrick.h@ubumwesacco.rw',
          token: testToken,
          newPassword: 'MySecureStaffPassword2026!',
        });

      expect(activateRes.status).toBe(200);
      expect(activateRes.body.success).toBe(true);
      expect(activateRes.body.accessToken).toBeDefined();
      expect(activateRes.body.data.user.isActivated).toBe(true);

      // 5. Verify user can now sign in with their established password
      const signinRes = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'patrick.h@ubumwesacco.rw',
          password: 'MySecureStaffPassword2026!',
        });

      expect(signinRes.status).toBe(200);
      expect(signinRes.body.success).toBe(true);
      expect(signinRes.body.data.user.role).toBe('ADMIN_HR');
    });

    it('rejects activation with invalid or expired token', async () => {
      const res = await request(app)
        .post('/api/auth/activate')
        .send({
          email: 'nonexistent@example.com',
          token: 'invalid-token-string',
          newPassword: 'ValidPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Phase 6: IP Address Resolution & Audit Logging', () => {
    it('captures client IP address in audit log during authentication', async () => {
      await request(app)
        .post('/api/auth/signin')
        .set('X-Forwarded-For', '197.243.12.34')
        .send({
          email: 'admin.it@ubumwesacco.rw',
          password: 'StrongAdminPassword123!',
        });

      const auditLog = await AuditLog.findOne({
        action: 'AUTH_LOGIN_SUCCESS',
        resourceId: adminUser.id,
      });

      expect(auditLog).not.toBeNull();
      expect(auditLog.ipAddress).toBeDefined();
      expect(typeof auditLog.ipAddress).toBe('string');
      expect(auditLog.ipAddress.length).toBeGreaterThan(0);
    });
  });
});
