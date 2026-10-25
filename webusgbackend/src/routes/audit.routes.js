'use strict';

const express = require('express');
const { getAuditLogs } = require('../controllers/audit.controller');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

router.get('/', requirePermission(PERMISSIONS.AUDIT_READ), getAuditLogs);

module.exports = router;
