// server/src/config/db.js
// ----------------------------------------------------
// Connects your Node/Express server to MongoDB.
// Uses MONGO_URI from .env
// ----------------------------------------------------

import mongoose from "mongoose";

export async function connectDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

    // Exit the process if DB connection fails
    process.exit(1);
  }
}
