// server/src/routes/orders.js
// ----------------------------------------------------
// Order routes
// ----------------------------------------------------

import express from "express";
import { checkout, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/checkout", checkout);
router.get("/:id", getOrderById);

export default router;
