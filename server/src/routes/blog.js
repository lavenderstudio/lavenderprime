// server/src/routes/blog.routes.js
import express from "express";
import { listBlogs, getBlogBySlug } from "../controllers/blog.controller.js";

const router = express.Router();

// Public
router.get("/", listBlogs);
router.get("/:slug", getBlogBySlug);

export default router;
