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
    autoIndex: !env.isProduction,       // Skip index building in prod (pre-built)
    serverSelectionTimeoutMS: 10000,    // Fail fast if Atlas is unreachable
    socketTimeoutMS: 45000,             // Drop idle sockets after 45s
    connectTimeoutMS: 10000,            // TCP connection timeout
    heartbeatFrequencyMS: 10000,        // Check connection health every 10s
    maxPoolSize: 20,                    // More concurrent connections for prod
    minPoolSize: 2,                     // Keep 2 connections warm at all times
    maxIdleTimeMS: 60000,               // Close idle connections after 60s
    bufferCommands: false,              // Fail fast instead of buffering
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
