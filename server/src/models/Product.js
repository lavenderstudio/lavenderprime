// server/src/models/Product.js
// ----------------------------------------------------
// Product schema holds reference data:
// - slug/name/type
// - variants (sku, orientation, size, basePrice)
// - options (mounts/frames/mats etc.)
// - purchaseConfig: supports quantity & multi-upload products
// - personalizationConfig (NEW): defines which user inputs are required per product
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
      enum: ["portrait", "landscape", "square"],
      required: true,
    },
    size: { type: String, required: true },
    basePrice: { type: Number, required: true },
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

// ----------------------------------------------------
// ✅ NEW: Personalization configuration
// This tells the frontend what inputs to collect for this product.
// The actual user input values should be saved in Cart/Order items.
// ----------------------------------------------------

const PersonalizationFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // e.g. "brideName"
    label: { type: String, required: true }, // e.g. "Bride's name"
    type: {
      type: String,
      enum: ["text", "textarea", "date", "select", "number"],
      default: "text",
    },

    required: { type: Boolean, default: false },

    // Validation rules (frontend + backend can reuse these)
    minLength: { type: Number, default: 0 },
    maxLength: { type: Number, default: 120 },

    // For select fields
    choices: { type: [String], default: [] },

    // Helpful UX details
    placeholder: { type: String, default: "" },
    helperText: { type: String, default: "" },

    // If you want to restrict content (optional)
    pattern: { type: String, default: "" }, // regex string for frontend validation

    // Controls rendering order on the UI
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const PersonalizationConfigSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },

    // The UI can display a title like "Personalise your frame"
    title: { type: String, default: "Personalisation" },

    // Fields the customer must fill
    fields: { type: [PersonalizationFieldSchema], default: [] },

    // Optional: define how this should appear on the print
    // (you can expand this later to support layouts / typography)
    printTemplateKey: { type: String, default: "" }, // e.g. "wedding_v1"
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },

    variants: { type: [VariantSchema], default: [] },

    options: {
      mounts: { type: [AddOnSchema], default: [] },
      frames: { type: [AddOnSchema], default: [] },
      mats: { type: [AddOnSchema], default: [] },
      materials: { type: [AddOnSchema], default: [] },
      frameColors: { type: [String], default: [] },
    },

    purchaseConfig: { type: PurchaseConfigSchema, default: () => ({}) },

    // ✅ NEW: personalization schema
    personalizationConfig: { type: PersonalizationConfigSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
