'use strict';

require('dotenv').config({ quiet: true });
const connectDB = require('../src/config/db');
const { disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { ROLES } = require('../src/config/roles');
const { normalizeEmail } = require('../src/utils/email');

const DEFAULT_ROLE_USERS = [
  {
    name: 'Mbitsemunda Phocas (Manager & Media Admin)',
    email: 'manager@ubumwesacco.rw',
    password: 'Password123!',
    role: ROLES.ADMIN, // Gallery & News Administrator
  },
  {
    name: 'Innocent N. (HR Administrator)',
    email: 'hr@ubumwesacco.rw',
    password: 'Password123!',
    role: ROLES.ADMIN_HR, // HR & Recruitment Administrator
  },
  {
    name: 'Finance & Admin Director (DAF)',
    email: 'daf@ubumwesacco.rw',
    password: 'Password123!',
    role: ROLES.DAF, // Careers & Vacancies Administrator
  },
  {
    name: 'Managing Director (Executive Oversight)',
    email: 'md@ubumwesacco.rw',
    password: 'Password123!',
    role: ROLES.MD, // Executive Oversight & Audit
  },
  {
    name: 'Wellarse (Board Trustee & Governance)',
    email: 'wellarse@ubumwesacco.rw',
    password: 'Password123!',
    role: ROLES.MD,
  },
  {
    name: 'Bartazal (Board Director & Audit Trustee)',
    email: 'bartazal@ubumwesacco.rw',
    password: 'Password123!',
    role: ROLES.MD,
  },
];

async function seedRoles() {
  await connectDB();
  console.log('Checking and seeding canonical role accounts (idempotent)...');

  for (const account of DEFAULT_ROLE_USERS) {
    const email = normalizeEmail(account.email);
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`User already exists for ${email} with role '${existing.role}'; preserved without modification.`);
    } else {
      await User.create({
        name: account.name,
        email,
        password: account.password,
        role: account.role,
        isActive: true,
        passwordChangeRequired: false,
      });
      console.log(`Created verified role account for ${email} (${account.role})`);
    }
  }

  console.log('Role accounts verified successfully.');
}

seedRoles()
  .catch((err) => {
    console.error('Role seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
