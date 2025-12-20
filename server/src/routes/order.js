// server/src/routes/orders.js
// ----------------------------------------------------
// Order routes
// ----------------------------------------------------

import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { checkout, getMyOrders, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/checkout", requireAuth, checkout);
router.get("/my", requireAuth, getMyOrders);
router.get("/:id", requireAuth, getOrderById);

export default router;
