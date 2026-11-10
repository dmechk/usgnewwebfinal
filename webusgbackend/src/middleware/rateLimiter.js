'use strict';

const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');
const env = require('../config/env');

// Auth signin rate limiter — strict (10-30 attempts per 15 min)
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

// General API rate limiter — broad protection (200 req / 5 min per IP)
const generalApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate-limiting for authenticated staff (trust JWT-bearing requests)
    return Boolean(req.headers.authorization && req.headers.authorization.startsWith('Bearer '));
  },
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests. Please slow down and try again shortly.',
      code: 'RATE_LIMITED',
    });
  },
});

// Upload rate limiter — anonymous uploads limited (for job applicants)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many file uploads from this address. Please try again later.',
      code: 'RATE_LIMITED',
    });
  },
});

// AI chat rate limiter — protect against abuse of AI endpoint
const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.AI_RATE_LIMIT_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many messages sent. Please wait a moment before continuing.',
      code: 'AI_RATE_LIMITED',
    });
  },
});

// Inquiry submission limiter — public form (5 per 10 min per IP)
const inquirySubmitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many inquiries submitted. Please wait before submitting again.',
      code: 'RATE_LIMITED',
    });
  },
});

module.exports = {
  authSigninLimiter,
  generalApiLimiter,
  uploadLimiter,
  aiChatLimiter,
  inquirySubmitLimiter,
};
