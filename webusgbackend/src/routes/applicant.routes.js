'use strict';

const express = require('express');
const {
  listApplicants,
  getApplicant,
  createApplicant,
  updateApplicant,
  deleteApplicant,
  updateStatus,
  addFeedback,
  listMessages,
  addMessage,
} = require('../controllers/applicant.controller');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Public: Candidate submits job application
router.post('/', createApplicant);

// Protected routes (ADMIN_HR, MD, ADMIN_IT)
router.get(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.APPLICANTS_READ),
  listApplicants
);

router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.APPLICANTS_READ),
  getApplicant
);

router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.APPLICANTS_STATUS_UPDATE),
  updateApplicant
);

router.put(
  '/:id/status',
  authenticate,
  requirePermission(PERMISSIONS.APPLICANTS_STATUS_UPDATE),
  updateStatus
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.APPLICANTS_STATUS_UPDATE),
  deleteApplicant
);

router.post(
  '/:id/feedback',
  authenticate,
  requirePermission(PERMISSIONS.APPLICANTS_FEEDBACK_CREATE),
  addFeedback
);

router.get(
  '/:id/messages',
  authenticate,
  requirePermission(PERMISSIONS.APPLICANTS_MESSAGES_READ),
  listMessages
);

router.post(
  '/:id/messages',
  authenticate,
  requirePermission(PERMISSIONS.APPLICANTS_MESSAGES_CREATE),
  addMessage
);

module.exports = router;
