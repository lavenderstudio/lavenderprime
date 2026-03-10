// server/src/seed/seedCollageFrame.js
// ----------------------------------------------------
// Seeds "Collage Frame" product
// IMPORTANT: Product.variant.orientation is an enum in your schema
// so we must only use allowed values ("portrait" / "landscape").
//
// We encode collage layout in SKU instead:
// - COL_PP_...  (portrait-portrait)
// - COL_PL_...  (portrait-landscape)
// - COL_LL_...  (landscape-landscape)
// - COL_LP_...  (landscape-portrait)
// - COL_SQ_...  (square)
//
// Run: node src/seed/seedCollageFrame.js
// ----------------------------------------------------

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected (seed)");

    await Product.deleteOne({ slug: "collage-frame" });

    const product = await Product.create({
      slug: "collage-frame",
      name: "Collage Frame",
      type: "COLLAGE_FRAME",

      // ✅ orientation must match your enum -> only "portrait"/"landscape"
      variants: [
        { sku: "COL_SQ_31.5x31.5_4", orientation: "portrait", size: "31.5x31.5", basePrice: 179 },
        { sku: "COL_SQ_43x43_9", orientation: "portrait", size: "43x43", basePrice: 250 },
        { sku: "COL_SQ_54.5x54.5_16", orientation: "portrait", size: "54.5x54.5", basePrice: 359 },
      ],

      options: {
        frames: [
          { name: "Black Wood", price: 0 },
          { name: "White Wood", price: 0 },
          { name: "Walnut Wood", price: 0 },
          { name: "Natural Wood", price: 0 },
        ],
        mats: [],
        mounts: [],
        materials: [],
        frameColors: [],
      },

      purchaseConfig: {
        quantity: { enabled: false, min: 1, max: 1, step: 1, default: 1 },
        uploads: { enabled: true, perUnit: false, min: 2, max: 16 },
        pricing: { model: "per_unit" },
      },
    });

    console.log("✅ Seeded product:", product.slug);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("👋 DB disconnected (seed)");
  }
}

run();
