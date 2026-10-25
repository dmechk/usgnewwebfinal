const { toPublicUser } = require('../../src/utils/userSerializer');

describe('toPublicUser', () => {
  it('returns a safe user representation without secrets', () => {
    const user = {
      _id: { toString: () => 'abc123' },
      name: 'Ada',
      email: 'ada@example.com',
      role: 'admin',
      isActive: true,
      passwordChangeRequired: false,
      lastLoginAt: new Date('2026-10-18T12:00:00.000Z'),
      createdAt: new Date('2026-10-01T00:00:00.000Z'),
      updatedAt: new Date('2026-10-18T12:00:00.000Z'),
      password: '$2a$10$not-a-real-hash',
      passwordChangedAt: new Date('2026-10-01T00:00:00.000Z'),
    };

    const publicUser = toPublicUser(user);

    expect(publicUser).toEqual({
      id: 'abc123',
      name: 'Ada',
      email: 'ada@example.com',
      role: 'admin',
      phone: '',
      department: '',
      isActive: true,
      passwordChangeRequired: false,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    expect(publicUser).not.toHaveProperty('password');
    expect(publicUser).not.toHaveProperty('passwordChangedAt');
  });

  it('returns null for a missing user', () => {
    expect(toPublicUser(null)).toBeNull();
  });
});
