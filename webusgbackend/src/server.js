const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`WebUSG API listening on port ${env.PORT}`);
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
