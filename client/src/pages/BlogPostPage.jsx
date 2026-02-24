// client/src/pages/BlogPostPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Blog Post page — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, BookOpen, Clock } from "lucide-react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

const ACCENT = "#FF633F";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return "";
  }
}

function readingTime(html = "") {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4 pt-8">
      <div className="h-6 w-1/3 rounded-full bg-slate-200" />
      <div className="h-10 w-2/3 rounded-full bg-slate-200" />
      <div className="h-4 w-1/4 rounded-full bg-slate-200" />
      <div className="mt-8 h-64 rounded-2xl bg-slate-200" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BlogPostPage() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const res = await api.get(`/blogs/${slug}`);
        const data = res.data;

        if (!data?.ok) throw new Error(data?.message || "Blog not found");
        if (!alive) return;
        setBlog(data.blog);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Something went wrong");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Hero / cover area ─────────────────────────────────────── */}
      {!loading && blog ? (
        <div className="relative overflow-hidden bg-slate-950">
          {/* Cover image */}
          {blog.coverImage?.url ? (
            <div className="absolute inset-0">
              <img
                src={blog.coverImage.url}
                alt={blog.title}
                className="h-full w-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-linear-to-b from-slate-950/60 via-slate-950/70 to-slate-950" />
            </div>
          ) : (
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
              style={{ background: ACCENT }}
            />
          )}

          <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-12">
            {/* Back link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
            </Link>

            {/* Tags */}
            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {blog.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: `${ACCENT}33`, color: ACCENT }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl"
            >
              {blog.title}
            </motion.h1>

            {blog.excerpt && (
              <p className="mt-3 max-w-2xl text-base text-white/60">{blog.excerpt}</p>
            )}

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {blog.author?.fullName || "Team"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {readingTime(blog.content)} min read
              </span>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="relative overflow-hidden bg-slate-950 px-4 py-12">
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
              style={{ background: ACCENT }}
            />
          </div>
        )
      )}

      {/* ── Content area ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-10">

        {/* Error */}
        {err && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {err}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <Skeleton />}

        {/* Article content */}
        {!loading && blog && (
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="p-6 sm:p-10">
              {/* Prose body */}
              <div
                className="prose prose-slate prose-headings:font-extrabold prose-a:text-[#FF633F] prose-a:no-underline hover:prose-a:underline max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Footer */}
            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-4 sm:px-10">
                {blog.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{ background: `${ACCENT}15`, color: ACCENT }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </motion.article>
        )}

        {/* Back CTA */}
        {!loading && (
          <div className="mt-10 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <BookOpen className="h-4 w-4" /> More Articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
