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

      // ✅ IMPORTANT: store all customisation choices
      frame: String,
      mat: String,
      material: String,

      // ✅ IMPORTANT: store crop/ratio metadata
      transform: {
        crop: { x: Number, y: Number },
        zoom: Number,
        croppedAreaPixels: { x: Number, y: Number, width: Number, height: Number },

        ratio: String,
        ratioW: Number,
        ratioH: Number,
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

    shippingMethod: { type: String, default: "standard" },

    items: { type: [OrderItemSchema], default: [] },

    totals: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      currency: { type: String, required: true },
    },

    stripe: {
      paymentIntentId: { type: String, default: "" },
      status: { type: String, default: "" },
      amount: { type: Number, default: 0 }, // smallest unit (e.g., fils)
      currency: { type: String, default: "" },
    },

    email: {
      confirmationSent: { type: Boolean, default: false },
      confirmationSentAt: { type: Date, default: null },
      fulfillmentSent: { type: Boolean, default: false },
      fulfillmentSentAt: { type: Date, default: null },
    },

    paidAt: { type: Date, default: null },

    carrier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["requires_payment", "paid", "processing", "shipped", "completed", "cancelled", "refunded"],
      default: "requires_payment",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
