// client/src/pages/AdminBlogsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Admin Blogs page — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Trash2, Plus, FileText } from "lucide-react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

const ACCENT = "#FF633F";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function AdminBlogsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const res = await api.get("/admin/blogs?limit=50");
      const data = res.data;

      if (!data?.ok) throw new Error(data?.message || "Failed to load");
      setItems(data.items || []);
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    const ok = confirm("Delete this blog? This cannot be undone.");
    if (!ok) return;

    try {
      await api.delete(`/admin/blogs/${id}`);
      await load();
    } catch (e) {
      alert(e?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Dark hero ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 px-4 py-10">
        <div
          className="pointer-events-none absolute right-1/4 top-0 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div className="relative mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
              Admin Panel
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">Manage Blogs</h1>
            <p className="mt-1 text-sm text-white/40">Create, edit, and publish blog posts.</p>
          </div>

          <Link
            to="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-extrabold text-white shadow transition hover:brightness-110"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #e8472a 100%)` }}
          >
            <Plus className="h-4 w-4" /> New Blog
          </Link>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-10">

        {/* Error */}
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table card */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-5 py-3">
            {[["col-span-5", "Title"], ["col-span-2", "Status"], ["col-span-3", "Date"], ["col-span-2 text-right", "Actions"]].map(([cls, label]) => (
              <div key={label} className={`${cls} text-[10px] font-extrabold uppercase tracking-widest text-slate-400`}>
                {label}
              </div>
            ))}
          </div>

          {/* Skeleton rows */}
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid animate-pulse grid-cols-12 items-center gap-2 border-b border-slate-100 px-5 py-4 last:border-0">
              <div className="col-span-5 space-y-1.5">
                <div className="h-3 w-3/4 rounded-full bg-slate-100" />
                <div className="h-2.5 w-1/2 rounded-full bg-slate-100" />
              </div>
              <div className="col-span-2"><div className="h-5 w-16 rounded-full bg-slate-100" /></div>
              <div className="col-span-3"><div className="h-3 w-20 rounded-full bg-slate-100" /></div>
              <div className="col-span-2 flex justify-end gap-2">
                <div className="h-8 w-12 rounded-xl bg-slate-100" />
                <div className="h-8 w-12 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}

          {/* Empty */}
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-500">No blogs yet</p>
              <Link
                to="/admin/blogs/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold text-white"
                style={{ background: ACCENT }}
              >
                <Plus className="h-3.5 w-3.5" /> Create First Post
              </Link>
            </div>
          )}

          {/* Rows */}
          {!loading && items.map((b, idx) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className={`grid grid-cols-12 items-center gap-2 border-b border-slate-100 px-5 py-3.5 last:border-0 transition-colors ${
                idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
              }`}
            >
              {/* Title */}
              <div className="col-span-5 min-w-0">
                <div className="truncate text-sm font-extrabold text-slate-900">{b.title}</div>
                <div className="truncate text-xs text-slate-400">/{b.slug}</div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                    b.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-3 text-xs text-slate-500">
                {formatDate(b.publishedAt || b.createdAt)}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-2">
                <Link
                  to={`/admin/blogs/${b._id}/edit`}
                  className="flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <PenLine className="h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(b._id)}
                  className="flex h-8 items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
