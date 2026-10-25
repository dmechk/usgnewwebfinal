const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { normalizeEmail } = require('../utils/email');
const { toPublicUser } = require('../utils/userSerializer');
const { logAudit } = require('../services/audit.service');

async function listUsers(req, res, next) {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role && User.ROLES.includes(role)) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        users: users.map(toPublicUser),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, {
        code: 'USER_NOT_FOUND',
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: { user: toPublicUser(user) },
    });
  } catch (err) {
    return next(err);
  }
}

const { ROLES, ROLE_LIST, ROLE_PERMISSIONS, PERMISSIONS, ROLE_DASHBOARDS } = require('../config/roles');

async function createUser(req, res, next) {
  try {
    const { name, email, password, role, phone = '', department = '', passwordChangeRequired = true } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Auto-generate secure temporary password if not provided
    const tempPassword = (typeof password === 'string' && password.trim().length >= 8)
      ? password.trim()
      : `Ubumwe@${Math.floor(100000 + Math.random() * 900000)}!`;

    try {
      const user = await User.create({
        name,
        email: normalizedEmail,
        password: tempPassword,
        role: role || 'ADMIN',
        phone: typeof phone === 'string' ? phone.trim() : '',
        department: typeof department === 'string' ? department.trim() : '',
        isActive: true,
        passwordChangeRequired: Boolean(passwordChangeRequired),
      });

      await logAudit({
        actor: req.user,
        action: 'USER_CREATED',
        resourceType: 'User',
        resourceId: user.id,
        details: { email: user.email, role: user.role, department: user.department },
        req,
      });

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Staff user created successfully. Temporary credentials generated.',
        temporaryPassword: tempPassword,
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

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, password, passwordChangeRequired, phone, department } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, {
        code: 'USER_NOT_FOUND',
      });
    }

    // Protect against self-deactivation or self-demotion for admin/ADMIN_IT
    const isSelf = String(req.user.id) === String(user._id);
    if (isSelf && isActive === false) {
      throw new AppError('Admin cannot deactivate their own account', StatusCodes.BAD_REQUEST, {
        code: 'SELF_DEACTIVATION_DENIED',
      });
    }
    if (isSelf && role && role !== user.role && (user.role === 'admin' || user.role === 'ADMIN_IT')) {
      throw new AppError('Admin cannot demote their own role', StatusCodes.BAD_REQUEST, {
        code: 'SELF_DEMOTION_DENIED',
      });
    }

    const previousRole = user.role;
    if (name) user.name = name;
    if (email) user.email = normalizeEmail(email);
    if (role && User.ROLES.includes(role)) user.role = role;
    if (phone !== undefined) user.phone = typeof phone === 'string' ? phone.trim() : '';
    if (department !== undefined) user.department = typeof department === 'string' ? department.trim() : '';
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (passwordChangeRequired !== undefined) {
      user.passwordChangeRequired = Boolean(passwordChangeRequired);
    }
    if (password && String(password).trim().length >= 8) {
      user.password = password;
    }

    try {
      await user.save();
    } catch (err) {
      if (err && err.code === 11000) {
        throw new AppError('Email already registered to another user', StatusCodes.CONFLICT, {
          code: 'EMAIL_EXISTS',
        });
      }
      throw err;
    }

    await logAudit({
      actor: req.user,
      action: previousRole !== user.role ? 'ROLE_CHANGED' : 'USER_UPDATED',
      resourceType: 'User',
      resourceId: user.id,
      details: { previousRole, newRole: user.role, isActive: user.isActive },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Staff user updated successfully',
      data: { user: toPublicUser(user) },
    });
  } catch (err) {
    return next(err);
  }
}

async function assignRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !User.ROLES.includes(role)) {
      throw new AppError('Invalid role specified', StatusCodes.BAD_REQUEST, {
        code: 'INVALID_ROLE',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, {
        code: 'USER_NOT_FOUND',
      });
    }

    if (String(req.user.id) === String(user._id) && role !== user.role) {
      throw new AppError('Admin cannot change their own role', StatusCodes.BAD_REQUEST, {
        code: 'SELF_DEMOTION_DENIED',
      });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await logAudit({
      actor: req.user,
      action: 'ROLE_ASSIGNED',
      resourceType: 'User',
      resourceId: user.id,
      details: { previousRole, newRole: role },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Role updated from ${previousRole} to ${role}`,
      data: { user: toPublicUser(user) },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive boolean is required', StatusCodes.BAD_REQUEST, {
        code: 'INVALID_STATUS',
      });
    }

    if (String(req.user.id) === String(id) && isActive === false) {
      throw new AppError('Admin cannot deactivate their own account', StatusCodes.BAD_REQUEST, {
        code: 'SELF_DEACTIVATION_DENIED',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, {
        code: 'USER_NOT_FOUND',
      });
    }

    user.isActive = isActive;
    await user.save();

    await logAudit({
      actor: req.user,
      action: isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
      resourceType: 'User',
      resourceId: user.id,
      details: { isActive },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: toPublicUser(user) },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (String(req.user.id) === String(id)) {
      throw new AppError('Admin cannot delete their own account', StatusCodes.BAD_REQUEST, {
        code: 'SELF_DELETION_DENIED',
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, {
        code: 'USER_NOT_FOUND',
      });
    }

    await logAudit({
      actor: req.user,
      action: 'USER_DELETED',
      resourceType: 'User',
      resourceId: id,
      details: { deletedEmail: user.email, deletedRole: user.role },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Staff user deleted successfully',
      data: { id },
    });
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, {
        code: 'USER_NOT_FOUND',
      });
    }

    const tempPassword = (typeof newPassword === 'string' && newPassword.trim().length >= 8)
      ? newPassword.trim()
      : `Ubumwe@${Math.floor(100000 + Math.random() * 900000)}!`;

    user.password = tempPassword;
    user.passwordChangeRequired = true;
    await user.save();

    await logAudit({
      actor: req.user,
      action: 'PASSWORD_RESET',
      resourceType: 'User',
      resourceId: user.id,
      details: { targetEmail: user.email, targetRole: user.role },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Temporary password generated successfully. User must change it on first login.',
      temporaryPassword: tempPassword,
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
      allRoles: ROLES,
      permissions: PERMISSIONS,
      rolePermissions: ROLE_PERMISSIONS,
      roleDashboards: ROLE_DASHBOARDS,
    },
  });
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  assignRole,
  updateStatus,
  deleteUser,
  resetPassword,
  getRolesAndPermissions,
};
