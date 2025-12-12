// server/src/controllers/product.controller.js
// ----------------------------------------------------
// Product controller
// Handles business logic for product endpoints
// ----------------------------------------------------

import Product from "../models/Product.js";

/**
 * Get a single product by slug
 * GET /api/products/:slug
 */
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Fetch product from DB
    const product = await Product.findOne({ slug });

    // If not found, return 404
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return product data
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
