const mongoose = require('mongoose');
const env = require('./env');

mongoose.set('strictQuery', true);

async function connectDB(uri = env.MONGODB_URI) {
  if (!uri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }

  const isLocalhost = /localhost|127\.0\.0\.1/.test(uri);
  const os = require('os');
  const options = {
    autoIndex: !env.isProduction,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    runtimeAdapters: { os },
  };

  if (env.isProduction && !isLocalhost) {
    options.tls = true;
  }

  await mongoose.connect(uri, options);
  if (!env.isTest) {
    console.log('MongoDB connected');
  }
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
