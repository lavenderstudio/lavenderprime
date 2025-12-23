// server/src/models/Product.js
// ----------------------------------------------------
// Product schema holds reference data:
// - slug/name/type
// - variants (sku, orientation, size, basePrice)
// - options (mounts/frames/mats etc.)
// - purchaseConfig (NEW): supports quantity & multi-upload products (e.g., Mini-Frames)
// ----------------------------------------------------

import mongoose from "mongoose";

// Reusable schema for add-on options (mount/frame/mat/material)
const AddOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },   // e.g. "Black Wood"
    price: { type: Number, required: true },  // add-on cost
  },
  { _id: false }
);

// Each variant is a purchasable option (like A4 portrait)
const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true }, // unique within a product
    orientation: {
      type: String,
      enum: ["portrait", "landscape"],
      required: true,
    },
    size: { type: String, required: true },     // "A4", "A3", "20x20"
    basePrice: { type: Number, required: true } // base price (interpretation depends on pricing model)
  },
  { _id: false }
);

// NEW: pricing tiers for products like "3 for 345", "6 for 650"
const PricingTierSchema = new mongoose.Schema(
  {
    qty: { type: Number, required: true },       // e.g. 3
    price: { type: Number, required: true },     // e.g. 345 (total price for qty=3)
  },
  { _id: false }
);

// NEW: purchase configuration for quantity/bundle products
const PurchaseConfigSchema = new mongoose.Schema(
  {
    // Quantity stepper on UI (like your Mini-Frames +/-)
    quantity: {
      enabled: { type: Boolean, default: false },

      // If you ONLY want certain quantities (e.g., [3, 6, 9])
      // leave empty to allow any number using min/max/step.
      allowedQuantities: { type: [Number], default: [] },

      min: { type: Number, default: 1 },
      max: { type: Number, default: 1 },
      step: { type: Number, default: 1 },
      default: { type: Number, default: 1 },

      // UI label (optional) — "Frame Quantity"
      label: { type: String, default: "Quantity" },
    },

    // Upload rules (Mini-Frames = 1 upload per frame)
    uploads: {
      enabled: { type: Boolean, default: false },

      // If true: requiredUploads = quantity (Mini-Frames)
      perUnit: { type: Boolean, default: false },

      // If not perUnit, you can force a fixed number of uploads (e.g., 2 photos always)
      fixedCount: { type: Number, default: 0 },

      // Optional bounds (nice to guard UI abuse)
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },

    // Pricing interpretation for quantity products
    pricing: {
      // per_unit: total = quantity * variant.basePrice
      // tiered:   total = lookup tier price by quantity (ignores basePrice for total)
      model: { type: String, enum: ["per_unit", "tiered"], default: "per_unit" },

      // Used only if model === "tiered"
      tiers: { type: [PricingTierSchema], default: [] },
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true }, // "print"
    name: { type: String, required: true },              // "Print"
    type: { type: String, required: true },              // "PRINT" / "MINI_FRAMES"

    variants: { type: [VariantSchema], default: [] },

    options: {
      mounts: { type: [AddOnSchema], default: [] },
      frames: { type: [AddOnSchema], default: [] },
      mats: { type: [AddOnSchema], default: [] },
      materials: { type: [AddOnSchema], default: [] },
      frameColors: { type: [String], default: [] },
    },

    // ✅ NEW: controls multi-quantity + multi-upload behavior
    purchaseConfig: { type: PurchaseConfigSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
