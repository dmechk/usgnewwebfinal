const { body, param } = require('express-validator');
const { ROLES } = require('../models/User');

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').isEmail().withMessage('Valid email is required').isLength({ max: 254 }),
  body('password')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters if provided'),
  body('role').optional().isIn(ROLES).withMessage('Invalid role'),
  body('phone').optional().isString().isLength({ max: 30 }).withMessage('Phone cannot exceed 30 characters'),
  body('department').optional().isString().isLength({ max: 120 }).withMessage('Department cannot exceed 120 characters'),
  body('passwordChangeRequired').optional().isBoolean(),
];

const updateUserValidation = [
  param('id').isMongoId().withMessage('Valid user ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 120 }),
  body('email').optional().isEmail().withMessage('Valid email is required').isLength({ max: 254 }),
  body('role').optional().isIn(ROLES).withMessage('Invalid role'),
  body('phone').optional().isString().isLength({ max: 30 }).withMessage('Phone cannot exceed 30 characters'),
  body('department').optional().isString().isLength({ max: 120 }).withMessage('Department cannot exceed 120 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('passwordChangeRequired').optional().isBoolean().withMessage('passwordChangeRequired must be a boolean'),
  body('password')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const userIdParamValidation = [
  param('id').isMongoId().withMessage('Valid user ID is required'),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  userIdParamValidation,
};
