// server/src/models/Order.js
// ----------------------------------------------------
// Order = immutable snapshot created at checkout.
// We copy cart items into the order so pricing/config never changes.
// ----------------------------------------------------

import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productSlug: { type: String, required: true },
    variantSku: { type: String, required: true },

    config: {
      orientation: String,
      size: String,
      mount: String,
      quantity: Number,
      transform: {
        crop: { x: Number, y: Number },
        zoom: Number,
        croppedAreaPixels: { x: Number, y: Number, width: Number, height: Number },
      },
    },

    assets: {
      originalUrl: String,
      previewUrl: String,
    },

    price: {
      unit: Number,
      total: Number,
      currency: String,
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // Guest checkout for now (later: userId)
    sessionId: { type: String, required: true },

    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },

    shippingAddress: {
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      postcode: { type: String, required: true },
      country: { type: String, required: true },
    },

    items: { type: [OrderItemSchema], default: [] },

    totals: {
      subtotal: { type: Number, required: true },
      currency: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);