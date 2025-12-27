// server/src/models/Order.js
// ----------------------------------------------------
// Order = immutable snapshot created at checkout.
// We copy cart items into the order so pricing/config never changes.
// Supports single-image items AND mini-frames multi-image items.
// ----------------------------------------------------

import mongoose from "mongoose";

// ✅ For mini-frames: each uploaded photo slot becomes one asset item
const OrderAssetItemSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, default: "" },
    previewUrl: { type: String, default: "" },

    // keep transform per uploaded image (important for cropping/ratio)
    transform: {
      crop: { x: Number, y: Number },
      zoom: Number,
      croppedAreaPixels: { x: Number, y: Number, width: Number, height: Number },

      ratio: String,
      ratioW: Number,
      ratioH: Number,
    },
  },
  { _id: false }
);

const OrderPersonalizationSchema = new mongoose.Schema(
  {},
  { _id: false, strict: false }
);

const OrderItemSchema = new mongoose.Schema(
  {
    productSlug: { type: String, required: true },
    variantSku: { type: String, required: true },
    personalization: { type: OrderPersonalizationSchema, default: () => ({}) },

    config: {
      orientation: String,
      size: String,
      mount: String,
      quantity: Number,

      // ✅ IMPORTANT: store all customisation choices
      frame: String,
      mat: String,
      material: String,

      // ✅ IMPORTANT: store crop/ratio metadata (for single-image products)
      transform: {
        crop: { x: Number, y: Number },
        zoom: Number,
        croppedAreaPixels: { x: Number, y: Number, width: Number, height: Number },

        ratio: String,
        ratioW: Number,
        ratioH: Number,
      },
    },

    // ✅ UPDATED: support BOTH single image and multi images
    assets: {
      // Single-image products (print & frame, canvas, etc.)
      originalUrl: { type: String, default: "" },
      previewUrl: { type: String, default: "" },

      // Mini-frames: multiple uploads
      items: { type: [OrderAssetItemSchema], default: [] },
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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: Number, unique: true, index: true },

    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },

    shippingAddress: {
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      postcode: { type: String, default: "" },
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
