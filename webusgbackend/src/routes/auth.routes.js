const express = require('express');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authSigninLimiter } = require('../middleware/rateLimiter');
const { signin, register, me, changePassword, getRolesAndPermissions } = require('../controllers/auth.controller');
const {
  signinValidation,
  registerValidation,
  changePasswordValidation,
} = require('../validation/auth.validation');

const router = express.Router();

router.get('/roles', getRolesAndPermissions);
router.post('/signin', authSigninLimiter, signinValidation, validate, signin);
router.post('/login', authSigninLimiter, signinValidation, validate, signin);

router.get('/me', authenticate, me);
router.post('/change-password', authenticate, changePasswordValidation, validate, changePassword);

router.get('/admin', authenticate, requireRole('admin', 'ADMIN_IT'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    data: { id: req.user.id, role: req.user.role },
  });
});

router.post(
  '/register',
  authenticate,
  requireRole('admin', 'ADMIN_IT'),
  registerValidation,
  validate,
  register
);

module.exports = router;

