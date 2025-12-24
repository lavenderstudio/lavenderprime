// server/src/models/Product.js
// ----------------------------------------------------
// Product schema holds reference data:
// - slug/name/type
// - variants (sku, orientation, size, basePrice)
// - options (mounts/frames/mats etc.)
// - purchaseConfig (NEW): supports quantity & multi-upload products (e.g., Mini-Frames)
// ----------------------------------------------------

import mongoose from "mongoose";

const AddOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    orientation: {
      type: String,
      enum: ["portrait", "landscape"],
      required: true,
    },
    size: { type: String, required: true },     
    basePrice: { type: Number, required: true } 
  },
  { _id: false }
);

const PricingTierSchema = new mongoose.Schema(
  {
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const PurchaseConfigSchema = new mongoose.Schema(
  {
    quantity: {
      enabled: { type: Boolean, default: false },

      allowedQuantities: { type: [Number], default: [] },

      min: { type: Number, default: 1 },
      max: { type: Number, default: 1 },
      step: { type: Number, default: 1 },
      default: { type: Number, default: 1 },

      label: { type: String, default: "Quantity" },
    },

    uploads: {
      enabled: { type: Boolean, default: false },

      perUnit: { type: Boolean, default: false },

      fixedCount: { type: Number, default: 0 },

      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },

    pricing: {
      model: { type: String, enum: ["per_unit", "tiered"], default: "per_unit" },

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
