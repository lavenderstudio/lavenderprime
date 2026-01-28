// server/src/models/Blog.js
// ----------------------------------------------------
// Blog model:
// - slug is used in URLs (/blog/my-post)
// - status controls visibility (draft vs published)
// - author stores which user created it
// ----------------------------------------------------

import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, index: true },

    excerpt: { type: String, trim: true, maxlength: 260 }, // short summary
    content: { type: String, required: true }, // store HTML or markdown

    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    tags: [{ type: String, trim: true }],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", BlogSchema);
