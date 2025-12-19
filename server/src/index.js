import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import productsRouter from "./routes/products.js";
import pricingRouter from "./routes/pricing.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/order.js";
import paymentsRouter from "./routes/payments.js";
import stripeWebhookRoutes from "./routes/stripeWebhook.js";
import adminRouter from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";


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

app.use(cookieParser());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running ✅" });
});

app.use("/api/products", productsRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

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
