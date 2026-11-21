'use strict';

const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');
const { ensureInitialAIKnowledge } = require('./services/seedAiKnowledge.service');
const { ensureInitialStaffUsers } = require('./services/seedUsers.service');
const { ensureInitialContent } = require('./services/seedContent.service');

async function start() {
  await connectDB();

  // Ensure initial verified SACCO knowledge & FAQs are present if collections are empty
  await ensureInitialAIKnowledge();

  // Ensure all 15 initial SACCO staff users are seeded
  await ensureInitialStaffUsers();

  // Ensure initial Gallery moments, News bulletins, and Careers are seeded
  await ensureInitialContent();

  const server = app.listen(env.PORT, () => {
    console.log(`Ubumwe SACCO Gakenke Web API listening on port ${env.PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${env.PORT} is already in use. Stop the other process or change PORT in .env`
      );
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
