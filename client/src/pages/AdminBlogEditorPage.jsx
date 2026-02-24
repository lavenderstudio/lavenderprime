// client/src/pages/AdminBlogEditorPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Admin Blog Editor page — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ImagePlus, Tag, Globe, FileEdit, X, AlertCircle } from "lucide-react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { uploadToCloudinary } from "../lib/uploadToCloudinary.js";
import TiptapEditor from "../components/blog/TiptapEditor.jsx";

const ACCENT = "#FF633F";

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF633F]/60 focus:bg-white focus:ring-2 focus:ring-[#FF633F]/10";

function FieldLabel({ icon: Icon, children }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </label>
  );
}

export default function AdminBlogEditorPage({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    tagsText: "",
    status: "draft",
    coverUrl: "",
    coverPublicId: "",
  });

  // ── Load existing blog if edit ─────────────────────────────────────────────
  useEffect(() => {
    let alive = true;

    async function load() {
      if (!isEdit) return;

      try {
        setLoading(true);
        setErr("");

        const res = await api.get("/admin/blogs?limit=100");
        const items = res.data?.items || [];
        const found = items.find((x) => x._id === id);

        if (!found) throw new Error("Blog not found");
        if (!alive) return;

        setForm({
          title: found.title || "",
          excerpt: found.excerpt || "",
          content: found.content || "",
          tagsText: Array.isArray(found.tags) ? found.tags.join(", ") : "",
          status: found.status || "draft",
          coverUrl: found.coverImage?.url || "",
          coverPublicId: found.coverImage?.publicId || "",
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [id, isEdit]);

  const tagsArray = useMemo(() => {
    return form.tagsText.split(",").map((t) => t.trim()).filter(Boolean);
  }, [form.tagsText]);

  const onSave = async () => {
    try {
      setSaving(true);
      setErr("");

      if (!form.title.trim()) throw new Error("Title is required");
      if (!form.content.trim()) throw new Error("Content is required");

      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        tags: tagsArray,
        status: form.status,
        coverImage: {
          url: form.coverUrl,
          publicId: form.coverPublicId,
        },
      };

      if (isEdit) {
        const res = await api.patch(`/admin/blogs/${id}`, payload);
        if (!res.data?.ok) throw new Error(res.data?.message || "Update failed");
      } else {
        const res = await api.post("/admin/blogs", payload);
        if (!res.data?.ok) throw new Error(res.data?.message || "Create failed");
      }

      navigate("/admin/blogs");
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      setErr("");

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      const uploaded = await uploadToCloudinary(file, "blog-covers");

      setForm((f) => ({
        ...f,
        coverUrl: uploaded.url,
        coverPublicId: uploaded.publicId,
      }));
    } catch (error) {
      setErr(error.message || "Image upload failed");
    } finally {
      setUploadingCover(false);
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
        <div className="relative mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
              Admin Panel
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">
              {isEdit ? "Edit Blog Post" : "New Blog Post"}
            </h1>
            <p className="mt-1 text-sm text-white/40">
              Only Admin / Manager can publish.
            </p>
          </div>

          <Link
            to="/admin/blogs"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blogs
          </Link>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Error */}
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {err}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-3xl border border-slate-100 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">

            {/* ── Left: editor ──────────────────────────────────────── */}
            <div className="space-y-5 lg:col-span-2">

              {/* Title + Excerpt */}
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div>
                  <FieldLabel icon={FileEdit}>Title</FieldLabel>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className={INPUT}
                    placeholder="e.g. How to choose the perfect frame"
                  />
                </div>

                <div className="mt-4">
                  <FieldLabel>Excerpt</FieldLabel>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    className={INPUT}
                    rows={3}
                    placeholder="Short summary shown on the blog list…"
                  />
                </div>
              </div>

              {/* Content editor */}
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <FieldLabel>Content</FieldLabel>
                <div className="mt-1.5 overflow-hidden rounded-xl border border-slate-200">
                  <TiptapEditor
                    value={form.content}
                    onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                    placeholder="Write your blog post…"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Tip: use H2/H3 headings, bullet lists, and short paragraphs for readability.
                </p>
              </div>
            </div>

            {/* ── Right: sidebar ────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Status + tags */}
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div>
                  <FieldLabel icon={Globe}>Status</FieldLabel>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className={INPUT}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        form.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <FieldLabel icon={Tag}>Tags (comma separated)</FieldLabel>
                  <input
                    value={form.tagsText}
                    onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))}
                    className={INPUT}
                    placeholder="frames, printing, tips"
                  />
                  {tagsArray.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tagsArray.map((t) => (
                        <span
                          key={t}
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                          style={{ background: `${ACCENT}18`, color: ACCENT }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cover image */}
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <FieldLabel icon={ImagePlus}>Cover Image</FieldLabel>

                {!form.coverUrl ? (
                  <label
                    className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-[#FF633F]/40 hover:bg-slate-100 ${
                      uploadingCover ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    <ImagePlus className="h-7 w-7 text-slate-300" />
                    <span className="text-xs font-semibold text-slate-500">
                      {uploadingCover ? "Uploading…" : "Click to upload cover image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onCoverUpload}
                      disabled={uploadingCover}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-slate-100">
                    <img
                      src={form.coverUrl}
                      alt="Cover preview"
                      className="h-44 w-full object-cover"
                    />
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2">
                      <span className="text-xs font-semibold text-slate-500">Cover uploaded</span>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, coverUrl: "", coverPublicId: "" }))}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}

                {uploadingCover && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF633F]" />
                    Uploading image…
                  </div>
                )}

                {/* Hidden publicId field */}
                <div className="mt-4">
                  <FieldLabel>Cover Public ID (optional)</FieldLabel>
                  <input
                    value={form.coverPublicId}
                    onChange={(e) => setForm((f) => ({ ...f, coverPublicId: e.target.value }))}
                    className={INPUT}
                    placeholder="user-uploads/xxxx"
                  />
                </div>
              </div>

              {/* Save button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #e8472a 100%)` }}
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </>
                ) : isEdit ? "Update Blog" : "Publish Blog"}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
