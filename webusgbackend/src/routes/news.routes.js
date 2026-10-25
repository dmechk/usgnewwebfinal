'use strict';

const express = require('express');
const {
  listNews,
  getNewsArticle,
  createNewsArticle,
  updateNewsArticle,
  publishNewsArticle,
  deleteNewsArticle,
} = require('../controllers/news.controller');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Public / read access
router.get('/', listNews);
router.get('/:id', getNewsArticle);

// Protected routes (ADMIN, ADMIN_IT)
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.NEWS_CREATE),
  createNewsArticle
);

router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.NEWS_UPDATE),
  updateNewsArticle
);

router.post(
  '/:id/publish',
  authenticate,
  requirePermission(PERMISSIONS.NEWS_PUBLISH),
  publishNewsArticle
);

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.NEWS_DELETE),
  deleteNewsArticle
);

module.exports = router;
