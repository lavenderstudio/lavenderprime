import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { sendOrderConfirmation, sendOwnerOrderAlert } from "../utils/brevoMailer.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error("STRIPE_SECRET_KEY missing (dotenv not loaded)");

      const stripe = new Stripe(key);

      const sig = req.headers["stripe-signature"];
      if (!sig) return res.status(400).send("Webhook Error: Missing stripe-signature header");

      const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!whSecret) throw new Error("STRIPE_WEBHOOK_SECRET missing in .env");

      const event = stripe.webhooks.constructEvent(req.body, sig, whSecret);

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          const order = await Order.findById(orderId);

          if (order && order.status !== "paid") {
            order.status = "paid";
            order.paidAt = new Date();
            order.stripe = {
              ...(order.stripe || {}),
              paymentIntentId: paymentIntent.id,
              status: paymentIntent.status,
              currency: paymentIntent.currency,
              // paymentIntent.amount is in smallest unit
              amount: paymentIntent.amount,
            };

            await order.save();

            // 1. Customer confirmation — send once per order
            if (!order.email?.confirmationSent) {
              try {
                await sendOrderConfirmation(order);
                order.email.confirmationSent = true;
                order.email.confirmationSentAt = new Date();
                await order.save();
              } catch (err) {
                console.error("[brevo] customer confirmation failed:", err.response?.data || err.message);
              }
            }

            // 2. Owner alert — always fires when payment first confirmed
            //    (safe: outer guard already checks order.status !== "paid")
            sendOwnerOrderAlert(order).catch((err) =>
              console.error("[ownerAlert] email failed:", err.message)
            );

            await Cart.updateOne(
              { sessionId: order.sessionId },
              { $set: { items: [] } }
            );
          }
        }
      }

      return res.json({ received: true });
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
