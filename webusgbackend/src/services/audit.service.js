'use strict';

const AuditLog = require('../models/AuditLog');
const { extractClientIp } = require('../utils/ip');

/**
 * Records an audit log entry.
 * Designed to be resilient so that logging failures do not break the main operation.
 *
 * @param {Object} options
 * @param {Object} [options.actor] - req.user or user document
 * @param {string} options.action - e.g. 'USER_CREATED', 'ROLE_ASSIGNED', 'LOGIN_SUCCESS'
 * @param {string} options.resourceType - e.g. 'User', 'Exam', 'Gallery', 'News'
 * @param {string|null} [options.resourceId] - ID of modified entity
 * @param {Object} [options.details] - Arbitrary additional metadata
 * @param {string} [options.outcome='SUCCESS'] - 'SUCCESS' or 'FAILURE'
 * @param {import('express').Request} [options.req] - Express request for ip and user agent
 */
async function logAudit({
  actor = null,
  action,
  resourceType,
  resourceId = null,
  details = {},
  outcome = 'SUCCESS',
  req = null,
}) {
  try {
    let actorId = null;
    let actorEmail = null;
    let actorRole = null;

    if (actor) {
      actorId = actor.id || actor._id || null;
      actorEmail = actor.email || null;
      actorRole = actor.role || null;
    }

    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = extractClientIp(req);
      userAgent = (req.headers && req.headers['user-agent']) || null;
      if (!actor && req.user) {
        actorId = req.user.id || req.user._id || null;
        actorEmail = req.user.email || null;
        actorRole = req.user.role || null;
      }
    }

    const entry = await AuditLog.create({
      actorId,
      actorEmail,
      actorRole,
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : null,
      details,
      outcome,
      ipAddress: ipAddress ? String(ipAddress) : null,
      userAgent: userAgent ? String(userAgent) : null,
    });

    return entry;
  } catch (err) {
    // Audit failures should not crash user operations in production, but log error to console
    if (process.env.NODE_ENV !== 'test') {
      console.error('Audit logging failed:', err.message);
    }
    return null;
  }
}

/**
 * Query audit logs with pagination and filters
 */
async function listAuditLogs({
  page = 1,
  limit = 20,
  action,
  actorRole,
  resourceType,
  resourceId,
  outcome,
} = {}) {
  const filter = {};

  if (action) filter.action = action;
  if (actorRole) filter.actorRole = actorRole;
  if (resourceType) filter.resourceType = resourceType;
  if (resourceId) filter.resourceId = String(resourceId);
  if (outcome) filter.outcome = outcome;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
}

module.exports = {
  logAudit,
  listAuditLogs,
};
