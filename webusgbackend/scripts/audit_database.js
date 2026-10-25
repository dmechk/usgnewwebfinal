'use strict';

const path = require('path');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Career = require('../src/models/Career');
const Applicant = require('../src/models/Applicant');
const News = require('../src/models/News');
const Gallery = require('../src/models/Gallery');
const AuditLog = require('../src/models/AuditLog');

async function runAudit() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('================================================================');
  console.log('              UBUMWE SACCO MONGODB DATABASE AUDIT               ');
  console.log('================================================================');
  console.log('Connected Database Name:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('Timestamp:', new Date().toISOString());

  // 1. Users Collection
  const users = await User.find({}, 'name email role isActive passwordChangeRequired createdAt lastLoginAt').sort({ createdAt: 1 });
  console.log('\n================================================================');
  console.log('1. USERS & ACCESS CONTROL (Total Records: ' + users.length + ')');
  console.log('================================================================');
  users.forEach((u, i) => {
    console.log('[' + (i + 1) + '] ID: ' + u._id);
    console.log('    Name: ' + u.name);
    console.log('    Email: ' + u.email);
    console.log('    Role: ' + u.role);
    console.log('    Active: ' + u.isActive);
    console.log('    MustChangePass: ' + u.passwordChangeRequired);
    console.log('    Last Login: ' + (u.lastLoginAt ? u.lastLoginAt.toISOString() : 'Never'));
    console.log('    Created: ' + (u.createdAt ? u.createdAt.toISOString() : '-'));
    console.log('----------------------------------------------------------------');
  });

  // 2. Careers Collection
  const careers = await Career.find({}).sort({ createdAt: 1 });
  console.log('\n================================================================');
  console.log('2. CAREERS & VACANCIES (Total Records: ' + careers.length + ')');
  console.log('================================================================');
  careers.forEach((c, i) => {
    console.log('[' + (i + 1) + '] ID: ' + c._id + ' | Title: ' + c.title + ' | Dept: ' + c.department + ' | Published: ' + c.isPublished);
  });

  // 3. Applicants Collection
  const applicants = await Applicant.find({}).sort({ createdAt: -1 });
  console.log('\n================================================================');
  console.log('3. JOB APPLICANTS (Total Records: ' + applicants.length + ')');
  console.log('================================================================');
  applicants.forEach((a, i) => {
    console.log('[' + (i + 1) + '] ID: ' + a._id + ' | Name: ' + a.fullName + ' | Email: ' + a.email + ' | Job: ' + a.jobTitle + ' | Status: ' + a.status);
  });

  // 4. News Collection
  const news = await News.find({}).sort({ createdAt: 1 });
  console.log('\n================================================================');
  console.log('4. NEWS & BULLETINS (Total Records: ' + news.length + ')');
  console.log('================================================================');
  news.forEach((n, i) => {
    console.log('[' + (i + 1) + '] ID: ' + n._id + ' | Title: ' + n.title + ' | Category: ' + n.category + ' | Published: ' + n.isPublished);
  });

  // 5. Gallery Collection
  const gallery = await Gallery.find({}).sort({ createdAt: 1 });
  console.log('\n================================================================');
  console.log('5. GALLERY & MOMENTS (Total Records: ' + gallery.length + ')');
  console.log('================================================================');
  gallery.forEach((g, i) => {
    console.log('[' + (i + 1) + '] ID: ' + g._id + ' | Title: ' + g.title + ' | Category: ' + g.category + ' | Published: ' + g.isPublished);
  });

  // 6. AuditLog Collection
  const totalAudit = await AuditLog.countDocuments();
  const latestAudit = await AuditLog.find({}).sort({ createdAt: -1 }).limit(8);
  console.log('\n================================================================');
  console.log('6. SECURITY & ADMINISTRATIVE AUDIT TRAIL (Total Events: ' + totalAudit + ')');
  console.log('================================================================');
  latestAudit.forEach((l, i) => {
    console.log('[' + (i + 1) + '] ' + (l.createdAt ? l.createdAt.toISOString() : '-') +
      ' | Action: ' + l.action +
      ' | Actor: ' + (l.actorEmail || 'System') +
      ' (' + (l.actorRole || 'N/A') + ')' +
      ' | Outcome: ' + l.outcome);
  });

  await mongoose.disconnect();
}

runAudit().catch((err) => {
  console.error('Audit Error:', err);
  process.exit(1);
});
