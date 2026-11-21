'use strict';

require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');

async function showAll() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/webusg';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  console.log('\nConnected Database:', mongoose.connection.name);
  console.log('----------------------------------------------------');

  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`📁 Collection: [${col.name}] => ${count} documents`);
    if (count > 0 && count <= 25) {
      const docs = await db.collection(col.name).find({}).limit(10).toArray();
      docs.forEach((doc, idx) => {
        const identifier = doc.email || doc.name || doc.title || doc.fullName || doc._id;
        const role = doc.role ? ` [${doc.role}]` : '';
        console.log(`   ${idx + 1}. ${identifier}${role}`);
      });
      if (count > 10) {
        console.log(`   ... and ${count - 10} more documents`);
      }
    }
    console.log('');
  }

  await mongoose.disconnect();
}

showAll().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
