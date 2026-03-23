import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs"; // Thêm để đọc file HTML
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
import newsletterRoutes from "./routes/newsletter.js";
import blogRoutes from "./routes/blog.js";
import adminBlogRoutes from "./routes/admin.blog.js";
import analyticsRouter from "./routes/analytics.js";
import mongoose from "mongoose"; // Thêm để truy vấn nhanh

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use("/api/stripe", stripeWebhookRoutes);
app.use(express.json());

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

// API Routes
app.use("/api/products", productsRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin/blogs", adminBlogRoutes);
app.use("/api/analytics", analyticsRouter);

// --- LOGIC SEO CHO 500.000 SẢN PHẨM (CHỈ CHẠY TRÊN PRODUCTION) ---
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDistPath));

  // Middleware nhồi Meta động cho Bot
  app.get(["/editor/:id", "/blog/:slug"], async (req, res) => {
    const indexPath = path.join(clientDistPath, "index.html");
    const slugOrId = req.params.id || req.params.slug;

    try {
      let html = fs.readFileSync(indexPath, "utf8");
      let metaData = { title: "Lavender Prime", image: "", desc: "Nghệ thuật cao cấp" };

      // Truy vấn nhanh từ MongoDB tùy theo loại route
      if (req.path.startsWith("/editor/")) {
        const product = await mongoose.connection.collection("products").findOne(
          { _id: new mongoose.Types.ObjectId(slugOrId) },
          { projection: { name: 1, imageUrl: 1, description: 1 } }
        );
        if (product) {
          metaData = { title: product.name, image: product.imageUrl, desc: product.description };
        }
      }

      // Nhồi vào các biến chờ đã đặt ở index.html
      html = html
        .replace(/__TITLE__/g, metaData.title)
        .replace(/__OG_TITLE__/g, metaData.title)
        .replace(/__OG_IMAGE__/g, metaData.image)
        .replace(/__DESCRIPTION__/g, metaData.desc?.substring(0, 160));

      res.send(html);
    } catch (error) {
      res.sendFile(indexPath); // Fallback nếu có lỗi
    }
  });

  // Default route cho các trang SPA khác
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
