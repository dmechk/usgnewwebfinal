const fs = require('fs');
const os = require('os');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        ip: '127.0.0.1',
        launchTimeout: 60000,
      },
    });
    const uriPath = path.join(os.tmpdir(), 'webusg-test-mongo-uri');
    const uri = await mongod.getUri();
    fs.writeFileSync(uriPath, uri, 'utf8');
    globalThis.__MONGOD__ = mongod;
  } catch (err) {
    // Fallback to a local MongoDB instance if available
    const fallbackUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/webusg-test';
    const uriPath = path.join(os.tmpdir(), 'webusg-test-mongo-uri');
    fs.writeFileSync(uriPath, fallbackUri, 'utf8');
    console.warn('MongoMemoryServer failed, using fallback URI:', fallbackUri);
  }
};
