
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { normalizeEmail } = require('../utils/email');
const { toPublicUser } = require('../utils/userSerializer');

const ROLES = require('../config/roles').ALL_ROLES;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Valid email is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'technician',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 30,
    },
    department: {
      type: String,
      trim: true,
      default: '',
      maxlength: 120,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangeRequired: {
      type: Boolean,
      default: false,
    },
    rawPassword: {
      type: String,
      default: '',
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    isActivated: {
      type: Boolean,
      default: true,
    },
    activationTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    activationExpiresAt: {
      type: Date,
      default: null,
    },
    onboardingEmailStatus: {
      status: {
        type: String,
        enum: ['PENDING', 'SENT', 'FAILED', 'NOT_REQUIRED'],
        default: 'NOT_REQUIRED',
      },
      sentAt: {
        type: Date,
        default: null,
      },
      failedAt: {
        type: Date,
        default: null,
      },
      attempts: {
        type: Number,
        default: 0,
      },
      lastError: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('validate', async function normalizeUserEmail() {
  if (this.email) {
    this.email = normalizeEmail(this.email);
  }
});

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
  this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (typeof candidate !== 'string' || !this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtIat) {
  if (!this.passwordChangedAt || !jwtIat) {
    return false;
  }
  const changedAtSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return changedAtSeconds > jwtIat;
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return toPublicUser(this);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.passwordChangedAt;
    return ret;
  },
});

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
