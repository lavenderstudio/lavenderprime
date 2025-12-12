// server/src/models/Product.js
// ----------------------------------------------------
// Product schema holds reference data:
// - slug/name/type
// - variants (sku, orientation, size, basePrice)
// - options (mounts/frame colors etc. - we’ll expand later)
// ----------------------------------------------------

import mongoose from "mongoose";

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

    // Configurable add-ons (keep empty for now)
    options: {
      mounts: {
        type: [
          {
            name: { type: String, required: true }, // "No Mount", "White Mount"
            price: { type: Number, required: true }, // add-on cost
          },
        ],
        default: [],
      },
      frameColors: { type: [String], default: [] }, // for Print&Frame later
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
