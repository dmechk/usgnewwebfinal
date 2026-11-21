"use strict";

require("dotenv").config({ quiet: true });
const connectDB = require("../src/config/db");
const { disconnectDB } = require("../src/config/db");
const User = require("../src/models/User");

const { STAFF_USERS } = require("../src/services/seedUsers.service");

async function seedAllUsers() {
  await connectDB();
  console.log("\nSeeding all 14 Ubumwe SACCO staff users...\n");
  let created = 0, skipped = 0, errors = 0;

  for (const userData of STAFF_USERS) {
    try {
      const normalizedEmail = userData.email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        console.log("  SKIP [" + userData.role + "] " + userData.email);
        skipped++;
      } else {
        await User.create({ ...userData, email: normalizedEmail });
        console.log("  OK   [" + userData.role + "] " + userData.email);
        created++;
      }
    } catch (err) {
      console.error("  ERR  " + userData.email + ": " + err.message);
      errors++;
    }
  }
  console.log("\nDone: " + created + " created, " + skipped + " skipped, " + errors + " errors.");
}

seedAllUsers()
  .catch((err) => { console.error("Fatal:", err.message); process.exitCode = 1; })
  .finally(async () => { await disconnectDB(); });
