// server/src/controllers/cart.controller.js
// ----------------------------------------------------
// Cart controller (guest cart for MVP)
// - ✅ Supports personalized products via item.personalization
// - ✅ Validates personalization keys/required fields against Product config
// ----------------------------------------------------

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ------------------------------
// Helpers
// ------------------------------

/**
 * Remove empty strings + undefined values from an object.
 * Keeps only meaningful personalization fields.
 */
function cleanObject(obj) {
  if (!obj || typeof obj !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const val = typeof v === "string" ? v.trim() : v;
    if (val === "" || val === undefined || val === null) continue;
    out[k] = val;
  }
  return out;
}

/**
 * Validate personalization payload against Product.personalizationConfig
 * - Only allow keys that exist in config.fields
 * - Enforce required fields
 * - Enforce maxLength/minLength (basic)
 */
function validatePersonalizationAgainstProduct(product, personalizationRaw) {
  const cfg = product?.personalizationConfig;

  // If personalization is not enabled for this product, ignore it
  if (!cfg?.enabled) {
    return { ok: true, sanitized: {} };
  }

  const fields = Array.isArray(cfg.fields) ? cfg.fields : [];
  const allowedKeys = new Map(fields.map((f) => [f.key, f]));
  const personalization = cleanObject(personalizationRaw);

  // Reject unknown keys (prevents random payload injection)
  for (const key of Object.keys(personalization)) {
    if (!allowedKeys.has(key)) {
      return { ok: false, message: `Unknown personalisation field: ${key}` };
    }
  }

  // Enforce required + length rules
  for (const f of fields) {
    const val = personalization[f.key];
    const strVal = val !== undefined ? String(val).trim() : "";

    if (f.required && !strVal) {
      return { ok: false, message: `Missing required personalisation: ${f.label}` };
    }

    if (strVal) {
      const minL = Number(f.minLength ?? 0);
      const maxL = Number(f.maxLength ?? 9999);

      if (minL && strVal.length < minL) {
        return { ok: false, message: `${f.label} must be at least ${minL} characters.` };
      }
      if (maxL && strVal.length > maxL) {
        return { ok: false, message: `${f.label} must be under ${maxL} characters.` };
      }
    }
  }

  return { ok: true, sanitized: personalization };
}

/**
 * Basic structure validation for item (keeps controller safe)
 */
function validateCartItemShape(item) {
  if (!item || typeof item !== "object") return "Item must be an object.";
  if (!item.productSlug) return "Item.productSlug is required.";
  if (!item.variantSku) return "Item.variantSku is required.";
  if (!item.price || typeof item.price !== "object") return "Item.price is required.";
  if (!Number.isFinite(Number(item.price.unit))) return "Item.price.unit must be a number.";
  if (!Number.isFinite(Number(item.price.total))) return "Item.price.total must be a number.";
  return null;
}

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

    // Basic shape validation
    const shapeErr = validateCartItemShape(item);
    if (shapeErr) return res.status(400).json({ message: shapeErr });

    // Load product so we can validate personalization keys/required fields
    const product = await Product.findOne({ slug: item.productSlug });
    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.productSlug}` });
    }

    // ✅ Validate + sanitize personalization (if enabled)
    const pv = validatePersonalizationAgainstProduct(product, item.personalization);

    if (!pv.ok) {
      return res.status(400).json({ message: pv.message });
    }

    // Write sanitized personalization back onto item
    // If product doesn't use personalization, this becomes {}
    item.personalization = pv.sanitized;

    // Ensure quantity is sane
    const qty = Number(item.quantity ?? 1);
    item.quantity = Number.isFinite(qty) && qty >= 1 ? qty : 1;

    // Ensure totals are correct (trust unit, compute total)
    item.price.unit = Number(item.price.unit);
    item.price.total = item.price.unit * item.quantity;

    // Save to cart
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
