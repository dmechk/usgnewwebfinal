/**
 * Creates the initial administrator from environment variables.
 * Idempotent: will not duplicate an existing admin or reset their password.
 * Never prints the administrator password or hash.
 */
require('dotenv').config({ quiet: true });

const connectDB = require('../src/config/db');
const { disconnectDB } = require('../src/config/db');
const { getAdminSeedConfig } = require('../src/config/env');
const { seedAdmin } = require('../src/services/seedAdmin.service');

async function run() {
  const config = getAdminSeedConfig();
  await connectDB();

  const result = await seedAdmin({ ...config, role: 'ADMIN_IT' });

  if (result.created) {
    console.log(`Administrator created for ${result.user.email}`);
  } else {
    console.log(`Administrator already exists for ${result.user.email}; password was not changed`);
  }
}

run()
  .catch((err) => {
    console.error(err.message || 'Admin seed failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
