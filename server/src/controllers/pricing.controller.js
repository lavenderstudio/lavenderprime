// server/src/controllers/pricing.controller.js
// ----------------------------------------------------
// Pricing controller
// Server-side pricing is the "source of truth".
// Calculates a quote for a selected variant + add-ons + quantity.
// ----------------------------------------------------

import Product from "../models/Product.js";

/**
 * POST /api/pricing/quote
 * Body:
 *  - productSlug (string)
 *  - variantSku (string)
 *  - options (object)  -> e.g. { mount: "White Mount" }
 *  - quantity (number)
 *
 * Returns:
 *  - unit (number)
 *  - total (number)
 *  - currency (string)
 */
export const quotePrice = async (req, res) => {
  try {
    const { productSlug, variantSku, options = {}, quantity = 1 } = req.body;

    // Basic validation
    if (!productSlug || !variantSku) {
      return res.status(400).json({ message: "productSlug and variantSku are required" });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity must be a number >= 1" });
    }

    // Fetch product
    const product = await Product.findOne({ slug: productSlug });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find variant
    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      return res.status(400).json({ message: "Variant not found for this product" });
    }

    // Start from base variant price
    let unit = variant.basePrice;

    // Add-on: mount (optional)
    // We seeded mounts in Step 2: "No Mount", "White Mount"
    if (options.mount) {
      const mount = product.options?.mounts?.find((m) => m.name === options.mount);
      if (!mount) {
        return res.status(400).json({ message: "Invalid mount option" });
      }
      unit += mount.price;
    }

    // Total
    const total = unit * qty;

    return res.json({
      unit,
      total,
      currency: "AED", // change later if needed
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
