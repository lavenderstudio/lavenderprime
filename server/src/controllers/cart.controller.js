// server/src/controllers/cart.controller.js
// ----------------------------------------------------
// Cart controller (guest cart for MVP)
// ----------------------------------------------------

import Cart from "../models/Cart.js";

/**
 * POST /api/cart/items
 * Adds an item to the cart (creates cart if not exists)
 */
export const addToCart = async (req, res) => {
  try {
    const { sessionId, item } = req.body;

    if (!sessionId || !item) {
      return res.status(400).json({ message: "SessionID And Item Are Required" });
    }

    let cart = await Cart.findOne({ sessionId });

    if (!cart) {
      cart = await Cart.create({ sessionId, items: [item] });
    } else {
      cart.items.push(item);
      await cart.save();
    }

    return res.status(201).json(cart);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/cart/:sessionId
 * Fetch cart for a session
 */
export const getCart = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const cart = await Cart.findOne({ sessionId });

    return res.json(cart || { sessionId, items: [] });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



/**
 * DELETE /api/cart/:sessionId/items/:itemId
 * Removes a cart item by its MongoDB _id
 */
export const removeCartItem = async (req, res) => {
  try {
    const { sessionId, itemId } = req.params;

    const cart = await Cart.findOne({ sessionId });
    if (!cart) return res.status(404).json({ message: "Cart Not Found" });

    // Filter out the item
    cart.items = cart.items.filter((it) => it._id.toString() !== itemId);
    await cart.save();

    return res.json(cart);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/cart/:sessionId/items/:itemId
 * Updates quantity for a cart item
 * Body: { quantity: number }
 */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { sessionId, itemId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ message: "Quantity Must Be A Number >= 1" });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) return res.status(404).json({ message: "Cart Not Found" });
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item Not Found" });
    
    item.quantity = qty;
    item.price.total = item.price.unit * qty;

    await cart.save();

    return res.json(cart);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};