// server/src/seed/seedFineArtPrint.js
// ----------------------------------------------------
// Seeds the database with a "Fine Art Print" product containing
// portrait variants + options (mounts, frames, mats) for MVP.
// Run: node src/seed/seedFineArtPrint.js
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
    await Product.deleteOne({ slug: "fine-art-print" });

    const printProduct = await Product.create({
      slug: "fine-art-print",
      name: "Fine Art Print",
      type: "FINE_ART_PRINT",
      variants: [
        { sku: "FINE_ART_PRINT_12x18", orientation: "portrait", size: "12x18", basePrice: 29 },
        { sku: "FINE_ART_PRINT_20x30", orientation: "portrait", size: "20x30", basePrice: 39 },
        { sku: "FINE_ART_PRINT_30x45", orientation: "portrait", size: "30x45", basePrice: 59 },
        { sku: "FINE_ART_PRINT_40x60", orientation: "portrait", size: "40x60", basePrice: 79 },
        { sku: "FINE_ART_PRINT_50x75", orientation: "portrait", size: "50x75", basePrice: 99 },
        { sku: "FINE_ART_PRINT_60x90", orientation: "portrait", size: "60x90", basePrice: 169 },
      ],
      options: {
        // Mount options (existing)
        mounts: [],

        // NEW: Frame options (names MUST match your UI strings)
        frames: [],

        // NEW: Mat options (names MUST match your UI strings)
        mats: [],

        // NEW: Material options (names MUST match your UI strings)
        materials: [
          { name: "Fine Art", price: 0 },
          { name: "Premium Glossy", price: 0 },
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
