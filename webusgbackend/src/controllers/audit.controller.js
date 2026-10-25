'use strict';

const { StatusCodes } = require('http-status-codes');
const { listAuditLogs } = require('../services/audit.service');

async function getAuditLogs(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      actorRole,
      resourceType,
      resourceId,
      outcome,
    } = req.query;

    const data = await listAuditLogs({
      page,
      limit,
      action,
      actorRole,
      resourceType,
      resourceId,
      outcome,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getAuditLogs,
};
