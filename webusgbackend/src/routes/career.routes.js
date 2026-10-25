'use strict';

const express = require('express');
const {
  listCareers,
  getCareer,
  createCareer,
  updateCareer,
  publishCareer,
  deleteCareer,
} = require('../controllers/career.controller');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Public / candidate viewing
router.get('/', listCareers);
router.get('/:id', getCareer);

// Protected routes (DAF, ADMIN_IT)
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.CAREERS_CREATE),
  createCareer
);

router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.CAREERS_UPDATE),
  updateCareer
);

router.post(
  '/:id/publish',
  authenticate,
  requirePermission(PERMISSIONS.CAREERS_PUBLISH),
  publishCareer
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.CAREERS_DELETE),
  deleteCareer
);

module.exports = router;
