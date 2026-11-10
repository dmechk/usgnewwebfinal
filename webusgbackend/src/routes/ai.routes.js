'use strict';

const express = require('express');
const {
  chat,
  getPublicConfig,
  submitChatInquiry,
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  listFaqs,
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  listSessions,
  getSession,
  updateConfig,
} = require('../controllers/ai.controller');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');
const { aiChatLimiter, inquirySubmitLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ---------------------------------------------------------------------------
// PUBLIC ENDPOINTS
// ---------------------------------------------------------------------------

// POST /api/ai/chat — Send message to AI assistant
router.post('/chat', aiChatLimiter, chat);

// GET /api/ai/config — Public configuration (welcome message, name, enabled status)
router.get('/config', getPublicConfig);

// POST /api/ai/inquiry — Submit member inquiry directly from chat
router.post('/inquiry', inquirySubmitLimiter, submitChatInquiry);

// ---------------------------------------------------------------------------
// PROTECTED ADMIN ENDPOINTS (AI Knowledge, FAQs, Config & Session Audit)
// ---------------------------------------------------------------------------

// Knowledge Articles Management
router.get(
  '/knowledge',
  authenticate,
  requirePermission(PERMISSIONS.AI_READ),
  listArticles
);

router.get(
  '/knowledge/:id',
  authenticate,
  requirePermission(PERMISSIONS.AI_READ),
  getArticle
);

router.post(
  '/knowledge',
  authenticate,
  requirePermission(PERMISSIONS.AI_MANAGE),
  createArticle
);

router.put(
  '/knowledge/:id',
  authenticate,
  requirePermission(PERMISSIONS.AI_MANAGE),
  updateArticle
);

router.delete(
  '/knowledge/:id',
  authenticate,
  requirePermission(PERMISSIONS.AI_MANAGE),
  deleteArticle
);

// FAQ Management
router.get(
  '/faqs',
  authenticate,
  requirePermission(PERMISSIONS.AI_READ),
  listFaqs
);

router.get(
  '/faqs/:id',
  authenticate,
  requirePermission(PERMISSIONS.AI_READ),
  getFaq
);

router.post(
  '/faqs',
  authenticate,
  requirePermission(PERMISSIONS.AI_MANAGE),
  createFaq
);

router.put(
  '/faqs/:id',
  authenticate,
  requirePermission(PERMISSIONS.AI_MANAGE),
  updateFaq
);

router.delete(
  '/faqs/:id',
  authenticate,
  requirePermission(PERMISSIONS.AI_MANAGE),
  deleteFaq
);

// Conversation Sessions & Audit Logs
router.get(
  '/sessions',
  authenticate,
  requirePermission(PERMISSIONS.AI_READ),
  listSessions
);

router.get(
  '/sessions/:sessionId',
  authenticate,
  requirePermission(PERMISSIONS.AI_READ),
  getSession
);

// Administrative Configuration
router.put(
  '/config',
  authenticate,
  requirePermission(PERMISSIONS.AI_MANAGE),
  updateConfig
);

module.exports = router;
