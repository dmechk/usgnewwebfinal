'use strict';

const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS, hasPermission } = require('../config/roles');
const { getSettings, updateSettings, updateSettingsSection } = require('../controllers/settings.controller');
const AppError = require('../utils/appError');
const { StatusCodes } = require('http-status-codes');

const router = express.Router();

// Role-to-Section permissions mapping for departmental authority
const SECTION_PERMISSIONS = {
  // Administrative & System Settings
  saccoInfo: [PERMISSIONS.SETTINGS_MANAGE],
  navItems: [PERMISSIONS.SETTINGS_MANAGE],
  systemImages: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.GALLERY_UPDATE],

  // Gallery, Media & Public Content (ADMIN / Communications)
  moments: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.GALLERY_UPDATE],
  announcements: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.NEWS_UPDATE],
  communityStories: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.NEWS_UPDATE, PERMISSIONS.GALLERY_UPDATE],
  homeVideos: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.GALLERY_UPDATE],
  heroContent: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.NEWS_UPDATE, PERMISSIONS.GALLERY_UPDATE],
  aboutContent: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.NEWS_UPDATE],
  partners: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.NEWS_UPDATE],
  socialLinks: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.NEWS_UPDATE],
  branches: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.NEWS_UPDATE],

  // Careers & Recruitment (ADMIN_HR / DAF)
  jobPostings: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.CAREERS_UPDATE, PERMISSIONS.APPLICANTS_REVIEW],
  jobApplications: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.APPLICANTS_REVIEW],
  employmentTypes: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.CAREERS_UPDATE, PERMISSIONS.APPLICANTS_REVIEW],
  qualifications: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.CAREERS_UPDATE, PERMISSIONS.APPLICANTS_REVIEW],

  // Financial Products & Metrics (DAF)
  products: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.CAREERS_UPDATE],
  homeMetrics: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.CAREERS_UPDATE],
  applications: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.CAREERS_UPDATE],

  // Leadership & Executive Messages (MD)
  leaders: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.REPORTS_OVERVIEW],
  managerMessages: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.REPORTS_OVERVIEW],
  contactInquiries: [PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.INQUIRIES_UPDATE],
};

function requireSectionPermission(req, res, next) {
  if (!req.user) {
    return next(new AppError('Authentication required', StatusCodes.UNAUTHORIZED, { code: 'AUTH_REQUIRED' }));
  }

  const role = req.user.role;
  const section = req.params.section;
  const allowedPerms = SECTION_PERMISSIONS[section] || [PERMISSIONS.SETTINGS_MANAGE];

  const isAuthorized = allowedPerms.some((perm) => hasPermission(role, perm));
  if (!isAuthorized) {
    return next(
      new AppError(`Forbidden: Your role (${role}) is not authorized to modify the "${section}" section.`, StatusCodes.FORBIDDEN, {
        code: 'FORBIDDEN',
        userRole: role,
        section,
      })
    );
  }

  return next();
}

// GET /api/settings — public (no auth required so the public site can load its config)
router.get('/', getSettings);

// PATCH /api/settings — global full update (ADMIN_IT only)
router.patch(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  updateSettings
);

// PATCH /api/settings/:section — single-section update (Department-authorized RBAC)
router.patch(
  '/:section',
  authenticate,
  requireSectionPermission,
  updateSettingsSection
);

module.exports = router;
