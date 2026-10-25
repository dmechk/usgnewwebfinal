'use strict';

const express = require('express');
const {
  getOverviewReport,
  getGalleryNewsReport,
  getRecruitmentReport,
  getCareersReport,
} = require('../controllers/report.controller');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

router.use(authenticate);

// Executive Overview: MD, ADMIN_IT
router.get(
  '/overview',
  requirePermission(PERMISSIONS.REPORTS_OVERVIEW),
  getOverviewReport
);

// Gallery & News Analytics: ADMIN, MD, ADMIN_IT
router.get(
  '/gallery-news',
  requirePermission(PERMISSIONS.REPORTS_GALLERY_NEWS),
  getGalleryNewsReport
);

// Recruitment Analytics: ADMIN_HR, MD, ADMIN_IT
router.get(
  '/recruitment',
  requirePermission(PERMISSIONS.REPORTS_RECRUITMENT),
  getRecruitmentReport
);

// Careers Analytics: DAF, MD, ADMIN_IT
router.get(
  '/careers',
  requirePermission(PERMISSIONS.REPORTS_CAREERS),
  getCareersReport
);

module.exports = router;
