// server/src/controllers/admin.controller.js
// ----------------------------------------------------
// Admin controllers (owner-only)
// - listOrders: supports status + optional date range filters
// - fulfillOrder: marks eligible order as completed
// ----------------------------------------------------

import Order from "../models/Order.js";

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
