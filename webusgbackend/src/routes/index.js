const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePasswordChanged, requireRole } = require('../middleware/auth');
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const examRoutes = require('./exam.routes');
const userRoutes = require('./user.routes');
const galleryRoutes = require('./gallery.routes');
const newsRoutes = require('./news.routes');
const careerRoutes = require('./career.routes');
const applicantRoutes = require('./applicant.routes');
const reportRoutes = require('./report.routes');
const auditRoutes = require('./audit.routes');
const uploadRoutes = require('./upload.routes');
const inquiryRoutes = require('./inquiry.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'webusgbackend',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/uploads', uploadRoutes);
router.use('/users', authenticate, requirePasswordChanged, requireRole('admin', 'ADMIN_IT'), userRoutes);
router.use('/patients', authenticate, requirePasswordChanged, patientRoutes);
router.use('/exams', authenticate, requirePasswordChanged, examRoutes);

// RBAC Website Modules
router.use('/gallery', galleryRoutes);
router.use('/news', newsRoutes);
router.use('/careers', careerRoutes);
router.use('/applicants', applicantRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', authenticate, requirePasswordChanged, auditRoutes);
router.use('/audit', authenticate, requirePasswordChanged, auditRoutes);

module.exports = router;

