const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { normalizeEmail } = require('../utils/email');
const { toPublicUser } = require('../utils/userSerializer');
const authService = require('../services/auth.service');
const { getPermissionsForRole, getDashboardForRole, ROLE_LIST, ROLE_PERMISSIONS } = require('../config/roles');
const { logAudit } = require('../services/audit.service');

async function signin(req, res, next) {
  try {
    const data = await authService.signin({
      email: req.body.email,
      password: req.body.password,
    });

    const userWithRbac = {
      ...data.user,
      permissions: getPermissionsForRole(data.user.role),
      dashboardUrl: getDashboardForRole(data.user.role),
    };

    await logAudit({
      actor: data.user,
      action: 'AUTH_LOGIN_SUCCESS',
      resourceType: 'User',
      resourceId: data.user.id,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Sign-in successful',
      data: {
        ...data,
        user: userWithRbac,
      },
    });
  } catch (err) {
    await logAudit({
      action: 'AUTH_LOGIN_FAILURE',
      resourceType: 'User',
      details: { email: req.body ? req.body.email : undefined, reason: err.message },
      outcome: 'FAILURE',
      req,
    });
    return next(err);
  }
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = normalizeEmail(email);

    try {
      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: role || 'technician',
        isActive: true,
        passwordChangeRequired: false,
      });

      await logAudit({
        actor: req.user,
        action: 'USER_REGISTERED',
        resourceType: 'User',
        resourceId: user.id,
        details: { email: user.email, role: user.role },
        req,
      });

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'User created',
        data: { user: toPublicUser(user) },
      });
    } catch (err) {
      if (err && err.code === 11000) {
        throw new AppError('Email already registered', StatusCodes.CONFLICT, {
          code: 'EMAIL_EXISTS',
        });
      }
      throw err;
    }
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = req.authUser || (await User.findById(req.user.id));
    if (!user) {
      throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED, {
        code: 'USER_NOT_FOUND',
      });
    }

    const publicUser = toPublicUser(user);
    const userWithRbac = {
      ...publicUser,
      permissions: getPermissionsForRole(publicUser.role),
      dashboardUrl: getDashboardForRole(publicUser.role),
    };

    return res.status(StatusCodes.OK).json({
      success: true,
      data: { user: userWithRbac },
    });
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, {
        code: 'USER_NOT_FOUND',
      });
    }

    const matches = await user.comparePassword(currentPassword);
    if (!matches) {
      throw new AppError('Current password is incorrect', StatusCodes.BAD_REQUEST, {
        code: 'INVALID_PASSWORD',
      });
    }

    user.password = newPassword;
    user.passwordChangeRequired = false;
    await user.save();

    await logAudit({
      actor: user,
      action: 'PASSWORD_CHANGED',
      resourceType: 'User',
      resourceId: user.id,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password changed successfully',
      data: { user: toPublicUser(user) },
    });
  } catch (err) {
    return next(err);
  }
}

async function getRolesAndPermissions(req, res) {
  return res.status(StatusCodes.OK).json({
    success: true,
    data: {
      roles: ROLE_LIST,
      matrix: ROLE_PERMISSIONS,
    },
  });
}

module.exports = {
  signin,
  login: signin,
  register,
  me,
  changePassword,
  getRolesAndPermissions,
};


