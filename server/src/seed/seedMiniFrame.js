// server/src/seed/seedMiniFrame.js
// ----------------------------------------------------
// Seeds "Mini-Frames" product (quantity + per-unit uploads)
// Run: node src/seed/seedMiniFrame.js
// ----------------------------------------------------

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected (seed)");

    await Product.deleteOne({ slug: "mini-frames" });

    const miniFrames = await Product.create({
      slug: "mini-frames",
      name: "Mini-Frames",
      type: "MINI_FRAMES",
      variants: [{ sku: "MF_20x20", orientation: "portrait", size: "20x20", basePrice: 115 }],

      options: {
        // ✅ mini-frames don't use mounts (leave empty)
        mounts: [],

        // ✅ if user isn't selecting frame material, keep empty
        frames: [
          { name: "Black Wood", price: 0 },
          { name: "White Wood", price: 0 },
          { name: "Natural Wood", price: 0 },
        ],

        // ✅ IMPORTANT: Classic/Modern stored as "mats" because frontend sends options.mat
        mats: [
          { name: "Classic", price: 0 },
          { name: "Modern", price: 0 },
        ],

        materials: [],
        frameColors: [],
      },

      purchaseConfig: {
        quantity: { enabled: true, label: "Frame Quantity", min: 1, max: 9, step: 1, default: 1 },
        uploads: { enabled: true, perUnit: true, min: 1, max: 9 },
        pricing: { model: "per_unit" },
      },
    });

    console.log("✅ Seeded product:", miniFrames.slug);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("👋 DB disconnected (seed)");
  }
}

run();
