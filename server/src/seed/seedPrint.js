// server/src/seed/seedPrint.js
// ----------------------------------------------------
// Seeds the database with a "Print" product containing
// portrait variants for MVP.
// Run: node src/seed/seedPrint.js
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
      slug: "print",
      name: "Print",
      type: "PRINT",
      variants: [
        { sku: "PRINT_A4_PORTRAIT", orientation: "portrait", size: "A4", basePrice: 49 },
        { sku: "PRINT_A3_PORTRAIT", orientation: "portrait", size: "A3", basePrice: 79 },
        { sku: "PRINT_30x40_PORTRAIT", orientation: "portrait", size: "30x40", basePrice: 99 }
      ],
      options: {
        mounts: [
          { name: "No Mount", price: 0 },
          { name: "White Mount", price: 20 }
        ],
        frameColors: []
      }
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
