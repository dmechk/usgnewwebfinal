const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

async function startTestDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongod = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      launchTimeout: 60000,
    },
  });

  const uri = await mongod.getUri();
  const os = require('os');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    runtimeAdapters: {
      os,
    },
  });
  return uri;
}



async function stopTestDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}

async function clearDb() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

module.exports = {
  startTestDb,
  stopTestDb,
  clearDb,
};
