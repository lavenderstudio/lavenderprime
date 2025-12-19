// server/src/routes/admin.routes.js
// ----------------------------------------------------
// Admin routes (owner-only)
// ----------------------------------------------------

import express from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { listOrders, fulfillOrder } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/orders", requireAdmin, listOrders);

router.patch("/orders/:id/fulfill", requireAdmin, fulfillOrder);

export default router;
