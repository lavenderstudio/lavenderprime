// server/src/routes/admin.js
// ----------------------------------------------------
// Admin routes (owner-only)
// ----------------------------------------------------

import express from "express";
import Order from "../models/Order.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

/**
 * GET /api/admin/orders?status=paid
 * Default: paid only
 */
router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || "paid";

    // ✅ Only return orders with desired status (default paid)
    const orders = await Order.find({ status })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ count: orders.length, orders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/orders/:id/fulfill", requireAdmin, async (req, res) => {
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
    order.deliveredAt = new Date(); // or fulfilledAt if you want separate field

    await order.save();

    return res.json({
      message: "Order marked as fulfilled",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
