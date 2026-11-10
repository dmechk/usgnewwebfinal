'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const assert = require('assert');
const { detectLanguage, VERIFIED_INSTITUTION_PROFILE } = require('../src/services/ai.service');
const { hasPermission, PERMISSIONS, ROLES } = require('../src/config/roles');
const { toPublicUser } = require('../src/utils/userSerializer');

console.log('====================================================');
console.log('UBUMWE SACCO GAKENKE: SYSTEM VERIFICATION SUITE');
console.log('====================================================');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    testsFailed++;
  }
}

// 1. Language Detection Verification
runTest('Language Detection: Kinyarwanda query ("Muraho, ndifuza gufungura konti muri SACCO")', () => {
  const lang = detectLanguage('Muraho, ndifuza gufungura konti muri SACCO');
  assert.strictEqual(lang, 'rw', `Expected "rw", got "${lang}"`);
});

runTest('Language Detection: French query ("Bonjour, comment ouvrir un compte épargne ?")', () => {
  const lang = detectLanguage('Bonjour, comment ouvrir un compte épargne ?');
  assert.strictEqual(lang, 'fr', `Expected "fr", got "${lang}"`);
});

runTest('Language Detection: English query ("What are the loan interest rates and requirements?")', () => {
  const lang = detectLanguage('What are the loan interest rates and requirements?');
  assert.strictEqual(lang, 'en', `Expected "en", got "${lang}"`);
});

// 2. Official Contact Information Guardrail Verification
runTest('Institutional Identity: Official email is strictly preserved', () => {
  assert.strictEqual(
    VERIFIED_INSTITUTION_PROFILE.officialEmail,
    'ubumwesaccogakenke@gmail.com',
    'Official email must be ubumwesaccogakenke@gmail.com'
  );
  assert.notStrictEqual(
    VERIFIED_INSTITUTION_PROFILE.officialEmail,
    'ubumwesaccogakenke1@gmail.com',
    'Technical SMTP email ubumwesaccogakenke1@gmail.com must never be the public contact'
  );
});

runTest('Institutional Identity: Official telephone is strictly 0786422080', () => {
  assert.strictEqual(
    VERIFIED_INSTITUTION_PROFILE.officialPhone,
    '0786422080',
    'Official phone must be 0786422080'
  );
});

runTest('Institutional Identity: USSD Banking code is strictly *541#', () => {
  assert.strictEqual(
    VERIFIED_INSTITUTION_PROFILE.ussdCode,
    '*541#',
    'USSD code must be *541#'
  );
});

// 3. User Serializer Security Verification (Critical Fix 1)
runTest('User Serializer: Plaintext password is never leaked', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Administrator',
    email: 'admin@ubumwesacco.rw',
    role: 'ADMIN_IT',
    isActive: true,
    passwordChangeRequired: false,
    rawPassword: 'PlaintextPassword123!', // Legacy artifact if present
  };

  const serialized = toPublicUser(mockUser);
  assert.strictEqual(serialized.rawPassword, undefined, 'rawPassword property must not be returned');
  assert.strictEqual(serialized.currentPassword, undefined, 'currentPassword property must not be returned');
  assert.strictEqual(serialized.email, 'admin@ubumwesacco.rw');
});

// 4. Role-Based Access Control Verification
runTest('RBAC: ADMIN_IT has full wildcard and AI permissions', () => {
  assert.strictEqual(hasPermission(ROLES.ADMIN_IT, PERMISSIONS.AI_READ), true);
  assert.strictEqual(hasPermission(ROLES.ADMIN_IT, PERMISSIONS.AI_MANAGE), true);
  assert.strictEqual(hasPermission(ROLES.ADMIN_IT, PERMISSIONS.SETTINGS_MANAGE), true);
});

runTest('RBAC: ADMIN has AI read and manage permissions', () => {
  assert.strictEqual(hasPermission(ROLES.ADMIN, PERMISSIONS.AI_READ), true);
  assert.strictEqual(hasPermission(ROLES.ADMIN, PERMISSIONS.AI_MANAGE), true);
});

runTest('RBAC: MD has read-only access to AI modules', () => {
  assert.strictEqual(hasPermission(ROLES.MD, PERMISSIONS.AI_READ), true);
  assert.strictEqual(hasPermission(ROLES.MD, PERMISSIONS.AI_MANAGE), false);
});

runTest('RBAC: ADMIN_HR cannot manage AI configuration', () => {
  assert.strictEqual(hasPermission(ROLES.ADMIN_HR, PERMISSIONS.AI_MANAGE), false);
});

// 5. Model Loading Verification
runTest('Models: KnowledgeArticle, FAQ, and AIChatSession schemas load cleanly', () => {
  const KnowledgeArticle = require('../src/models/KnowledgeArticle');
  const FAQ = require('../src/models/FAQ');
  const AIChatSession = require('../src/models/AIChatSession');
  const SiteSettings = require('../src/models/SiteSettings');

  assert.ok(KnowledgeArticle, 'KnowledgeArticle model loaded');
  assert.ok(FAQ, 'FAQ model loaded');
  assert.ok(AIChatSession, 'AIChatSession model loaded');
  assert.ok(SiteSettings, 'SiteSettings model loaded');
});

// 6. Routes and Middleware Loading
runTest('Routes: AI routes and controllers load and expose endpoints', () => {
  const aiRoutes = require('../src/routes/ai.routes');
  const routes = require('../src/routes/index');
  assert.ok(aiRoutes, 'ai.routes loaded');
  assert.ok(routes, 'main routes loaded');
});

console.log('====================================================');
console.log(`SUMMARY: ${testsPassed} passed, ${testsFailed} failed`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
}
