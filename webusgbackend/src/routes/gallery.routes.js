'use strict';

const express = require('express');
const {
  listGallery,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  publishGalleryItem,
  deleteGalleryItem,
} = require('../controllers/gallery.controller');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Public / read access
router.get('/', listGallery);
router.get('/:id', getGalleryItem);

// Protected mutation routes (ADMIN, ADMIN_IT)
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.GALLERY_CREATE),
  createGalleryItem
);

router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.GALLERY_UPDATE),
  updateGalleryItem
);

router.post(
  '/:id/publish',
  authenticate,
  requirePermission(PERMISSIONS.GALLERY_PUBLISH),
  publishGalleryItem
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.GALLERY_DELETE),
  deleteGalleryItem
);

module.exports = router;
