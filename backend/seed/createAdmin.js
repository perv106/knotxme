// Run with: npm run create-admin
// Prompts for an email and password, then creates (or updates) an Admin login.
require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Login = require("../models/Login");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  await connectDB();

  const email = (await ask("Admin email: ")).trim().toLowerCase();
  const password = await ask("Admin password (min 8 chars): ");
  rl.close();

  if (!email || password.length < 8) {
    console.error("❌ Invalid email or password too short.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);
  const existing = await Login.findOne({ email });

  if (existing) {
    existing.password = hashed;
    existing.role = "admin";
    existing.accountStatus = "Active";
    await existing.save();
    console.log("✅ Existing account updated to Admin:", email);
  } else {
    await Login.create({ email, password: hashed, role: "admin" });
    console.log("✅ Admin account created:", email);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
