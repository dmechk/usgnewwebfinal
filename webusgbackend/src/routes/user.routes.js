const express = require('express');
const {
  listUsers,
  getUser,
  getUserPassword,
  createUser,
  updateUser,
  assignRole,
  updateStatus,
  deleteUser,
  resetPassword,
  getRolesAndPermissions,
  resendOnboardingEmail,
} = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const { requirePermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../config/roles');
const {
  createUserValidation,
  updateUserValidation,
  userIdParamValidation,
} = require('../validation/user.validation');

const router = express.Router();

router.get(
  '/roles-permissions',
  getRolesAndPermissions
);

router.get(
  '/',
  requirePermission(PERMISSIONS.USERS_READ),
  listUsers
);

router.get(
  '/:id/password',
  userIdParamValidation,
  validate,
  requirePermission(PERMISSIONS.USERS_READ),
  getUserPassword
);

router.get(
  '/:id',
  userIdParamValidation,
  validate,
  requirePermission(PERMISSIONS.USERS_READ),
  getUser
);

router.post(
  '/',
  createUserValidation,
  validate,
  requirePermission(PERMISSIONS.USERS_CREATE),
  createUser
);

router.put(
  '/:id',
  updateUserValidation,
  validate,
  requirePermission(PERMISSIONS.USERS_UPDATE),
  updateUser
);

router.put(
  '/:id/role',
  userIdParamValidation,
  validate,
  requirePermission(PERMISSIONS.ROLES_ASSIGN),
  assignRole
);

router.put(
  '/:id/status',
  userIdParamValidation,
  validate,
  requirePermission(PERMISSIONS.USERS_STATUS),
  updateStatus
);

router.post(
  '/:id/reset-password',
  userIdParamValidation,
  validate,
  requirePermission(PERMISSIONS.USERS_UPDATE),
  resetPassword
);

router.post(
  '/:id/resend-onboarding',
  userIdParamValidation,
  validate,
  requirePermission(PERMISSIONS.USERS_UPDATE),
  resendOnboardingEmail
);

router.delete(
  '/:id',
  userIdParamValidation,
  validate,
  requirePermission(PERMISSIONS.USERS_DELETE),
  deleteUser
);

module.exports = router;
