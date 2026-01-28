// server/src/routes/admin.blog.routes.js
import express from "express";
import { createBlog, updateBlog, deleteBlog, listBlogs } from "../controllers/blog.controller.js";
import { requireAuth } from "../middleware/requireAuth.js"; // your existing JWT middleware
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Admin/Manager only
router.use(requireAuth);
router.use(requireRole(["admin", "manager"]));

// Admin list can see drafts too
router.get("/", (req, res) => {
  req.query.status = req.query.status || ""; // allow status filter; empty means all
  return listBlogs(req, res);
});

router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "admin blog routes working" });
});

router.post("/", createBlog);
router.patch("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
