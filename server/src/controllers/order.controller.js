// server/src/controllers/order.controller.js
// ----------------------------------------------------
// Checkout controller:
// - Reads cart for sessionId
// - Creates an immutable order snapshot
// - (Optional) Clears the cart
// ----------------------------------------------------

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Counter from "../models/Counter.js";

async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
}

function calcShippingFee({ country, currency }) {
  const c = String(country || "").trim().toLowerCase();
  const cur = String(currency || "AED").trim().toUpperCase();

  if (cur !== "AED") return 0;
  if (c === "united arab emirates" || c === "uae") return 50;
  return 100;
}

/**
 * ✅ Normalizes cart assets so Order always stores images correctly.
 * Supports:
 * - Single image: assets.originalUrl / assets.previewUrl
 * - Mini-frames: assets.items[] (each with { originalUrl, previewUrl, transform })
 */
function normalizeAssets(cartItem) {
  const a = cartItem?.assets || {};

  // If cart already has mini-frame style items array
  if (Array.isArray(a.items) && a.items.length > 0) {
    return {
      originalUrl: a.originalUrl || "",
      previewUrl: a.previewUrl || "",
      items: a.items.map((x) => ({
        originalUrl: x?.originalUrl || "",
        previewUrl: x?.previewUrl || "",
        transform: x?.transform || null,
      })),
    };
  }

  // Fallback: single image cart item
  return {
    originalUrl: a.originalUrl || "",
    previewUrl: a.previewUrl || "",
    items: [], // keep empty so UI can differentiate
  };
}

export const checkout = async (req, res) => {
  try {
    const { sessionId, customer, shippingAddress, shippingMethod } = req.body;

    if (!sessionId) return res.status(400).json({ message: "SessionID is Required" });

    if (!customer?.fullName) return res.status(400).json({ message: "Customer Full Name Is Required" });
    if (!customer?.email) return res.status(400).json({ message: "Customer Email Is Required" });
    if (!customer?.phone) return res.status(400).json({ message: "Customer Phone Number Is Required" });

    if (!shippingAddress?.line1) return res.status(400).json({ message: "Shipping Address Line 1 Is Required" });
    if (!shippingAddress?.city) return res.status(400).json({ message: "City Is Required" });
    if (!shippingAddress?.country) return res.status(400).json({ message: "Country Is Required" });

    const cart = await Cart.findOne({ sessionId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart Is Empty" });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.price?.total || 0), 0);
    const currency = cart.items[0]?.price?.currency || "AED";

    const shipping = calcShippingFee({
      country: shippingAddress.country,
      currency,
    });

    const tax = 0;
    const discount = 0;
    const grandTotal = subtotal + shipping + tax - discount;

    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      return res.status(400).json({ message: "Invalid Order Total" });
    }

    const nextOrderNumber = await getNextOrderNumber();

    if (!req.user?.id) {
      return res.status(401).json({ message: "Please Login To Checkout Your Order." });
    }

    const order = await Order.create({
      sessionId,
      userId: req.user.id,
      orderNumber: nextOrderNumber,
      customer,
      shippingAddress,
      shippingMethod: shippingMethod || "standard",

      // ✅ IMPORTANT: normalize assets before storing in the order snapshot
      items: cart.items.map((it) => ({
        productSlug: it.productSlug,
        variantSku: it.variantSku,
        config: it.config,
        assets: normalizeAssets(it),
        price: it.price,
      })),

      totals: {
        subtotal,
        shipping,
        tax,
        discount,
        grandTotal,
        currency,
      },

      status: "requires_payment",
    });

    // OPTIONAL: clear cart after order created
    // cart.items = [];
    // await cart.save();

    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order Not Found" });

    const isOwner = String(order.userId) === String(req.user.id);
    const isStaff = ["admin", "manager"].includes(req.user.role);

    if (!isOwner && !isStaff) return res.status(403).json({ message: "Forbidden" });

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const visibleStatuses = ["paid", "processing", "shipped", "completed"];

    const orders = await Order.find({
      userId,
      status: { $in: visibleStatuses },
    })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ count: orders.length, orders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
