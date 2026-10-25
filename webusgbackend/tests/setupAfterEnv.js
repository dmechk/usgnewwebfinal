jest.setTimeout(30000);

// Start in-memory MongoDB for tests and set MONGODB_URI
const { startTestDb, stopTestDb, clearDb } = require('./helpers/db');

beforeAll(async () => {
  const uri = await startTestDb();
  process.env.MONGODB_URI = uri;
});

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await stopTestDb();
});
