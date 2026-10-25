const User = require('../../src/models/User');
const { seedAdmin } = require('../../src/services/seedAdmin.service');

describe('seedAdmin', () => {
  const adminInput = {
    name: 'System Administrator',
    email: 'Admin@Example.com',
    password: 'initial-admin-pass',
  };

  it('creates an administrator once', async () => {
    const first = await seedAdmin(adminInput);
    expect(first.created).toBe(true);
    expect(first.user.role).toBe('admin');
    expect(first.user.email).toBe('admin@example.com');
  });

  it('is idempotent and does not reset the password', async () => {
    await seedAdmin(adminInput);
    const original = await User.findOne({ email: 'admin@example.com' }).select('+password');

    const second = await seedAdmin({
      ...adminInput,
      password: 'a-different-password',
    });

    expect(second.created).toBe(false);
    const after = await User.findOne({ email: 'admin@example.com' }).select('+password');
    expect(after.password).toBe(original.password);
    expect(await User.countDocuments()).toBe(1);
  });

  it('does not promote an existing non-admin user', async () => {
    await User.create({
      name: 'Tech',
      email: 'admin@example.com',
      password: 'technician-pass',
      role: 'technician',
    });

    await expect(seedAdmin(adminInput)).rejects.toMatchObject({
      code: 'ADMIN_SEED_NOT_PROMOTED',
      statusCode: 409,
    });

    const user = await User.findOne({ email: 'admin@example.com' });
    expect(user.role).toBe('technician');
  });
});
