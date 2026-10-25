const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { normalizeEmail } = require('../utils/email');

async function seedAdmin({ name, email, password, role = 'admin' }) {
  if (!name || !email || !password) {
    throw new AppError(
      'ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required to seed the administrator',
      StatusCodes.BAD_REQUEST,
      { code: 'ADMIN_SEED_CONFIG' }
    );
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError('ADMIN_PASSWORD must be at least 8 characters', StatusCodes.BAD_REQUEST, {
      code: 'ADMIN_SEED_PASSWORD',
    });
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    if (existing.role !== 'admin' && existing.role !== 'ADMIN_IT') {
      throw new AppError(
        'A user with this email already exists and is not an administrator',
        StatusCodes.CONFLICT,
        { code: 'ADMIN_SEED_NOT_PROMOTED' }
      );
    }
    return { created: false, user: existing };
  }

  try {
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      role: role || 'admin',
      isActive: true,
      passwordChangeRequired: false,
    });
    return { created: true, user };
  } catch (err) {
    if (err && err.code === 11000) {
      const raced = await User.findOne({ email: normalizedEmail });
      if (raced && (raced.role === 'admin' || raced.role === 'ADMIN_IT')) {
        return { created: false, user: raced };
      }
      throw new AppError(
        'A user with this email already exists and is not an administrator',
        StatusCodes.CONFLICT,
        { code: 'ADMIN_SEED_NOT_PROMOTED' }
      );
    }
    throw err;
  }
}

module.exports = { seedAdmin };
