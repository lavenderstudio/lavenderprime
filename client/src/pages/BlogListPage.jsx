/* eslint-disable no-unused-vars */
// client/src/pages/BlogListPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Blog List Page — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Settings, ArrowRight, BookOpen, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ACCENT = "#FF633F";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

// ─── Blog card ────────────────────────────────────────────────────────────────
function BlogCard({ blog, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/blog/${blog.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
      >
        {/* Cover image */}
        <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
          {blog.coverImage?.url ? (
            <img
              src={blog.coverImage.url}
              alt={blog.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-slate-300" />
            </div>
          )}
          {/* Date chip */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 backdrop-blur-sm">
              <Calendar className="h-3 w-3" />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          {/* Author pill */}
          <span className="inline-flex w-fit items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {blog.author?.fullName || "Team"}
          </span>

          <h3 className="mt-3 line-clamp-2 text-base font-extrabold leading-snug text-slate-900 transition group-hover:text-[#FF633F]">
            {blog.title}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
            {blog.excerpt || "Read more…"}
          </p>

          {/* Tags */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {blog.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                  style={{ background: `${ACCENT}22`, color: ACCENT }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Read more */}
          <div className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold" style={{ color: ACCENT }}>
            Read article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="aspect-16/10 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 rounded-full bg-slate-100" />
        <div className="h-4 w-3/4 rounded-full bg-slate-100" />
        <div className="h-3 w-full rounded-full bg-slate-100" />
        <div className="h-3 w-2/3 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function BlogListPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { user: me } = useAuth();
  const isStaff = !!me && ["admin", "manager"].includes(me.role);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  const limit = 9;

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "published");
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (q.trim()) params.set("q", q.trim());
    return params.toString();
  }, [page, q]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const res = await api.get(`/blogs?${queryParams}`);
        const data = res.data;

        if (!data?.ok) throw new Error(data?.message || "Failed to load blogs");
        if (!alive) return;

        setItems(data.items || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Something went wrong");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [queryParams]);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Dark hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div className="relative mx-auto max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: ACCENT }}
          >
            Golden Art Frames
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-4xl font-extrabold text-white"
          >
            Blog &amp; Guides
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
            className="mt-2 text-sm text-white/50"
          >
            Tips, inspiration, and product guides from the Golden Art Frames team
          </motion.p>
        </div>
      </section>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-56">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search posts…"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF633F]/60 focus:ring-2 focus:ring-[#FF633F]/10"
            />
          </div>

          {/* Total count */}
          {!loading && (
            <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500">
              {pagination.total} post{pagination.total !== 1 ? "s" : ""}
            </span>
          )}

          {/* Admin link */}
          {isStaff && (
            <button
              onClick={() => navigate("/admin/blogs")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Settings className="h-4 w-4" /> Admin
            </button>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 pb-16">

        {err && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {err}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !err && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white py-20 text-center shadow-sm">
            <BookOpen className="h-10 w-10 text-slate-300" />
            <p className="mt-4 text-base font-extrabold text-slate-800">No posts found</p>
            <p className="mt-1 text-sm text-slate-500">
              {q ? `No results for "${q}"` : "Check back soon for new articles."}
            </p>
            {q && (
              <button
                onClick={() => setQ("")}
                className="mt-4 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
                style={{ background: ACCENT }}
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && items.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((b, i) => <BlogCard key={b._id} blog={b} index={i} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700">
              {pagination.page} / {pagination.pages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={pagination.page >= pagination.pages}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
