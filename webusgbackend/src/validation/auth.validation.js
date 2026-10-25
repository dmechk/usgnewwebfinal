const { body } = require('express-validator');
const { ROLES } = require('../models/User');

const signinValidation = [
  body('email')
    .exists({ values: 'falsy' })
    .withMessage('Email is required')
    .isString()
    .withMessage('Email must be a string')
    .isEmail()
    .withMessage('Valid email is required')
    .isLength({ max: 254 }),
  body('password')
    .exists({ values: 'falsy' })
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password is required'),
];

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').isEmail().withMessage('Valid email is required').isLength({ max: 254 }),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(ROLES).withMessage('Invalid role'),
];

const changePasswordValidation = [
  body('currentPassword')
    .isString()
    .withMessage('Current password is required')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isString()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

module.exports = {
  signinValidation,
  registerValidation,
  changePasswordValidation,
};

