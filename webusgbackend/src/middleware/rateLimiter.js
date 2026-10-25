const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');
const env = require('../config/env');

const authSigninLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many sign-in attempts. Please try again later.',
      code: 'RATE_LIMITED',
    });
  },
});

module.exports = { authSigninLimiter };
