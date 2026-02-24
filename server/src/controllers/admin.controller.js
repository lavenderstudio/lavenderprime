// server/src/controllers/admin.controller.js
// ----------------------------------------------------
// Admin controllers (owner-only)
// - listOrders: supports status + optional date range filters
// - fulfillOrder: marks eligible order as completed
// ----------------------------------------------------

import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Build a Mongo date filter for createdAt using "YYYY-MM-DD" strings.
 * Uses UTC day boundaries to make the range inclusive.
 */
function buildCreatedAtRange(from, to) {
  if (!from && !to) return null;

  const range = {};

  if (from) {
    // Start of day (inclusive)
    range.$gte = new Date(`${from}T00:00:00.000Z`);
  }

  if (to) {
    // End of day (inclusive)
    range.$lte = new Date(`${to}T23:59:59.999Z`);
  }

  return range;
}

/**
 * GET /api/admin/orders?status=paid&from=YYYY-MM-DD&to=YYYY-MM-DD
 * Default status: paid
 */
export async function listOrders(req, res) {
  try {
    const status = req.query.status || "paid";
    const { from, to } = req.query;

    // ✅ Build query
    const query = { status };

    const createdAtRange = buildCreatedAtRange(from, to);
    if (createdAtRange) query.createdAt = createdAtRange;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ count: orders.length, orders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/admin/orders/:id/fulfill
 */
export async function fulfillOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Only allow fulfilment if payment is confirmed
    if (order.status !== "paid" && order.status !== "processing") {
      return res.status(400).json({
        message: `Order cannot be fulfilled from status '${order.status}'`,
      });
    }

    order.status = "completed";
    order.deliveredAt = new Date(); // rename to fulfilledAt if you prefer

    await order.save();

    return res.json({
      message: "Order marked as fulfilled",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/admin/products
 */
export async function listProducts(req, res) {
  try {
    const products = await Product.find().sort({ name: 1 });
    return res.json({ ok: true, products });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

/**
 * PATCH /api/admin/products/:slug
 * Body: { variants: [{ sku, basePrice }], options: { mounts, frames, mats, materials } }
 */
export async function updateProductPricing(req, res) {
  try {
    const { slug } = req.params;
    const { variants: variantUpdates, options: optionUpdates } = req.body;

    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ ok: false, message: "Product not found" });

    // Update variants by index — allows changing sku, size, orientation, and basePrice
    if (Array.isArray(variantUpdates)) {
      product.variants = product.variants.map((v, i) => {
        const update = variantUpdates[i];
        if (!update) return v;
        const obj = v.toObject();
        return {
          ...obj,
          sku: update.sku ?? obj.sku,
          size: update.size ?? obj.size,
          orientation: update.orientation ?? obj.orientation,
          basePrice: update.basePrice != null ? Number(update.basePrice) : obj.basePrice,
        };
      });
    }

    // Update option prices by name
    if (optionUpdates && typeof optionUpdates === "object") {
      for (const key of ["mounts", "frames", "mats", "materials"]) {
        if (Array.isArray(optionUpdates[key]) && Array.isArray(product.options[key])) {
          const map = {};
          optionUpdates[key].forEach((o) => { map[o.name] = o.price; });
          product.options[key] = product.options[key].map((o) => {
            const obj = o.toObject();
            return map[obj.name] != null ? { ...obj, price: Number(map[obj.name]) } : obj;
          });
        }
      }
    }

    product.markModified("variants");
    product.markModified("options");
    await product.save();

    return res.json({ ok: true, product });
  } catch (err) {
    console.error("updateProductPricing error:", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}
