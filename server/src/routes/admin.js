// server/src/routes/admin.routes.js
// ----------------------------------------------------
// Admin routes (owner-only)
// ----------------------------------------------------

import express from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { listOrders, fulfillOrder } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/orders", requireAuth, requireRole("admin", "manager"), listOrders);

router.patch("/orders/:id/fulfill", requireAuth, requireRole("admin", "manager"), fulfillOrder);

export default router;
