// server/src/controllers/payments.controller.js
import Stripe from "stripe";
import Order from "../models/Order.js";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    // ✅ better error message than Stripe's default
    throw new Error("STRIPE_SECRET_KEY is missing. Check server/.env and dotenv config.");
  }

  return new Stripe(key);
};

export const createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe(); // ✅ created only when route is called

    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "orderId is required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const amount = Math.round(Number(order.totals.subtotal) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: (order.totals.currency || "aed").toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order._id.toString(), sessionId: order.sessionId },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
