const { StatusCodes } = require('http-status-codes');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (!env.isTest) {
    const safeMessage = err && err.message ? err.message : 'Unknown error';
    console.error(`Error: ${safeMessage}`);
  }

  if (err && err.code === 11000) {
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: 'A record with that unique value already exists',
    });
  }

  if (err && err.name === 'ValidationError') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors || {}).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    });
  }

  if (err && (err.code === 'CORS_REJECTED' || err.message === 'Not allowed by CORS')) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Not allowed by CORS',
      code: 'CORS_REJECTED',
    });
  }

  if (err && err.name === 'JsonWebTokenError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const isOperational = Boolean(err.isOperational);
  const message =
    isOperational || env.isDevelopment
      ? err.message || 'Internal server error'
      : 'Internal server error';

  const payload = {
    success: false,
    message,
  };

  if (err.code) {
    payload.code = err.code;
  }

  if (env.isDevelopment && !env.isProduction) {
    payload.stack = err.stack;
  }

  return res.status(status).json(payload);
}

module.exports = errorHandler;
