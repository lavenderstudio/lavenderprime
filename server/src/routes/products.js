// server/src/routes/products.js
// ----------------------------------------------------
// Product routes
// Delegates logic to controllers
// ----------------------------------------------------

import express from "express";
import { getProductBySlug } from "../controllers/product.controller.js";

const router = express.Router();

/**
 * GET /api/products/:slug
 */
router.get("/:slug", getProductBySlug);

export default router;
