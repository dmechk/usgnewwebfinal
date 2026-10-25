const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('./appError');
const { StatusCodes } = require('http-status-codes');

function signAccessToken(user) {
  const payload = {
    sub: String(user._id || user.id),
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: env.JWT_ALGORITHM,
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: [env.JWT_ALGORITHM],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED, {
        code: 'TOKEN_EXPIRED',
      });
    }
    throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED, {
      code: 'TOKEN_INVALID',
    });
  }
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
