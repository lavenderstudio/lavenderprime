/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ImagePlus, Tag, Globe, FileEdit, X, AlertCircle, Save, Fingerprint, Layers } from "lucide-react";
import api from "../lib/api.js";
import { uploadToCloudinary } from "../lib/uploadToCloudinary.js";
import TiptapEditor from "../components/blog/TiptapEditor.jsx";

const ACCENT = "#FF633F";

// ─── Studio Styling System ──────────────────────────────────────────────────
const INPUT_STYLE = 
  "w-full border-b border-slate-200 bg-transparent py-6 text-lg font-medium text-slate-900 " +
  "transition-all duration-500 focus:border-[#FF633F] outline-none " +
  "placeholder:text-slate-200 placeholder:font-light italic";

const SIDE_CARD = "border border-slate-100 bg-white p-8 shadow-[20px_20px_60px_#f0f0f0] transition-all hover:shadow-none hover:border-slate-200";

// ─── Field Label Component (Museum Style) ───────────────────────────────────
function FieldLabel({ icon: Icon, children, number }) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-slate-900 pb-2">
      <label className="flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.3em] text-black">
        {Icon && <Icon className="h-3 w-3 text-[#FF633F]" strokeWidth={3} />}
        {children}
      </label>
      {number && <span className="font-mono text-[10px] text-slate-300">REF_{number}</span>}
    </div>
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
    title: "", excerpt: "", content: "", tagsText: "", status: "draft", coverUrl: "", coverPublicId: "",
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!isEdit) return;
      try {
        setLoading(true); setErr("");
        const res = await api.get("/admin/blogs?limit=100");
        const found = (res.data?.items || []).find((x) => x._id === id);
        if (!found) throw new Error("Blog not found");
        if (!alive) return;
        setForm({
          title: found.title || "", excerpt: found.excerpt || "", content: found.content || "",
          tagsText: Array.isArray(found.tags) ? found.tags.join(", ") : "",
          status: found.status || "draft", coverUrl: found.coverImage?.url || "", coverPublicId: found.coverImage?.publicId || "",
        });
      } catch (e) { if (alive) setErr(e?.message || "Failed to load"); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [id, isEdit]);

  const tagsArray = useMemo(() => form.tagsText.split(",").map((t) => t.trim()).filter(Boolean), [form.tagsText]);

  const onSave = async () => {
    try {
      setSaving(true); setErr("");
      const payload = {
        title: form.title.trim(), excerpt: form.excerpt.trim(), content: form.content,
        tags: tagsArray, status: form.status, coverImage: { url: form.coverUrl, publicId: form.coverPublicId },
      };
      if (isEdit) await api.patch(`/admin/blogs/${id}`, payload);
      else await api.post("/admin/blogs", payload);
      navigate("/admin/blogs");
    } catch (e) { setErr(e?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const onCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const uploaded = await uploadToCloudinary(file, "blog-covers");
      setForm((f) => ({ ...f, coverUrl: uploaded.url, coverPublicId: uploaded.publicId }));
    } catch (error) { setErr("Upload failed"); }
    finally { setUploadingCover(false); }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-900 antialiased selection:bg-[#FF633F] selection:text-white pb-32">
      
      {/* ── Header: Đậm chất Portfolio ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 px-6 py-6 backdrop-blur-xl md:px-16">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/admin/blogs" className="group flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-[#FF633F]">
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-2" />
              <span>Back to Archive</span>
            </Link>
            <div className="hidden h-8 w-[1px] bg-slate-200 md:block" />
            <div className="hidden flex-col md:flex">
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Project_Status</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF633F]">
                {isEdit ? `ID: ${id?.slice(-8)}` : "Drafting_New_Exhibition"}
              </span>
            </div>
          </div>

          <button 
            onClick={onSave} 
            disabled={saving}
            className="relative overflow-hidden bg-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-[#FF633F] active:scale-95 disabled:opacity-30"
          >
            <span className="relative z-10 flex items-center gap-3">
              {saving ? "Processing..." : "Commit Changes"}
              <Save size={14} />
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 pt-20 md:px-16">
        {loading ? (
           <div className="space-y-12 animate-pulse">
              <div className="h-32 w-2/3 bg-slate-200" />
              <div className="h-[600px] w-full bg-slate-100" />
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-12">
            
            {/* ── Cột Trái: Nội dung chính ─────────────────────────── */}
            <div className="lg:col-span-8">
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">
                
                {/* Headline Input */}
                <div className="group">
                  <FieldLabel icon={FileEdit} number="01">Article Headline</FieldLabel>
                  <textarea
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full resize-none bg-transparent text-6xl font-black uppercase leading-[0.9] tracking-tighter outline-none placeholder:text-slate-100 md:text-8xl"
                    placeholder="ENTER TITLE"
                    rows={2}
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <FieldLabel icon={Layers} number="02">Brief Summary</FieldLabel>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    className={INPUT_STYLE}
                    placeholder="Describe the essence of this piece..."
                  />
                </div>

                {/* Editor Container */}
                <div className="relative pt-10">
                  <FieldLabel icon={Fingerprint} number="03">Full Narrative</FieldLabel>
                  <div className="min-h-[600px] border border-slate-200 bg-white p-2 shadow-[40px_40px_80px_-20px_rgba(0,0,0,0.05)] transition-all focus-within:border-[#FF633F]">
                    <TiptapEditor
                      value={form.content}
                      onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                    />
                  </div>
                </div>
              </motion.section>
            </div>

            {/* ── Cột Phải: Metadata & Media (Sticky) ────────────────── */}
            <aside className="lg:col-span-4">
              <div className="sticky top-40 space-y-10">
                
                {/* Taxonomy & Status */}
                <div className={SIDE_CARD}>
                  <div className="space-y-10">
                    <div>
                      <FieldLabel icon={Globe}>Visibility</FieldLabel>
                      <div className="flex gap-2">
                        {['draft', 'published'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setForm(f => ({...f, status: s}))}
                            className={`flex-1 py-3 font-mono text-[10px] font-black uppercase tracking-widest transition-all ${form.status === s ? 'bg-black text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel icon={Tag}>Taxonomy</FieldLabel>
                      <input
                        value={form.tagsText}
                        onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))}
                        className="w-full border-b border-slate-100 bg-transparent py-2 font-mono text-xs font-bold uppercase tracking-widest outline-none focus:border-black"
                        placeholder="ART, CULTURE, DESIGN..."
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tagsArray.map((t) => (
                          <span key={t} className="border border-slate-200 px-3 py-1 font-mono text-[9px] font-black uppercase text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover Image - Minimalist Style */}
                <div className={SIDE_CARD}>
                  <FieldLabel icon={ImagePlus}>Exhibition Cover</FieldLabel>
                  {!form.coverUrl ? (
                    <label className="group flex h-80 cursor-pointer flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50 transition-all hover:bg-white hover:border-[#FF633F]">
                      <div className="relative">
                        <ImagePlus size={40} strokeWidth={1} className="text-slate-300 group-hover:scale-110 transition-transform" />
                        {uploadingCover && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear" }} className="absolute -inset-2 border-2 border-[#FF633F] border-t-transparent rounded-full" />}
                      </div>
                      <span className="mt-6 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {uploadingCover ? "Processing_Media" : "Upload_Visual_Asset"}
                      </span>
                      <input type="file" accept="image/*" onChange={onCoverUpload} className="sr-only" />
                    </label>
                  ) : (
                    <div className="group relative aspect-[3/4] overflow-hidden bg-slate-100 shadow-2xl">
                      <img src={form.coverUrl} alt="Cover" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                        <button
                          onClick={() => setForm((f) => ({ ...f, coverUrl: "", coverPublicId: "" }))}
                          className="bg-white p-4 text-black hover:bg-[#FF633F] hover:text-white transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="px-2 pt-4">
                   <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.3em] text-slate-300">
                     <span>Design System v2.0</span>
                     <span>© 2025 Studio Archive</span>
                   </div>
                </div>
              </div>
            </aside>

          </div>
        )}
      </main>

      {/* Floating Error Toast */}
      <AnimatePresence>
        {err && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-10 z-[100] border-l-4 border-black bg-white p-6 shadow-2xl flex items-center gap-4"
          >
            <AlertCircle className="text-[#FF633F]" size={20} />
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black">{err}</span>
            <button onClick={() => setErr("")} className="ml-4 text-slate-300 hover:text-black">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
