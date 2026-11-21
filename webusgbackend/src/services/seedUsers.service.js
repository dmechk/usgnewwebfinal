'use strict';

const User = require('../models/User');

const STAFF_USERS = [
  {
    name: 'Mechack D',
    email: 'dmechack12@gmail.com',
    password: 'dmechack',
    role: 'ADMIN_IT',
    department: 'Information Technology',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Mbitsemunda Phocas (Manager & Media Admin)',
    email: 'manager@ubumwesacco.rw',
    password: 'Password123!',
    role: 'ADMIN',
    department: 'Executive Management',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Innocent N. (HR Administrator)',
    email: 'hr@ubumwesacco.rw',
    password: 'Password123!',
    role: 'ADMIN_HR',
    department: 'Human Resources',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Finance & Admin Director (DAF)',
    email: 'daf@ubumwesacco.rw',
    password: 'Password123!',
    role: 'DAF',
    department: 'Finance & Administration',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Managing Director (Executive Oversight)',
    email: 'md@ubumwesacco.rw',
    password: 'Password123!',
    role: 'MD',
    department: 'Executive & Board Oversight',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Wellarse (Board Trustee & Governance)',
    email: 'wellarse@ubumwesacco.rw',
    password: 'Password123!',
    role: 'MD',
    department: 'Board of Trustees',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Bartazal (Board Director & Audit Trustee)',
    email: 'bartazal@ubumwesacco.rw',
    password: 'Password123!',
    role: 'MD',
    department: 'Audit & Compliance Committee',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Mbitsemunda Phocas',
    email: 'phocas@ubumwesacco.rw',
    password: 'Password123!',
    role: 'ADMIN',
    department: 'Branch Operations',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Admin SACCO',
    email: 'ubumwesaccogakenke@gmail.com',
    password: 'gakenke2026',
    role: 'ADMIN',
    department: 'Communications & Member Relations',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'System Administrator',
    email: 'admin@example.com',
    password: 'Password123!',
    role: 'admin',
    department: 'System Administration',
    phone: '0786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'dushime mechack',
    email: 'dushimemechack9@gmail.com',
    password: 'Ubumwe@2026!',
    role: 'ADMIN_IT',
    department: 'Operations',
    phone: '+250784510083',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'dushime mechack',
    email: 'dushimemechack12@gmail.com',
    password: 'Kigali@123',
    role: 'ADMIN_IT',
    department: 'Operations',
    phone: '+250784510083',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Patrick Habimana',
    email: 'patrick.h@ubumwesacco.rw',
    password: 'Password123!',
    role: 'ADMIN_HR',
    department: 'Human Resources',
    phone: '+250788777888',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'Chantal Mukandayisenga (Senior Loan Officer)',
    email: 'loans@ubumwesacco.rw',
    password: 'Password123!',
    role: 'LOAN_OFFICER',
    department: 'Credit & Microfinance Operations',
    phone: '+250788541004',
    isActive: true,
    passwordChangeRequired: false,
  },
  {
    name: 'IT Operations Administrator',
    email: 'admin.it@ubumwesacco.rw',
    password: 'Password123!',
    role: 'ADMIN_IT',
    department: 'Information Technology',
    phone: '+250786422080',
    isActive: true,
    passwordChangeRequired: false,
  },
];

async function ensureInitialStaffUsers() {
  let createdCount = 0;
  for (const userData of STAFF_USERS) {
    try {
      const normalizedEmail = userData.email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail });
      if (!existing) {
        await User.create({ ...userData, email: normalizedEmail });
        createdCount++;
      }
    } catch (err) {
      // Do not block startup if individual record fails
      console.warn(`[StaffSeed] Skipping ${userData.email}: ${err.message}`);
    }
  }
  if (createdCount > 0) {
    console.log(`[StaffSeed] Successfully seeded ${createdCount} staff users.`);
  }
}

module.exports = {
  STAFF_USERS,
  ensureInitialStaffUsers,
};
