'use strict';

/**
 * Centralized Role-Based Access Control (RBAC) Configuration
 *
 * Defines the 5 canonical application roles, permissions, permission matrices,
 * and role-appropriate dashboard landing routes.
 */

const ROLES = Object.freeze({
  ADMIN_IT: 'ADMIN_IT', // System Super Administrator
  ADMIN: 'ADMIN',       // Gallery and News Administrator
  ADMIN_HR: 'ADMIN_HR', // Human Resources Administrator
  DAF: 'DAF',           // Careers Administrator
  MD: 'MD',             // Managing Director (Executive Oversight)
  LOAN_OFFICER: 'LOAN_OFFICER', // Senior Credit & Loan Officer (KYC, Loans, Products)
});

// Canonical list of active application roles
const ROLE_LIST = Object.freeze(Object.values(ROLES));

// Legacy roles from previous schema for safe backward compatibility and migration
const LEGACY_ROLES = Object.freeze(['admin', 'radiologist', 'technician']);
const ALL_ROLES = Object.freeze([...ROLE_LIST, ...LEGACY_ROLES]);

// Granular permissions list
const PERMISSIONS = Object.freeze({
  // System & Users
  USERS_READ: 'users:read',
  USERS_MANAGE: 'users:manage',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_STATUS: 'users:status:manage',
  ROLES_ASSIGN: 'roles:assign',
  SETTINGS_MANAGE: 'settings:manage',

  // Gallery
  GALLERY_READ: 'gallery:read',
  GALLERY_CREATE: 'gallery:create',
  GALLERY_UPDATE: 'gallery:update',
  GALLERY_DELETE: 'gallery:delete',
  GALLERY_PUBLISH: 'gallery:publish',

  // News
  NEWS_READ: 'news:read',
  NEWS_CREATE: 'news:create',
  NEWS_UPDATE: 'news:update',
  NEWS_DELETE: 'news:delete',
  NEWS_PUBLISH: 'news:publish',

  // Applicants & Recruitment
  APPLICANTS_READ: 'applicants:read',
  APPLICANTS_REVIEW: 'applicants:review',
  APPLICANTS_STATUS_UPDATE: 'applicants:status:update',
  APPLICANTS_FEEDBACK_CREATE: 'applicants:feedback:create',
  APPLICANTS_MESSAGES_READ: 'applicants:messages:read',
  APPLICANTS_MESSAGES_CREATE: 'applicants:messages:create',

  // Careers
  CAREERS_READ: 'careers:read',
  CAREERS_CREATE: 'careers:create',
  CAREERS_UPDATE: 'careers:update',
  CAREERS_DELETE: 'careers:delete',
  CAREERS_PUBLISH: 'careers:publish',

  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_GALLERY_NEWS: 'reports:gallery-news:read',
  REPORTS_RECRUITMENT: 'reports:recruitment:read',
  REPORTS_CAREERS: 'reports:careers:read',
  REPORTS_OVERVIEW: 'reports:overview:read',

  // Audit Logs
  AUDIT_READ: 'audit:read',

  // Clinic modules (existing ultrasound system)
  PATIENTS_READ: 'patients:read',
  PATIENTS_MANAGE: 'patients:manage',
  EXAMS_READ: 'exams:read',
  EXAMS_MANAGE: 'exams:manage',

  // Inquiries & Feedback System
  INQUIRIES_READ: 'inquiries:read',
  INQUIRIES_CREATE: 'inquiries:create',
  INQUIRIES_UPDATE: 'inquiries:update',
  INQUIRIES_DELETE: 'inquiries:delete',
  INQUIRIES_FEEDBACK: 'inquiries:feedback',

  // Loan & Credit Operations
  LOANS_READ: 'loans:read',
  LOANS_MANAGE: 'loans:manage',
  LOANS_APPROVE: 'loans:approve',
  LOANS_REJECT: 'loans:reject',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_MANAGE: 'products:manage',

  // AI Digital Assistant & Knowledge
  AI_READ: 'ai:read',
  AI_MANAGE: 'ai:manage',
});

// Role to permissions mapping: all roles are granted full system-wide CRUD access
const ALL_PERMISSIONS_SET = Object.freeze([
  '*',
  ...Object.values(PERMISSIONS),
]);

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN_IT]: ALL_PERMISSIONS_SET,
  [ROLES.ADMIN]: ALL_PERMISSIONS_SET,
  [ROLES.ADMIN_HR]: ALL_PERMISSIONS_SET,
  [ROLES.DAF]: ALL_PERMISSIONS_SET,
  [ROLES.MD]: ALL_PERMISSIONS_SET,
  [ROLES.LOAN_OFFICER]: ALL_PERMISSIONS_SET,
  admin: ALL_PERMISSIONS_SET,
  radiologist: ALL_PERMISSIONS_SET,
  technician: ALL_PERMISSIONS_SET,
});

// Role-appropriate dashboard landing routes for frontend redirection
const ROLE_DASHBOARDS = Object.freeze({
  [ROLES.ADMIN_IT]: '/admin/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.ADMIN_HR]: '/admin/dashboard',
  [ROLES.DAF]: '/admin/dashboard',
  [ROLES.MD]: '/admin/dashboard',
  [ROLES.LOAN_OFFICER]: '/admin/dashboard',
  admin: '/admin/dashboard',
  radiologist: '/admin/dashboard',
  technician: '/admin/dashboard',
});

/**
 * Check if a role has a given permission
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

/**
 * Returns the list of permissions for a role
 * @param {string} role
 * @returns {string[]}
 */
function getPermissionsForRole(role) {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return [];
  if (permissions.includes('*')) {
    return Object.values(PERMISSIONS);
  }
  return [...permissions];
}

/**
 * Returns the dashboard landing URL for a role
 * @param {string} role
 * @returns {string}
 */
function getDashboardForRole(role) {
  return ROLE_DASHBOARDS[role] || '/dashboard';
}

/**
 * Validates whether a role is one of the 5 canonical application roles
 * @param {string} role
 * @returns {boolean}
 */
function isValidRole(role) {
  return ROLE_LIST.includes(role);
}

module.exports = {
  ROLES,
  ROLE_LIST,
  LEGACY_ROLES,
  ALL_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_DASHBOARDS,
  hasPermission,
  getPermissionsForRole,
  getDashboardForRole,
  isValidRole,
};
