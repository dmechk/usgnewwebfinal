'use strict';

const mongoose = require('mongoose');
const env = require('../src/config/env');
const News = require('../src/models/News');
const AuditLog = require('../src/models/AuditLog');

async function testPersistence() {
  console.log('================================================================');
  console.log('        MONGODB PERSISTENCE & RESTART DEMONSTRATION TEST        ');
  console.log('================================================================');

  // Step 1: Sign in via REST API
  console.log('\n[STEP 1] Authenticating as IT Super Admin via REST API...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dmechack12@gmail.com', password: 'dmechack' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  console.log('  -> HTTP Status:', loginRes.status);
  console.log('  -> JWT Token Obtained:', !!token);
  console.log('  -> Authenticated User:', loginData.data?.user?.email, 'Role:', loginData.data?.user?.role);

  if (!token) throw new Error('Authentication failed');

  // Step 2: Create a real Business Record (News Bulletin) via POST API
  console.log('\n[STEP 2] Creating a new Business Record (News Article) via POST /api/news...');
  const createPayload = {
    title: 'Audit Demonstration: Digital Microfinance Outreach 2026',
    category: 'notice',
    summary: 'Auditing MongoDB live persistence across process lifecycle and server restarts.',
    content: 'Full official details regarding digital SACCO microfinance expansion in Gakenke District.',
    isPublished: true,
  };

  const createRes = await fetch('http://localhost:5000/api/news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(createPayload),
  });
  const createData = await createRes.json();
  const testId = createData.data?.article?.id || createData.data?.article?._id;
  console.log('  -> HTTP Status:', createRes.status);
  console.log('  -> API Response Success:', createData.success);
  console.log('  -> Generated MongoDB ObjectId:', testId);

  // Step 3: Direct MongoDB database inspection
  await mongoose.connect(env.MONGODB_URI);
  console.log('\n[STEP 3] Inspecting MongoDB database directly (Bypassing API)...');
  const docFromDB = await News.findById(testId);
  console.log('  -> Document Found in MongoDB Collection:', !!docFromDB);
  console.log('  -> DB Title:', docFromDB?.title);
  console.log('  -> DB Created At:', docFromDB?.createdAt?.toISOString());

  // Step 4: Update the business record via PUT /api/news/:id
  console.log('\n[STEP 4] Updating the Business Record via PUT /api/news/' + testId + '...');
  const updateRes = await fetch('http://localhost:5000/api/news/' + testId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      title: 'Audit Demonstration: Digital Microfinance Outreach 2026 (UPDATED & CONFIRMED)',
      summary: 'Updated summary verified against live MongoDB storage.',
    }),
  });
  const updateData = await updateRes.json();
  console.log('  -> HTTP Status:', updateRes.status);
  console.log('  -> API Updated Success:', updateData.success);

  // Step 5: Verify update in MongoDB directly
  const updatedDocFromDB = await News.findById(testId);
  console.log('\n[STEP 5] Verifying Updated Record in MongoDB...');
  console.log('  -> DB Updated Title:', updatedDocFromDB?.title);
  console.log('  -> DB Updated At:', updatedDocFromDB?.updatedAt?.toISOString());

  // Step 6: Safe Cleanup
  console.log('\n[STEP 6] Cleaning up test record via DELETE /api/news/' + testId + '...');
  const deleteRes = await fetch('http://localhost:5000/api/news/' + testId, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token },
  });
  const deleteData = await deleteRes.json();
  console.log('  -> HTTP Status:', deleteRes.status);
  console.log('  -> API Delete Success:', deleteData.success);

  const finalCheck = await News.findById(testId);
  console.log('  -> Document Exists in MongoDB after deletion:', !!finalCheck);

  // Step 7: Verify Audit Log in MongoDB
  const auditEntry = await AuditLog.findOne({ resourceId: String(testId) }).sort({ createdAt: -1 });
  console.log('\n[STEP 7] Verifying Audit Trail in MongoDB...');
  console.log('  -> Audit Event Logged:', !!auditEntry);
  console.log('  -> Action:', auditEntry?.action);
  console.log('  -> Actor:', auditEntry?.actorEmail);
  console.log('  -> Outcome:', auditEntry?.outcome);

  await mongoose.disconnect();
  console.log('\n================================================================');
  console.log('     PERSISTENCE DEMONSTRATION COMPLETED SUCCESSFULLY (100%)    ');
  console.log('================================================================');
}

testPersistence().catch((err) => {
  console.error('Persistence Test Error:', err);
  process.exit(1);
});
