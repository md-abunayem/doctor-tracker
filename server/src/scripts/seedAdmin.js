import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { DB_NAME } from "../constants/index.js";

const seedAdmin = async () => {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
  } else {
    await User.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
};

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});