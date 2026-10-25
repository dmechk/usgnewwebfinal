"use strict";

require("dotenv").config({ quiet: true });
const connectDB = require("../src/config/db");
const { disconnectDB } = require("../src/config/db");
const User = require("../src/models/User");

const STAFF_USERS = [
  { name: "Mechack D", email: "dmechack12@gmail.com", password: "dmechack", role: "ADMIN_IT", isActive: true, passwordChangeRequired: false },
  { name: "Mbitsemunda Phocas", email: "manager@ubumwesacco.rw", password: "Password123!", role: "ADMIN", isActive: true, passwordChangeRequired: false },
  { name: "Innocent N.", email: "hr@ubumwesacco.rw", password: "Password123!", role: "ADMIN_HR", isActive: true, passwordChangeRequired: false },
  { name: "Director of Finance and Admin", email: "daf@ubumwesacco.rw", password: "Password123!", role: "DAF", isActive: true, passwordChangeRequired: false },
  { name: "Managing Director", email: "md@ubumwesacco.rw", password: "Password123!", role: "MD", isActive: true, passwordChangeRequired: false },
  { name: "Wellarse Executive", email: "wellarse@ubumwesacco.rw", password: "Password123!", role: "MD", isActive: true, passwordChangeRequired: false },
  { name: "Bartazal Board", email: "bartazal@ubumwesacco.rw", password: "Password123!", role: "MD", isActive: true, passwordChangeRequired: false },
  { name: "Mbitsemunda Phocas", email: "phocas@ubumwesacco.rw", password: "Password123!", role: "ADMIN", isActive: true, passwordChangeRequired: false },
  { name: "Admin SACCO", email: "ubumwesaccogakenke@gmail.com", password: "gakenke2026", role: "ADMIN", isActive: true, passwordChangeRequired: false },
];

async function seedAllUsers() {
  await connectDB();
  console.log("\nSeeding all Ubumwe SACCO staff users...\n");
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
