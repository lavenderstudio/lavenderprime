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

// Debug email route
app.get("/api/debug-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: "fazeelk2004@gmail.com",
      subject: "Brevo SMTP test",
      html: "<b>Email works 🎉</b>",
    });

    res.json({ ok: true, info });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ error: err.message });
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
