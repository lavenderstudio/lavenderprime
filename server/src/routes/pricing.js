// server/src/routes/pricing.js
// ----------------------------------------------------
// Pricing routes
// ----------------------------------------------------

import express from "express";
import { quotePrice } from "../controllers/pricing.controller.js";

const router = express.Router();

/**
 * POST /api/pricing/quote
 */
router.post("/quote", quotePrice);

export default router;
