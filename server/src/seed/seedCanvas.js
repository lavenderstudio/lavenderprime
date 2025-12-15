// server/src/seed/seedCanvas.js
// ----------------------------------------------------
// Seeds the database with a "Canvas" product containing
// portrait variants + options (mounts, frames, mats) for MVP.
// Run: node src/seed/seedCanvas.js
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
    await Product.deleteOne({ slug: "print" });

    const printProduct = await Product.create({
      slug: "canvas",
      name: "Canvas",
      type: "CANVAS",
      variants: [
        { sku: "CANVAS_30x45", orientation: "portrait", size: "30x45", basePrice: 149 },
        { sku: "CANVAS_40x60", orientation: "portrait", size: "40x60", basePrice: 209 },
        { sku: "CANVAS_50x75", orientation: "portrait", size: "50x75", basePrice: 269 },
        { sku: "CANVAS_60x90", orientation: "portrait", size: "60x90", basePrice: 329 },
        { sku: "CANVAS_70x105", orientation: "portrait", size: "70x105", basePrice: 399 },
      ],
      options: {
        // Mount options (existing)
        mounts: [],

        // NEW: Frame options (names MUST match your UI strings)
        frames: [
          { name: "Stretched", price: 0 },
          { name: "Black Wood", price: 100 },
          { name: "White Wood", price: 100 },
          { name: "Natural Wood", price: 100 },
        ],

        // NEW: Mat options (names MUST match your UI strings)
        mats: [],

        materials: [],

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