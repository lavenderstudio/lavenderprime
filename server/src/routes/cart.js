// server/src/routes/cart.js
// ----------------------------------------------------
// Cart routes
// ----------------------------------------------------

import express from "express";
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/items", addToCart);
router.get("/:sessionId", getCart);
router.delete("/:sessionId/items/:itemId", removeCartItem);
router.patch("/:sessionId/items/:itemId", updateCartItemQuantity);

export default router;
