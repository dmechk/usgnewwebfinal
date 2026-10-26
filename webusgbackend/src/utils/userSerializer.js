function toPublicUser(user, options = {}) {
  if (!user) {
    return null;
  }

  const id = user.id || (user._id ? String(user._id) : undefined);

  const serialized = {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    department: user.department || '',
    isActive: user.isActive,
    isActivated: user.isActivated !== false,
    passwordChangeRequired: Boolean(user.passwordChangeRequired),
    onboardingEmailStatus: user.onboardingEmailStatus || null,
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (options && options.includePassword && user.rawPassword) {
    serialized.currentPassword = user.rawPassword;
  }

  return serialized;
}

module.exports = { toPublicUser };
