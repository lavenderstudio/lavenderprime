// server/src/models/Product.js
// ----------------------------------------------------
// Product schema holds reference data:
// - slug/name/type
// - variants (sku, orientation, size, basePrice)
// - options (mounts/frames/mats etc.)
// ----------------------------------------------------

import mongoose from "mongoose";

// Reusable schema for add-on options (mount/frame/mat)
const AddOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },  // e.g. "White Mount", "Black Wood", "Gallery"
    price: { type: Number, required: true }, // add-on cost
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
    size: { type: String, required: true }, // "A4", "A3", "30x40"
    basePrice: { type: Number, required: true }, // simplest pricing model for MVP
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true }, // "print"
    name: { type: String, required: true },              // "Print"
    type: { type: String, required: true },              // "PRINT"

    // Variants for different sizes/orientations
    variants: { type: [VariantSchema], default: [] },

    // Configurable add-ons
    options: {
      // existing
      mounts: { type: [AddOnSchema], default: [] },

      // NEW: frame selection (Black Wood, Gold Metal, etc.)
      frames: { type: [AddOnSchema], default: [] },

      // NEW: mat width selection (None, Thin, Classic, Gallery)
      mats: { type: [AddOnSchema], default: [] },

      // keep your existing field for later (Print&Frame)
      frameColors: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
