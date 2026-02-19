// client/src/components/home/BlogPreview.jsx
// ----------------------------------------------------
// Blog preview section
// - Fetches the 3 latest published posts from the API
// - Responsive cards + subtle hover (same design preserved)
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container, ACCENT } from "./ui.jsx";
import { FadeUp, Stagger, item } from "../motion/MotionWrappers.jsx";
import { motion } from "framer-motion";
import api from "../../lib/api.js";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(blog) {
  const d = blog.publishedAt || blog.createdAt;
  if (!d) return "";
  const date = new Date(d);
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const tag = blog.tags?.[0] || "Article";
  return `${month} ${year} • ${tag}`;
}

// ── Card ───────────────────────────────────────────────────────────────────────
function BlogCard({ title, date, excerpt, imageUrl, href }) {
  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-2xl border bg-white shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5"
    >
      <div className="aspect-16/10 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-slate-100 to-slate-200" />
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold text-slate-500">{date}</p>
        <p className="mt-1 text-base font-extrabold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{excerpt}</p>
      </div>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)] animate-pulse">
      <div className="aspect-16/10 bg-slate-200" />
      <div className="p-5 space-y-2">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export default function BlogPreview() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/blogs", { params: { status: "published", limit: 3 } })
      .then((res) => {
        if (!cancelled) setBlogs(res.data?.items || []);
      })
      .catch(() => {
        /* silently ignore — section just won't show */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Hide section entirely if there are no published blogs and we're done loading
  if (!loading && blogs.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <FadeUp>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>Blog</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Tips, guides &amp; delivery updates
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Quick reads to help you pick sizes, finishes and framing styles.
              </p>
            </div>
            {!loading && blogs.length > 0 && (
              <Link
                to="/blog"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#FF633F] hover:underline shrink-0"
              >
                View all posts <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </FadeUp>

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : (
          <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
            {blogs.map((b) => (
              <motion.div key={b._id} variants={item}>
                <BlogCard
                  title={b.title}
                  date={formatDate(b)}
                  excerpt={b.excerpt || ""}
                  imageUrl={b.coverImage?.url || ""}
                  href={`/blog/${b.slug}`}
                />
              </motion.div>
            ))}
          </Stagger>
        )}
      </Container>
    </section>
  );
}

