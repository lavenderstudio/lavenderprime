// server/src/controllers/admin.controller.js
// ----------------------------------------------------
// Admin controllers (owner-only)
// - listOrders: supports status + optional date range filters
// - fulfillOrder: marks eligible order as completed
// ----------------------------------------------------

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import PageView from "../models/PageView.js";

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

/**
 * GET /api/admin/analytics
 * Admin-only: returns aggregated stats for the dashboard.
 */
export async function getAnalytics(req, res) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ── Run all aggregations in parallel ─────────────────────────────────────
    const [
      revenuePaid,
      ordersByStatus,
      dailyOrders,
      topProducts,
      totalUsers,
      trafficBySource,
      dailyVisits,
      topPages,
    ] = await Promise.all([
      // 1. Total revenue (paid + completed orders)
      Order.aggregate([
        { $match: { status: { $in: ["paid", "completed"] } } },
        { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
      ]),

      // 2. Order count per status
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 3. Daily orders for last 30 days
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: "requires_payment" } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            revenue: { $sum: "$totals.grandTotal" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 4. Top products by item count
      Order.aggregate([
        { $match: { status: { $in: ["paid", "completed"] } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.productSlug", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // 5. Total users
      User.countDocuments(),

      // 6. Traffic by source (last 30 days)
      PageView.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$source", visits: { $sum: 1 } } },
        { $sort: { visits: -1 } },
        { $limit: 8 },
      ]),

      // 7. Daily visits for last 30 days
      PageView.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            visits: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 8. Top pages by view count
      PageView.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$path", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return res.json({
      ok: true,
      totalRevenue: revenuePaid[0]?.total ?? 0,
      ordersByStatus,
      dailyOrders,
      topProducts,
      totalUsers,
      trafficBySource,
      dailyVisits,
      topPages,
    });
  } catch (err) {
    console.error("getAnalytics error:", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}
