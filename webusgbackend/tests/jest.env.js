process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-jwt-secret-must-be-32-chars-min';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_ISSUER = 'webusg-api';
process.env.JWT_AUDIENCE = 'webusg-client';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';
process.env.AUTH_RATE_LIMIT_MAX = '100';
process.env.JSON_BODY_LIMIT = '100kb';

// Load in‑memory MongoDB URI written by globalSetup
const fs = require('fs');
const os = require('os');
const path = require('path');
const uriPath = path.join(os.tmpdir(), 'webusg-test-mongo-uri');
if (fs.existsSync(uriPath)) {
  process.env.MONGODB_URI = fs.readFileSync(uriPath, 'utf8').trim();
}
