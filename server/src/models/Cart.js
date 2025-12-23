// server/src/models/Cart.js
// ----------------------------------------------------
// Cart stores a snapshot of configurable print items.
// Supports:
// - Single-image products (prints, canvas)
// - Multi-image products (mini-frames, per-unit uploads)
// ----------------------------------------------------

import mongoose from "mongoose";

/**
 * Per-image asset (used by mini-frames)
 */
const AssetItemSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    previewUrl: { type: String, default: "" },

    // Crop + ratio metadata (per image)
    transform: {
      ratio: String,
      ratioW: Number,
      ratioH: Number,

      crop: {
        x: Number,
        y: Number,
      },
      zoom: Number,

      croppedAreaPixels: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
      },
    },
  },
  { _id: false }
);

/**
 * Cart item
 */
const CartItemSchema = new mongoose.Schema(
  {
    productSlug: { type: String, required: true },
    variantSku: { type: String, required: true },

    // Product configuration (NO quantity here)
    config: {
      orientation: String,
      size: String,
      mount: String,
      material: String,
      frame: String,
      mat: String,

      // Legacy single-image crop support
      transform: {
        ratio: String,
        ratioW: Number,
        ratioH: Number,

        crop: {
          x: Number,
          y: Number,
        },
        zoom: Number,

        croppedAreaPixels: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
      },
    },

    // ✅ Quantity belongs at item level
    quantity: { type: Number, default: 1 },

    // Assets (single or multi-image)
    assets: {
      // Mini-frames (multi-image)
      items: { type: [AssetItemSchema], default: [] },

      // Prints / canvas (single image)
      originalUrl: { type: String, default: "" },
      previewUrl: { type: String, default: "" },
    },

    // Price snapshot
    price: {
      unit: { type: Number, required: true },
      total: { type: Number, required: true },
      currency: { type: String, default: "AED" },
    },
  },
  { timestamps: true }
);

/**
 * Cart
 */
const CartSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);
