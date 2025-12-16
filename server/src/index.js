import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productsRouter from "./routes/products.js";
import pricingRouter from "./routes/pricing.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/order.js";
import paymentsRouter from "./routes/payments.js";
import stripeWebhookRoutes from "./routes/stripeWebhook.js";
import adminRouter from "./routes/admin.js";
import path from "path";
import nodemailer from "nodemailer";


dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use("/api/stripe", stripeWebhookRoutes);

// Middleware to parse JSON bodies
app.use(express.json());

// CORS: for dev, allow your React app to call the API
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running ✅" });
});

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

app.get("/api/debug-email", async (req, res) => {
  try {
    console.log("DEBUG EMAIL: start");

    // ✅ sanity (don’t log secrets)
    console.log("SMTP_HOST present?", !!process.env.SMTP_HOST);
    console.log("SMTP_PORT present?", !!process.env.SMTP_PORT);
    console.log("SMTP_USER present?", !!process.env.SMTP_USER);
    console.log("SMTP_PASS present?", !!process.env.SMTP_PASS);
    console.log("FROM_EMAIL present?", !!process.env.FROM_EMAIL);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // 587 STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      // ✅ hard timeouts so it never hangs
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,

      // ✅ sometimes helps on hosted envs
      tls: {
        minVersion: "TLSv1.2",
      },
    });

    console.log("DEBUG EMAIL: verifying transport...");
    await withTimeout(transporter.verify(), 10_000, "SMTP verify");

    console.log("DEBUG EMAIL: sending...");
    const info = await withTimeout(
      transporter.sendMail({
        from: process.env.FROM_EMAIL, // must match Brevo verified sender
        to: "fazeelk2004@gmail.com",
        subject: "Brevo SMTP test (Render)",
        html: "<b>Email works 🎉</b>",
      }),
      10_000,
      "SMTP sendMail"
    );

    console.log("DEBUG EMAIL: sent", info.messageId);
    return res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("DEBUG EMAIL ERROR:", err);
    return res.status(500).json({
      ok: false,
      error: err.message,
      code: err.code || null,
      response: err.response || null,
    });
  }
});


app.use("/api/products", productsRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);

// Start server only after DB is connected
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
