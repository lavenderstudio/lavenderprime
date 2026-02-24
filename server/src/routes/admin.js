// server/src/routes/admin.routes.js
// ----------------------------------------------------
// Admin routes (owner-only)
// ----------------------------------------------------

import express from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { listOrders, fulfillOrder, listProducts, updateProductPricing } from "../controllers/admin.controller.js";
import { listUsers, updateUserRole } from "../controllers/admin.users.controller.js";

const router = express.Router();

router.get("/orders", requireAuth, requireRole("admin", "manager"), listOrders);

router.patch("/orders/:id/fulfill", requireAuth, requireRole("admin", "manager"), fulfillOrder);

router.get("/users", requireAuth, requireRole("admin", "manager"), listUsers);

router.patch("/users/:id/role", requireAuth, requireRole("admin"), updateUserRole);

// Product pricing
router.get("/products", requireAuth, requireRole("admin", "manager"), listProducts);
router.patch("/products/:slug", requireAuth, requireRole("admin"), updateProductPricing);

export default router;
