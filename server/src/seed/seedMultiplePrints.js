// server/src/seed/seedMultiplePrints.js
// ----------------------------------------------------
// Seeds the "Multiple Prints" product.
// - Unlimited quantity (subject to min/max)
// - 1 upload per unit (perUnit: true)
// - Uses same printing variants/options as standard Print
// Run: node src/seed/seedMultiplePrints.js
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

    // If product exists, replace it
    await Product.deleteOne({ slug: "multiple-prints" });

    const product = await Product.create({
      slug: "multiple-prints",
      name: "Multiple Prints",
      type: "PRINT", // Reusing PRINT type for backend logic if needed, or could be new type
      variants: [
        {
          sku: "MP_12x18",
          orientation: "portrait",
          size: "12x18",
          basePrice: 29,
        },
        {
          sku: "MP_20x30",
          orientation: "portrait",
          size: "20x30",
          basePrice: 39,
        },
        {
          sku: "MP_30x45",
          orientation: "portrait",
          size: "30x45",
          basePrice: 59,
        },
        {
          sku: "MP_40x60",
          orientation: "portrait",
          size: "40x60",
          basePrice: 79,
        },
        {
          sku: "MP_50x75",
          orientation: "portrait",
          size: "50x75",
          basePrice: 99,
        },
        {
          sku: "MP_60x90",
          orientation: "portrait",
          size: "60x90",
          basePrice: 169,
        },
      ],
      options: {
        mounts: [],
        frames: [],
        mats: [],
        materials: [
          { name: "Matte", price: 0 },
          { name: "Glossy", price: 0 },
        ],
        frameColors: [],
      },
      purchaseConfig: {
        quantity: {
          enabled: true,
          label: "Quantity",
          min: 1,
          max: 50,
          step: 1,
          default: 1,
        },
        uploads: {
          enabled: true,
          perUnit: true,
          min: 1,
          max: 50,
        },
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
