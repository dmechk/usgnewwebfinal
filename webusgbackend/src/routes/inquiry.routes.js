'use strict';

const express = require('express');
const {
  listInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  sendFeedback,
} = require('../controllers/inquiry.controller');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Public / Internal: submit new inquiry
router.post('/', (req, res, next) => {
  // Try optional authentication so req.user is populated if token is present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, () => createInquiry(req, res, next));
  }
  return createInquiry(req, res, next);
});

// Protected: List all inquiries with filters & search
router.get(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_READ),
  listInquiries
);

// Protected: Get single inquiry
router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_READ),
  getInquiry
);

// Protected: Update inquiry details, status, priority, or notes
router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_UPDATE),
  updateInquiry
);

// Protected: Delete an inquiry
router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_DELETE),
  deleteInquiry
);

// Protected: Official feedback reply from authorized staff with role check
router.post(
  '/:id/feedback',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_FEEDBACK),
  sendFeedback
);

module.exports = router;
