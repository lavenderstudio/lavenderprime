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

// --- LOGIC SEO CHO 500.000 SẢN PHẨM ---
if (process.env.NODE_ENV === "production") {
    // Sửa đường dẫn để khớp với cấu trúc Monorepo trên Railway
    const clientDistPath = path.join(process.cwd(), "client/dist");
    app.use(express.static(clientDistPath));

    app.get(["/editor/:id", "/blog/:slug"], async (req, res) => {
        const indexPath = path.join(clientDistPath, "index.html");
        const slugOrId = req.params.id || req.params.slug;

        try {
            if (!fs.existsSync(indexPath)) return res.status(404).send("Build not found");

            let html = fs.readFileSync(indexPath, "utf8");
            let metaData = { title: "Lavender Prime", image: "", desc: "Bản in nghệ thuật cao cấp" };

            // 1. Lấy meta cho Sản phẩm (Editor)
            if (req.path.startsWith("/editor/") && mongoose.Types.ObjectId.isValid(slugOrId)) {
                const product = await mongoose.connection.collection("products").findOne(
                    { _id: new mongoose.Types.ObjectId(slugOrId) },
                    { projection: { name: 1, imageUrl: 1, description: 1 } }
                );
                if (product) {
                    metaData = { 
                        title: product.name + " | Lavender Prime", 
                        image: product.imageUrl, 
                        desc: product.description 
                    };
                }
            } 
            // 2. Lấy meta cho Blog (Thêm phần này để SEO blog)
            else if (req.path.startsWith("/blog/")) {
                const blog = await mongoose.connection.collection("blogs").findOne(
                    { slug: slugOrId },
                    { projection: { title: 1, coverImage: 1, excerpt: 1 } }
                );
                if (blog) {
                    metaData = { 
                        title: blog.title + " | Lavender Prime", 
                        image: blog.coverImage, 
                        desc: blog.excerpt 
                    };
                }
            }

            // Thay thế các placeholder trong index.html
            html = html
                .replace(/__TITLE__/g, metaData.title)
                .replace(/__OG_TITLE__/g, metaData.title)
                .replace(/__OG_IMAGE__/g, metaData.image || "")
                .replace(/__DESCRIPTION__/g, (metaData.desc || "").substring(0, 160))
                .replace(/__OG_DESCRIPTION__/g, (metaData.desc || "").substring(0, 160));

            res.send(html);
        } catch (error) {
            console.error("SEO Injection Error:", error);
            res.sendFile(indexPath);
        }
    });

    // Các trang khác trả về index.html mặc định
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(clientDistPath, "index.html"));
    });
}

// --- KHỞI ĐỘNG SERVER ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Database connection failed:", err);
});
