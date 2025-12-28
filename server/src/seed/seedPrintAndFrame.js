// server/src/seed/seedPrint&Frame.js
// ----------------------------------------------------
// Seeds the database with a "Print & Frame" product containing
// portrait variants + options (mounts, frames, mats) for MVP.
// Run: node src/seed/seedPrintAndFrame.js
// ----------------------------------------------------

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected (seed)");

    // If product exists, replace it (keeps seeding repeatable)
    await Product.deleteOne({ slug: "print-and-frame" });

    const printProduct = await Product.create({
      slug: "print-and-frame",
      name: "Print & Frame",
      type: "PRINT_&_FRAME",
      variants: [
        { sku: "PRINT&FRAME_14x20", orientation: "portrait", size: "14x20", basePrice: 89 },
        { sku: "PRINT&FRAME_22x32", orientation: "portrait", size: "22x32", basePrice: 139 },
        { sku: "PRINT&FRAME_32x47", orientation: "portrait", size: "32x47", basePrice: 209 },
        { sku: "PRINT&FRAME_42x62", orientation: "portrait", size: "42x62", basePrice: 289 },
        { sku: "PRINT&FRAME_53x78", orientation: "portrait", size: "53x78", basePrice: 379 },
        { sku: "PRINT&FRAME_63x93", orientation: "portrait", size: "63x93", basePrice: 489 },
      ],
      options: {
        // Mount options (existing)
        mounts: [
          { name: "No Mount", price: 0 },
          { name: "White Mount", price: 20 },
        ],

        // NEW: Frame options (names MUST match your UI strings)
        frames: [
          { name: "Black Wood", price: 0 },
          { name: "White Wood", price: 0 },
          { name: "Walnut Wood", price: 0 },
          { name: "Natural Wood", price: 0 },
          { name: "Black Metal", price: 0 },
          { name: "Gold Metal", price: 0 },
        ],

        // NEW: Mat options (names MUST match your UI strings)
        mats: [
          { name: "None", price: 0 },
          { name: "Thin", price: 30 },
          { name: "Classic", price: 50 },
          { name: "Gallery", price: 110 },
        ],

        // keep for later
        frameColors: [],
      },
    });

    console.log("✅ Seeded product:", printProduct.slug);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("👋 DB disconnected (seed)");
  }
}

run();