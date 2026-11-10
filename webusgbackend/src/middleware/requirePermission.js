const { AppError } = require('../utils/appError');
const { StatusCodes } = require('http-status-codes');
const { PERMISSIONS } = require('../config/roles');

/**
 * Middleware factory that ensures the authenticated user has the specified permission.
 * Usage: `app.use('/api/v1/some', requirePermission(PERMISSIONS.USERS_READ), router);`
 */
function requirePermission(permission) {
  return function (req, res, next) {
    if (!req.user) {
      return next(new AppError('Authentication required', StatusCodes.UNAUTHORIZED, { code: 'AUTH_REQUIRED' }));
    }
    const perms = req.user.permissions || [];
    if (!perms.includes(permission)) {
      return next(new AppError('Insufficient permissions', StatusCodes.FORBIDDEN, { code: 'FORBIDDEN' }));
    }
    return next();
  };
}

module.exports = requirePermission;

