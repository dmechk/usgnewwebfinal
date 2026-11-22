'use strict';

const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/webusg';
const ATLAS_URI = 'mongodb+srv://usgdb:12345@cluster0.2lkpovq.mongodb.net/webusg?retryWrites=true&w=majority&appName=Cluster0';

const COLLECTIONS_TO_SYNC = [
  'users',
  'news',
  'careers',
  'galleries',
  'knowledgearticles',
  'faqs',
  'inquiries',
  'applicants',
  'auditlogs',
  'sitesettings'
];

async function syncAll() {
  console.log('Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('Connected to Local MongoDB!');

  console.log('Connecting to MongoDB Atlas (Cloud)...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('Connected to MongoDB Atlas!');

  const localDb = localConn.db;
  const atlasDb = atlasConn.db;

  for (const colName of COLLECTIONS_TO_SYNC) {
    try {
      const docs = await localDb.collection(colName).find({}).toArray();
      console.log(`\nSyncing [${colName}]: ${docs.length} documents found in local DB...`);
      
      let synced = 0;
      for (const doc of docs) {
        if (colName === 'users') {
          // Check if user exists by email
          const email = doc.email.toLowerCase().trim();
          const { _id, ...dataWithoutId } = doc;
          const existing = await atlasDb.collection(colName).findOne({ email });
          if (existing) {
            await atlasDb.collection(colName).updateOne(
              { email },
              { $set: dataWithoutId }
            );
          } else {
            await atlasDb.collection(colName).insertOne({ ...doc, email });
          }
        } else {
          // Upsert by _id for other collections
          const { _id, ...dataWithoutId } = doc;
          await atlasDb.collection(colName).updateOne(
            { _id: doc._id },
            { $set: dataWithoutId },
            { upsert: true }
          );
        }
        synced++;
      }
      
      const atlasCount = await atlasDb.collection(colName).countDocuments();
      console.log(`  -> Synced ${synced} docs. Atlas [${colName}] now has: ${atlasCount} documents.`);
    } catch (err) {
      console.error(`  -> Error syncing ${colName}:`, err.message);
    }
  }

  // Print final Atlas status
  console.log('\n========================================');
  console.log('FINAL ATLAS CLOUD DATABASE STATUS:');
  console.log('========================================');
  for (const colName of COLLECTIONS_TO_SYNC) {
    const c = await atlasDb.collection(colName).countDocuments();
    console.log(`  ${colName}: ${c} documents in Atlas`);
  }
  console.log('========================================\n');

  await localConn.close();
  await atlasConn.close();
}

syncAll()
  .then(() => {
    console.log('Sync to MongoDB Atlas completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal sync error:', err);
    process.exit(1);
  });
