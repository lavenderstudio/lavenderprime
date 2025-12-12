import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productsRouter from "./routes/products.js";
import pricingRouter from "./routes/pricing.js";
import uploadsRouter from "./routes/uploads.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/order.js";
import path from "path";

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve uploaded files (local) so the browser can access them
app.use(
  "/uploads",
  cors({
    origin: "http://localhost:5173",
  }),
  express.static(path.join(process.cwd(), "uploads"))
);

// CORS: for dev, allow your React app to call the API
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running ✅" });
});

app.use("/api/products", productsRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);

// Start server only after DB is connected
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
