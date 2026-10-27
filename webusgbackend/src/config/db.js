const mongoose = require('mongoose');
const env = require('./env');

mongoose.set('strictQuery', true);

const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore if unsupported in environment
}

async function connectDB(uri = env.MONGODB_URI, maxRetries = 5) {
  if (!uri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }

  const isLocalhost = /localhost|127\.0\.0\.1/.test(uri);
  const os = require('os');
  const options = {
    autoIndex: !env.isProduction,
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 10,
    runtimeAdapters: { os },
  };

  if (env.isProduction && !isLocalhost) {
    options.tls = true;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, options);
      if (!env.isTest) {
        console.log('MongoDB connected successfully');
      }
      return mongoose.connection;
    } catch (err) {
      if (attempt === maxRetries) {
        throw err;
      }
      console.warn(`[MongoDB] Connection attempt ${attempt} failed (${err.message}). Retrying in 2s...`);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
