function createUserDoc(overrides = {}) {
  const id = overrides._id || '507f1f77bcf86cd799439011';
  return {
    _id: id,
    id: String(id),
    name: 'Clinic Admin',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    passwordChangeRequired: false,
    lastLoginAt: null,
    passwordChangedAt: new Date('2026-01-01T00:00:00.000Z'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    password: '$2a$10$hashed',
    comparePassword: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

module.exports = { createUserDoc };
