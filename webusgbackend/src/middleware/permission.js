'use strict';

const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');
const { hasPermission, getPermissionsForRole, getDashboardForRole } = require('../config/roles');

/**
 * Middleware generator that enforces that the authenticated user possesses a given permission.
 * Assumes authenticate middleware has already run and attached req.user.
 *
 * @param {string} permission - The permission required (e.g., 'users:manage')
 * @returns {import('express').RequestHandler}
 */
function requirePermission(permission) {
  return function (req, res, next) {
    if (!req.user) {
      return next(
        new AppError('Authentication required', StatusCodes.UNAUTHORIZED, {
          code: 'AUTH_REQUIRED',
        })
      );
    }

    const userRole = req.user.role;
    if (!hasPermission(userRole, permission)) {
      return next(
        new AppError('Forbidden: Insufficient permissions for this action', StatusCodes.FORBIDDEN, {
          code: 'FORBIDDEN',
          requiredPermission: permission,
          userRole,
        })
      );
    }

    return next();
  };
}

/**
 * Middleware generator that allows access if user has AT LEAST ONE of the specified permissions.
 *
 * @param {string[]} permissions - Array of permission strings
 * @returns {import('express').RequestHandler}
 */
function requireAnyPermission(permissions = []) {
  return function (req, res, next) {
    if (!req.user) {
      return next(
        new AppError('Authentication required', StatusCodes.UNAUTHORIZED, {
          code: 'AUTH_REQUIRED',
        })
      );
    }

    const userRole = req.user.role;
    const hasAny = permissions.some((perm) => hasPermission(userRole, perm));
    if (!hasAny) {
      return next(
        new AppError('Forbidden: Insufficient permissions for this action', StatusCodes.FORBIDDEN, {
          code: 'FORBIDDEN',
          requiredPermissions: permissions,
          userRole,
        })
      );
    }

    return next();
  };
}

/**
 * Middleware generator restricting access directly by role names.
 *
 * @param  {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function requireRole(...allowedRoles) {
  const rolesSet = new Set(allowedRoles.flat());
  return function (req, res, next) {
    if (!req.user) {
      return next(
        new AppError('Authentication required', StatusCodes.UNAUTHORIZED, {
          code: 'AUTH_REQUIRED',
        })
      );
    }

    if (!rolesSet.has(req.user.role)) {
      return next(
        new AppError('Forbidden: Role not authorized for this resource', StatusCodes.FORBIDDEN, {
          code: 'FORBIDDEN',
          allowedRoles: Array.from(rolesSet),
          userRole: req.user.role,
        })
      );
    }

    return next();
  };
}

/**
 * Exposes permissions and dashboard route on req.user for downstream handlers and responses.
 */
function attachUserRoleMeta(req, res, next) {
  if (req.user && req.user.role) {
    req.user.permissions = getPermissionsForRole(req.user.role);
    req.user.dashboardUrl = getDashboardForRole(req.user.role);
  }
  return next();
}

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireRole,
  attachUserRoleMeta,
};
