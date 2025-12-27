// server/src/seed/seedWeddingFrame.js
// ----------------------------------------------------
// Seeds the database with a "Wedding Print & Frame" product
// including variants + frame/mount/mat options + personalization fields.
// Run: node src/seed/seedWeddingFrame.js
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
    await Product.deleteOne({ slug: "wedding-frame" });

    const weddingProduct = await Product.create({
      slug: "wedding-frame",
      name: "Wedding Print & Frame",
      type: "WEDDING_FRAME",

      // You can tweak these sizes/prices to match your business
      variants: [
        { sku: "WEDDING_FRAME_27x39", orientation: "portrait", size: "27x39", basePrice: 169 },
        { sku: "WEDDING_FRAME_40x59", orientation: "portrait", size: "40x59", basePrice: 279 },
        { sku: "WEDDING_FRAME_51x75", orientation: "portrait", size: "51x75", basePrice: 379 },
        { sku: "WEDDING_FRAME_61x90", orientation: "portrait", size: "61x90", basePrice: 489 },
        { sku: "WEDDING_FRAME_71x105", orientation: "portrait", size: "71x105", basePrice: 609 },
      ],

      options: {
        // Mount options
        mounts: [],

        // Frame options (names MUST match your UI strings)
        frames: [
          { name: "Black Wood", price: 0 },
          { name: "White Wood", price: 0 },
          { name: "Walnut Wood", price: 0 },
          { name: "Natural Wood", price: 0 },
          { name: "Black Metal", price: 0 },
          { name: "Gold Metal", price: 0 },
        ],

        // Mat options (names MUST match your UI strings)
        mats: [],

        // keep for later
        frameColors: [],
      },

      // ✅ NEW: personalization config for wedding details
      // NOTE: this requires Product.js to include personalizationConfig
      personalizationConfig: {
        enabled: true,
        title: "Personalise Your Wedding Frame",
        printTemplateKey: "wedding_v1",
        fields: [
          {
            key: "groomName",
            label: "Groom's Name",
            type: "text",
            required: true,
            minLength: 2,
            maxLength: 40,
            placeholder: "John",
            helperText: "Enter The Groom’s Name Exactly As You Want It Printed.",
            sortOrder: 1,
          },
          {
            key: "brideName",
            label: "Bride's Name",
            type: "text",
            required: true,
            minLength: 2,
            maxLength: 40,
            placeholder: "Karen",
            helperText: "Enter The Bride's Name Exactly As You Want It Printed.",
            sortOrder: 2,
          },
          {
            key: "location",
            label: "Location",
            type: "text",
            required: true,
            minLength: 0,
            maxLength: 60,
            placeholder: "Dubai, United Arab Emirates",
            helperText: "City / Venue / Country.",
            sortOrder: 3,
          },
          {
            key: "weddingDate",
            label: "Wedding Date",
            type: "date",
            required: true,
            sortOrder: 4,
          },
          {
            key: "message",
            label: "Message (OPTIONAL)",
            type: "textarea",
            required: false,
            minLength: 0,
            maxLength: 50,
            placeholder: "Forever & Always",
            helperText: "A Short Line Under The Date.",
            sortOrder: 5,
          },
        ],
      },

      // Optional: if you want quantity/uploads logic like your other products
      purchaseConfig: {
        quantity: {
          enabled: true,
          min: 1,
          max: 5,
          step: 1,
          default: 1,
          label: "Quantity",
        },
        uploads: {
          enabled: true,
          perUnit: true,
          fixedCount: 1,
          min: 1,
          max: 1,
        },
        pricing: {
          model: "per_unit",
          tiers: [],
        },
      },
    });

    console.log("✅ Seeded product:", weddingProduct.slug);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("👋 DB disconnected (seed)");
  }
}

run();
