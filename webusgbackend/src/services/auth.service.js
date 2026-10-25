const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { normalizeEmail } = require('../utils/email');
const { signAccessToken } = require('../utils/jwt');
const { toPublicUser } = require('../utils/userSerializer');
const env = require('../config/env');

const GENERIC_AUTH_FAILURE = 'Invalid email or password';

function assertCredentialShape(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError(GENERIC_AUTH_FAILURE, StatusCodes.UNAUTHORIZED, {
      code: 'INVALID_CREDENTIALS',
    });
  }
}

async function signin({ email, password }) {
  assertCredentialShape(email, password);

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+password name email role isActive passwordChangeRequired lastLoginAt passwordChangedAt createdAt updatedAt'
  );

  if (!user) {
    throw new AppError(GENERIC_AUTH_FAILURE, StatusCodes.UNAUTHORIZED, {
      code: 'INVALID_CREDENTIALS',
    });
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw new AppError(GENERIC_AUTH_FAILURE, StatusCodes.UNAUTHORIZED, {
      code: 'INVALID_CREDENTIALS',
    });
  }

  if (!user.isActive) {
    throw new AppError('Account is disabled', StatusCodes.FORBIDDEN, {
      code: 'ACCOUNT_DISABLED',
    });
  }

  const lastLoginAt = new Date();
  await User.updateOne({ _id: user._id }, { $set: { lastLoginAt } });
  user.lastLoginAt = lastLoginAt;

  const accessToken = signAccessToken(user);

  return {
    user: toPublicUser(user),
    accessToken,
    tokenType: 'Bearer',
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
  };
}

async function getAuthenticatedUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED, {
      code: 'USER_NOT_FOUND',
    });
  }
  return user;
}

module.exports = {
  signin,
  getAuthenticatedUser,
  GENERIC_AUTH_FAILURE,
};
