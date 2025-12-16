// server/src/routes/payments.js
import express from "express";
import { createPaymentIntent } from "../controllers/payments.controller.js";

const router = express.Router();

router.post("/create-intent", createPaymentIntent);

export default router;