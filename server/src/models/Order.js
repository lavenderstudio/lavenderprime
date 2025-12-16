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
  { _id: false } // ✅ fine for orders; items are immutable snapshots
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

    // (Optional but useful) store chosen shipping method
    shippingMethod: {
      type: String,
      default: "standard",
    },

    items: { type: [OrderItemSchema], default: [] },

    totals: {
      // ✅ keep subtotal as you have it
      subtotal: { type: Number, required: true },

      // ✅ add these now (even if you keep them 0 for MVP)
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },

      // ✅ what Stripe should actually charge
      grandTotal: { type: Number, required: true },

      currency: { type: String, required: true },
    },

    // ✅ Stripe reconciliation fields
    stripe: {
      paymentIntentId: { type: String, default: "" },
      status: { type: String, default: "" }, // e.g. "requires_payment_method", "succeeded"
      amount: { type: Number, default: 0 }, // amount you charged (major units or smallest units - be consistent)
      currency: { type: String, default: "" },
    },

    paidAt: { type: Date, default: null },

    // ✅ physical fulfilment tracking (optional but useful)
    carrier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },

    status: {
      type: String,
      // ✅ "requires_payment" makes the flow unambiguous
      enum: ["requires_payment", "paid", "processing", "shipped", "completed", "cancelled", "refunded"],
      default: "requires_payment",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
