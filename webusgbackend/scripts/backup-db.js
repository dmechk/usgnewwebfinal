'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const env = require('../src/config/env');

async function backupDatabase() {
  console.log('Connecting to MongoDB for backup...');
  await mongoose.connect(env.MONGODB_URI);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups', `backup-${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const collections = await mongoose.connection.db.listCollections().toArray();
  const summary = {};

  for (const col of collections) {
    const colName = col.name;
    const docs = await mongoose.connection.db.collection(colName).find({}).toArray();
    const filePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    summary[colName] = docs.length;
    console.log(`Saved collection "${colName}": ${docs.length} document(s) -> ${filePath}`);
  }

  const manifestPath = path.join(backupDir, 'manifest.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        backupDate: new Date().toISOString(),
        collections: summary,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log('Database backup completed successfully at:', backupDir);
  await mongoose.disconnect();
}

backupDatabase().catch((err) => {
  console.error('Database backup failed:', err);
  process.exit(1);
});
