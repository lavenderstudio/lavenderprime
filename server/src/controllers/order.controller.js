// server/src/controllers/order.controller.js
// ----------------------------------------------------
// Checkout controller:
// - Reads cart for sessionId
// - Creates an immutable order snapshot
// - Clears the cart
// ----------------------------------------------------

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

/**
 * POST /api/orders/checkout
 * Body: { sessionId, customer, shippingAddress }
 */
export const checkout = async (req, res) => {
  try {
    const { sessionId, customer, shippingAddress } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    // Basic customer validation
    if (!customer?.fullName || !customer?.email) {
      return res.status(400).json({ message: "customer.fullName and customer.email are required" });
    }

    // Basic address validation
    if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.postcode || !shippingAddress?.country) {
      return res.status(400).json({ message: "shippingAddress line1, city, postcode, country are required" });
    }

    // Get cart
    const cart = await Cart.findOne({ sessionId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate subtotal from snapshot totals (do NOT recalc from product DB)
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price?.total || 0), 0);
    const currency = cart.items[0]?.price?.currency || "AED";

    // Create order snapshot
    const order = await Order.create({
      sessionId,
      customer,
      shippingAddress,
      items: cart.items.map((it) => ({
        productSlug: it.productSlug,
        variantSku: it.variantSku,
        config: it.config,
        assets: it.assets,
        price: it.price,
      })),
      totals: { subtotal, currency },
      status: "pending",
    });

    // Clear cart after successful order creation
    cart.items = [];
    await cart.save();

    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/orders/:id
 * Fetch order by id
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
