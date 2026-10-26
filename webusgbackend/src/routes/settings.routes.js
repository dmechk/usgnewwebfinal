'use strict';

const express = require('express');
const authenticate = require('../middleware/auth');
const { getSettings, updateSettings, updateSettingsSection } = require('../controllers/settings.controller');

const router = express.Router();

// GET /api/settings — public (no auth)
router.get('/', getSettings);

// PATCH /api/settings — partial update (auth required)
router.patch('/', authenticate, updateSettings);

// PATCH /api/settings/:section — single-section update (auth required)
router.patch('/:section', authenticate, updateSettingsSection);

module.exports = router;
