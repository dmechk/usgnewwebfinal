'use strict';

require('dotenv').config();
const { verifySmtpConnection, sendMail } = require('../src/services/email.service');
const env = require('../src/config/env');

async function main() {
  console.log('--- Ubumwe SACCO SMTP Diagnostic ---');
  console.log(`SMTP Host:           ${env.SMTP_HOST || '(simulated - no host)'}`);
  console.log(`SMTP Port:           ${env.SMTP_PORT}`);
  console.log(`SMTP User:           ${env.SMTP_USER || '(none)'}`);
  console.log(`Official SACCO Email: ${env.OFFICIAL_CONTACT_EMAIL}`);
  console.log(`Email Reply-To:      ${env.EMAIL_REPLY_TO}`);
  console.log(`Email From:          ${env.EMAIL_FROM}`);

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log('\n[INFO] SMTP credentials are not fully configured yet in .env.');
    console.log('To activate live Gmail delivery:');
    console.log('1. Set SMTP_HOST=smtp.gmail.com');
    console.log('2. Set SMTP_PORT=587');
    console.log('3. Set SMTP_USER=ubumwesaccogakenke1@gmail.com');
    console.log('4. Set SMTP_PASS=<your 16-character Google App Password>');
    return;
  }

  console.log(`\nTesting SMTP handshake with ${env.SMTP_HOST}...`);
  try {
    const verified = await verifySmtpConnection();
    console.log('[SUCCESS] SMTP Connection established successfully!', verified);
  } catch (err) {
    console.error('[ERROR] SMTP verification failed:', err.message);
    if (err.message.includes('Username and Password not accepted') || err.message.includes('BadCredentials')) {
      console.error('\nNOTE: Google requires an App Password (not your normal Gmail login password).');
      console.error('Make sure 2-Step Verification is ON, then generate an App Password at:');
      console.error('https://myaccount.google.com/apppasswords');
    }
  }
}

main().catch(console.error);
