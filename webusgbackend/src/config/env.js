/**
 * Loads and validates environment configuration.
 * Secrets are never logged. Production MongoDB URIs are not printed.
 */
if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config({ quiet: true });
}

const DURATION_PATTERN = /^(\d+)([smhd])$/;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseExpiresInToSeconds(value, fallback = 3600) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  const str = String(value).trim();
  if (/^\d+$/.test(str)) {
    const seconds = Number.parseInt(str, 10);
    return seconds > 0 ? seconds : fallback;
  }

  const match = DURATION_PATTERN.exec(str);
  if (!match) {
    throw new Error(
      'JWT_EXPIRES_IN must be a positive number of seconds or a duration such as 15m, 1h, or 7d'
    );
  }

  const amount = Number.parseInt(match[1], 10);
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multipliers[match[2]];
}

function requireValue(name, value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value);
}

function parseOrigins(value) {
  if (!value || String(value).trim() === '') {
    return [];
  }
  return String(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const isTest = NODE_ENV === 'test';
const isProduction = NODE_ENV === 'production';

let jwtExpiresInSeconds;
try {
  jwtExpiresInSeconds = parseExpiresInToSeconds(process.env.JWT_EXPIRES_IN, 3600);
} catch (err) {
  throw err;
}

const jwtSecret = isTest
  ? process.env.JWT_SECRET || 'test-only-jwt-secret-must-be-32-chars-min'
  : requireValue('JWT_SECRET', process.env.JWT_SECRET);

if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

if (!isTest) {
  requireValue('MONGODB_URI', process.env.MONGODB_URI);
}

const bcryptSaltRounds = parsePositiveInt(process.env.BCRYPT_SALT_ROUNDS, isTest ? 10 : 12);
if (bcryptSaltRounds < 10) {
  throw new Error('BCRYPT_SALT_ROUNDS must be at least 10');
}

function resolveMongoUri(uri, dbPassword) {
  let resolved = uri || `mongodb+srv://usgdb:${dbPassword || ''}@cluster0.2lkpovq.mongodb.net/usgdb?retryWrites=true&w=majority&appName=Cluster0`;
  if (dbPassword && resolved.includes('<db_password>')) {
    resolved = resolved.replace('<db_password>', encodeURIComponent(dbPassword));
  }
  return resolved;
}

const env = Object.freeze({
  NODE_ENV,
  isTest,
  isProduction,
  isDevelopment: NODE_ENV === 'development',
  PORT: parsePositiveInt(process.env.PORT, 5000),
  MONGODB_URI: resolveMongoUri(process.env.MONGODB_URI, process.env.DB_PASSWORD),
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_EXPIRES_IN_SECONDS: jwtExpiresInSeconds,
  JWT_ALGORITHM: 'HS256',
  JWT_ISSUER: process.env.JWT_ISSUER || 'webusg-api',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'webusg-client',
  BCRYPT_SALT_ROUNDS: bcryptSaltRounds,
  CORS_ORIGINS: parseOrigins(process.env.CORS_ORIGINS),
  AUTH_RATE_LIMIT_WINDOW_MS: parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, isTest ? 20 : 10),
  JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT || '100kb',
});

function getAdminSeedConfig() {
  return {
    name: requireValue('ADMIN_NAME', process.env.ADMIN_NAME),
    email: requireValue('ADMIN_EMAIL', process.env.ADMIN_EMAIL),
    password: requireValue('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD),
  };
}

module.exports = {
  ...env,
  env,
  parseExpiresInToSeconds,
  getAdminSeedConfig,
};
