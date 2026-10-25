const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { verifyAccessToken } = require('../utils/jwt');
const { toPublicUser } = require('../utils/userSerializer');

function extractBearerToken(header) {
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice(7).trim();
  return token || null;
}

/**
 * Verifies the Bearer JWT, then reloads the user from the database.
 * A valid token is not sufficient if the account is disabled, deleted,
 * or the password changed after the token was issued.
 */
async function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED, {
        code: 'AUTH_REQUIRED',
      });
    }

    const payload = verifyAccessToken(token);
    const userId = payload.sub;
    if (!userId) {
      throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED, {
        code: 'TOKEN_INVALID',
      });
    }

    const user = await User.findById(userId).select(
      'name email role isActive passwordChangeRequired lastLoginAt passwordChangedAt createdAt updatedAt'
    );

    if (!user) {
      throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED, {
        code: 'USER_NOT_FOUND',
      });
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', StatusCodes.FORBIDDEN, {
        code: 'ACCOUNT_DISABLED',
      });
    }

    if (user.changedPasswordAfter(payload.iat)) {
      throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED, {
        code: 'TOKEN_REVOKED',
      });
    }

    req.user = {
      id: String(user._id),
      role: user.role,
      passwordChangeRequired: user.passwordChangeRequired,
      isActive: user.isActive,
    };
    req.authUser = user;
    req.tokenPayload = payload;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(...allowedRoles) {
  const roles = allowedRoles.flat();

  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(
        new AppError('Authentication required', StatusCodes.UNAUTHORIZED, {
          code: 'AUTH_REQUIRED',
        })
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Insufficient permissions', StatusCodes.FORBIDDEN, {
          code: 'FORBIDDEN',
        })
      );
    }

    return next();
  };
}

/**
 * Blocks normal API access until the user changes their password.
 * Allow-list identity endpoints such as GET /auth/me.
 */
function requirePasswordChanged(req, res, next) {
  if (req.user && req.user.passwordChangeRequired) {
    return next(
      new AppError('Password change required before continuing', StatusCodes.FORBIDDEN, {
        code: 'PASSWORD_CHANGE_REQUIRED',
      })
    );
  }
  return next();
}

function currentUser(req, res) {
  const source = req.authUser || req.user;
  return res.status(StatusCodes.OK).json({
    success: true,
    data: {
      user: toPublicUser(source),
    },
  });
}

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.requireRole = requireRole;
module.exports.requirePasswordChanged = requirePasswordChanged;
module.exports.currentUser = currentUser;
module.exports.extractBearerToken = extractBearerToken;
