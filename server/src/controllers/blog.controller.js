// server/src/controllers/blog.controller.js
// ----------------------------------------------------
// Blog CRUD:
// - Anyone can read published blogs
// - Admin/Manager can create/update/delete
// - publish sets publishedAt
// ----------------------------------------------------

import Blog from "../models/Blog.js";
import { slugify } from "../utils/slugify.js";

// GET /api/blogs?status=published&q=...&tag=...&page=1&limit=10
export async function listBlogs(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const status = req.query.status || "published"; // default: public view
    const q = String(req.query.q || "").trim();
    const tag = String(req.query.tag || "").trim();

    const filter = {};
    if (status) filter.status = status;

    if (tag) filter.tags = tag;

    if (q) {
      // Simple title/excerpt search
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Blog.find(filter)
        .populate("author", "fullName email role")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("listBlogs error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}

// GET /api/blogs/:slug  (public: published only)
export async function getBlogBySlug(req, res) {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: "published" }).populate(
      "author",
      "fullName email role"
    );

    if (!blog) return res.status(404).json({ ok: false, message: "Blog not found" });

    return res.json({ ok: true, blog });
  } catch (err) {
    console.error("getBlogBySlug error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}

// POST /api/admin/blogs
export async function createBlog(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ ok: false, message: "Not authenticated" });
    }

    const {
      title,
      excerpt = "",
      content,
      tags = [],
      status = "draft",
      coverImage,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        ok: false,
        message: "title and content are required",
      });
    }

    // slug logic (unchanged)
    let base = slugify(title);
    let slug = base;
    let i = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${base}-${i++}`;
    }

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      tags,
      status,
      coverImage: coverImage || { url: "", publicId: "" },

      // ✅ FIX HERE
      author: req.user.id,

      publishedAt: status === "published" ? new Date() : null,
    });

    return res.status(201).json({ ok: true, blog });
  } catch (err) {
    console.error("createBlog error:", err);
    return res.status(500).json({
      ok: false,
      message: err.message || "Server error",
    });
  }
}



// PATCH /api/admin/blogs/:id
export async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { title, excerpt, content, tags, status, coverImage } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ ok: false, message: "Blog not found" });

    if (title && title !== blog.title) {
      blog.title = title;

      // If title changes, update slug too (optional)
      let base = slugify(title);
      let slug = base;
      let i = 1;

      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        slug = `${base}-${i++}`;
      }
      blog.slug = slug;
    }

    if (typeof excerpt === "string") blog.excerpt = excerpt;
    if (typeof content === "string") blog.content = content;
    if (Array.isArray(tags)) blog.tags = tags;
    if (coverImage) blog.coverImage = coverImage;

    if (status && ["draft", "published"].includes(status)) {
      blog.status = status;

      // publish timestamp logic
      if (status === "published" && !blog.publishedAt) blog.publishedAt = new Date();
      if (status === "draft") blog.publishedAt = null;
    }

    await blog.save();

    return res.json({ ok: true, blog });
  } catch (err) {
    console.error("updateBlog error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}

// DELETE /api/admin/blogs/:id
export async function deleteBlog(req, res) {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return res.status(404).json({ ok: false, message: "Blog not found" });

    return res.json({ ok: true, message: "Blog deleted" });
  } catch (err) {
    console.error("deleteBlog error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}
