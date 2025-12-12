// server/src/models/Cart.js
// ----------------------------------------------------
// Cart stores a snapshot of configurable print items.
// One cart per guest (sessionId) or user (later).
// ----------------------------------------------------

import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    productSlug: { type: String, required: true },
    variantSku: { type: String, required: true },

    config: {
      orientation: String,
      size: String,
      mount: String,
      quantity: { type: Number, default: 1 },

      // Crop + zoom metadata (critical for print accuracy)
      transform: {
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

    assets: {
      originalUrl: String,
      previewUrl: String, // generated preview image
    },

    price: {
      unit: Number,
      total: Number,
      currency: String,
    },
  },
  { timestamps: true }
);

const CartSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);
