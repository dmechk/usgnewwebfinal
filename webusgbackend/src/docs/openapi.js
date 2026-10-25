const env = require('../config/env');

const errorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string' },
    code: { type: 'string' },
  },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'WebUSG API',
    version: '1.0.0',
    description: [
      'Clinic ultrasound management API.',
      '',
      'Access tokens are JWT bearer credentials. Transmit them only over HTTPS in production.',
      'A valid token is re-checked against the current user record on each request so disabled',
      'accounts, password changes, and role updates are enforced without trusting the token alone.',
    ].join(' '),
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Versioned API',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication, profiles, and role definitions' },
    { name: 'Users', description: 'Staff and user administration (ADMIN_IT)' },
    { name: 'Gallery', description: 'Gallery content management (ADMIN, ADMIN_IT)' },
    { name: 'News', description: 'News articles & announcements (ADMIN, ADMIN_IT)' },
    { name: 'Careers', description: 'Job openings management (DAF, ADMIN_IT)' },
    { name: 'Applicants', description: 'Candidate recruitment pipeline (ADMIN_HR, MD, ADMIN_IT)' },
    { name: 'Reports', description: 'Departmental analytics & executive oversight (MD, ADMIN_IT, Leads)' },
    { name: 'Audit', description: 'System audit log inspection (ADMIN_IT, MD)' },
    { name: 'Health', description: 'System status & uptime check' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Provide the access token returned by sign-in. Example: Bearer <token>. Use HTTPS in production.',
      },
    },
    schemas: {
      SignInRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@example.com' },
          password: { type: 'string', format: 'password', example: 'replace-with-a-secure-password' },
        },
      },
      PublicUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'System Administrator' },
          email: { type: 'string', example: 'admin@example.com' },
          role: {
            type: 'string',
            enum: ['ADMIN_IT', 'ADMIN', 'ADMIN_HR', 'DAF', 'MD', 'admin', 'radiologist', 'technician'],
            example: 'ADMIN_IT',
          },
          isActive: { type: 'boolean' },
          passwordChangeRequired: { type: 'boolean' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['users:read', 'users:manage'],
          },
          dashboardUrl: { type: 'string', example: '/admin/dashboard' },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SignInResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Sign-in successful' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/PublicUser' },
              accessToken: { type: 'string' },
              tokenType: { type: 'string', example: 'Bearer' },
              expiresIn: {
                type: 'integer',
                description: 'Token lifetime in seconds (from server configuration)',
                example: env.JWT_EXPIRES_IN_SECONDS,
              },
            },
          },
        },
      },
      Error: errorSchema,
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is running',
          },
        },
      },
    },
    '/auth/signin': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in',
        description:
          'Authenticates a user with email and password and returns a signed JWT access token. Invalid credentials return a generic error to reduce account enumeration. Transmit tokens only over HTTPS in production.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignInRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Sign-in successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SignInResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Validation failed' },
                    errors: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          field: { type: 'string' },
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid email or password',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
              },
            },
          },
          403: {
            description: 'Account is disabled',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Account is disabled', code: 'ACCOUNT_DISABLED' },
              },
            },
          },
          429: {
            description: 'Too many sign-in attempts',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  message: 'Too many sign-in attempts. Please try again later.',
                  code: 'RATE_LIMITED',
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Internal server error' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user identity',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated identity' },
          401: { description: 'Missing, malformed, expired, or revoked token' },
          403: { description: 'Account is disabled' },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', format: 'password' },
                  newPassword: { type: 'string', format: 'password', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          400: { description: 'Current password incorrect or validation error' },
          401: { description: 'Unauthenticated' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List staff users (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'radiologist', 'technician'] } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'List of staff users with pagination' },
          401: { description: 'Unauthenticated' },
          403: { description: 'Forbidden - Admin only' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a new staff user (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                  role: { type: 'string', enum: ['admin', 'radiologist', 'technician'], default: 'technician' },
                  passwordChangeRequired: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Staff user created' },
          400: { description: 'Validation error' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get staff user by ID (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Staff user details' },
          404: { description: 'User not found' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update staff user (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['admin', 'radiologist', 'technician'] },
                  isActive: { type: 'boolean' },
                  passwordChangeRequired: { type: 'boolean' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Staff user updated' },
          400: { description: 'Self-deactivation/demotion disallowed or validation error' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete staff user (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Staff user deleted' },
          400: { description: 'Cannot delete own admin account' },
          404: { description: 'User not found' },
        },
      },
    },
    '/auth/roles': {
      get: {
        tags: ['Auth'],
        summary: 'List available roles and permissions matrix',
        responses: {
          200: { description: 'Canonical roles and permission matrix' },
        },
      },
    },
    '/users/{id}/role': {
      put: {
        tags: ['Users'],
        summary: 'Assign a role to a user (ADMIN_IT only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['ADMIN_IT', 'ADMIN', 'ADMIN_HR', 'DAF', 'MD'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Role successfully updated' },
          400: { description: 'Invalid role or self-demotion denied' },
          403: { description: 'Insufficient permissions' },
        },
      },
    },
    '/users/{id}/status': {
      put: {
        tags: ['Users'],
        summary: 'Activate or deactivate a user (ADMIN_IT only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isActive'],
                properties: { isActive: { type: 'boolean' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Account status updated' },
          400: { description: 'Cannot deactivate own admin account' },
        },
      },
    },
    '/gallery': {
      get: {
        tags: ['Gallery'],
        summary: 'List gallery items (Public / Authenticated)',
        responses: { 200: { description: 'List of gallery items' } },
      },
      post: {
        tags: ['Gallery'],
        summary: 'Create gallery item (ADMIN, ADMIN_IT)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Gallery item created' } },
      },
    },
    '/news': {
      get: {
        tags: ['News'],
        summary: 'List news announcements (Public / Authenticated)',
        responses: { 200: { description: 'List of news articles' } },
      },
      post: {
        tags: ['News'],
        summary: 'Create news article (ADMIN, ADMIN_IT)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'News article created' } },
      },
    },
    '/careers': {
      get: {
        tags: ['Careers'],
        summary: 'List career opportunities (Public / Authenticated)',
        responses: { 200: { description: 'List of job postings' } },
      },
      post: {
        tags: ['Careers'],
        summary: 'Create job opening (DAF, ADMIN_IT)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Job opening created' } },
      },
    },
    '/applicants': {
      get: {
        tags: ['Applicants'],
        summary: 'List applicants (ADMIN_HR, MD, ADMIN_IT)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of applicants' } },
      },
      post: {
        tags: ['Applicants'],
        summary: 'Submit job application (Public)',
        responses: { 201: { description: 'Application received' } },
      },
    },
    '/reports/overview': {
      get: {
        tags: ['Reports'],
        summary: 'Executive dashboard overview (MD, ADMIN_IT)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Executive department metrics' } },
      },
    },
    '/audit-logs': {
      get: {
        tags: ['Audit'],
        summary: 'View system audit logs (ADMIN_IT, MD)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Audit trail entries' } },
      },
    },
  },
};

