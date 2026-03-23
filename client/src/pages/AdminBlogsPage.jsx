// ─────────────────────────────────────────────────────────────────────────────
// Digital Gallery Admin Blogs — Museum Archive Edition
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Trash2, Plus, FileText, ArrowUpRight, Search, Hash, Globe, Lock } from "lucide-react";
import api from "../lib/api.js";

// Sử dụng cùng hệ màu Accent của trang chủ
const ACCENT = "#FF633F"; 

function formatDate(d) {
  try {
    const date = new Date(d);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      year: date.getFullYear()
    };
  } catch { return { day: "00", month: "ERR", year: "0000" }; }
}

export default function AdminBlogsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/admin/blogs?limit=50");
      if (!res.data?.ok) throw new Error(res.data?.message || "Failed to load");
      setItems(res.data.items || []);
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    if (!confirm("XÁC NHẬN XÓA VĨNH VIỄN? THAO TÁC NÀY KHÔNG THỂ HOÀN TÁC.")) return;
    try {
      await api.delete(`/admin/blogs/${id}`);
      await load();
    } catch (e) { alert(e?.message || "Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] antialiased selection:bg-black selection:text-white pb-20">
      
      {/* ── Top Navigation Bar (Brutalist Style) ────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b-2 border-black bg-white/80 px-6 py-4 backdrop-blur-md md:px-12">
        <div className="flex items-center gap-4">
          <div className="h-4 w-4 bg-black" />
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em]">
            Studio / Archive / Blogs
          </span>
        </div>
        <div className="hidden font-mono text-[10px] font-bold text-slate-400 md:block">
          SYS_STATUS: <span className="text-emerald-500">OPERATIONAL</span>
        </div>
      </nav>

      {/* ── Studio Header ─────────────────────────────────────────── */}
      <header className="px-6 pt-16 pb-12 md:px-12 lg:pt-24 lg:pb-20">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
            <div className="relative">
              <span className="absolute -top-6 left-0 font-mono text-[10px] font-black uppercase tracking-[0.5em] text-[#FF633F]">
                Index: 001—999
              </span>
              <h1 className="text-[12vw] font-black leading-[0.8] uppercase tracking-tighter md:text-[8rem] lg:text-[10rem]">
                Editorial<span className="text-[#FF633F]">.</span>
              </h1>
              <p className="mt-4 max-w-md font-mono text-[12px] leading-relaxed text-slate-500 uppercase tracking-wider">
                Quản lý kho lưu trữ nội dung và các bài viết nghệ thuật. 
                Sử dụng công cụ biên tập để thay đổi diện mạo trang web.
              </p>
            </div>
            
            <Link
              to="/admin/blogs/new"
              className="group relative flex h-32 w-32 items-center justify-center overflow-hidden border-2 border-black transition-all hover:bg-black"
            >
              <div className="relative z-10 flex flex-col items-center gap-2 group-hover:text-white">
                <Plus size={24} strokeWidth={3} />
                <span className="font-mono text-[9px] font-black uppercase tracking-widest">Add Entry</span>
              </div>
              <motion.div className="absolute inset-0 bg-[#FF633F] translate-y-full transition-transform group-hover:translate-y-0" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1600px] px-6 md:px-12">
        
        {/* Filter Toolbar */}
        <div className="mb-1 bg-black p-4 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 font-mono text-[10px] font-black uppercase tracking-[0.2em]">
            <button className="text-[#FF633F] border-b-2 border-[#FF633F] pb-1">All Posts ({items.length})</button>
            <button className="opacity-50 hover:opacity-100 transition-opacity">Published</button>
            <button className="opacity-50 hover:opacity-100 transition-opacity">Drafts</button>
          </div>
          <div className="relative flex w-full max-w-sm items-center border-b border-white/30 pb-1 md:w-auto">
             <Search size={14} className="mr-3 text-slate-400" />
             <input 
                type="text" 
                placeholder="SEARCH ARCHIVE..." 
                className="w-full bg-transparent font-mono text-[10px] outline-none placeholder:text-slate-600" 
             />
          </div>
        </div>

        {/* Content Table */}
        <div className="border-x-2 border-black">
          {loading ? (
            <div className="divide-y-2 divide-black border-b-2 border-black">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-full animate-pulse bg-slate-50" />
              ))}
            </div>
          ) : (
            <div className="divide-y-2 divide-black border-b-2 border-black">
              {items.map((blog, idx) => {
                const date = formatDate(blog.publishedAt || blog.createdAt);
                return (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group relative grid grid-cols-12 items-stretch gap-0 bg-white hover:bg-slate-50 transition-colors"
                  >
                    {/* Index Number */}
                    <div className="col-span-1 hidden items-center justify-center border-r-2 border-black font-mono text-[12px] font-black text-slate-200 group-hover:text-black md:flex">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>

                    {/* Date Block */}
                    <div className="col-span-2 hidden flex-col items-center justify-center border-r-2 border-black bg-slate-50 font-mono md:flex group-hover:bg-[#FF633F] group-hover:text-white transition-colors">
                      <span className="text-2xl font-black leading-none">{date.day}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{date.month}</span>
                    </div>

                    {/* Info Body */}
                    <div className="col-span-12 p-8 md:col-span-7">
                      <div className="flex items-center gap-3 mb-2">
                        {blog.status === 'published' ? <Globe size={12} className="text-emerald-500" /> : <Lock size={12} className="text-amber-500" />}
                        <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                          {blog.status || 'draft'} / {blog.category || 'General'}
                        </span>
                      </div>
                      <Link to={`/admin/blogs/${blog._id}/edit`} className="block">
                        <h3 className="text-3xl font-black uppercase leading-[0.9] tracking-tighter group-hover:underline decoration-4 decoration-[#FF633F] md:text-5xl">
                          {blog.title}
                        </h3>
                      </Link>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="bg-black px-2 py-0.5 font-mono text-[8px] font-bold text-white uppercase tracking-widest italic">
                          slug: {blog.slug}
                        </span>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-12 flex items-stretch border-t-2 border-black md:col-span-2 md:border-t-0 md:border-l-2 md:flex-col lg:flex-row lg:divide-x-2 lg:divide-black">
                      <Link
                        to={`/admin/blogs/${blog._id}/edit`}
                        className="flex flex-1 items-center justify-center p-6 hover:bg-black hover:text-white transition-all"
                        title="Edit Post"
                      >
                        <PenLine size={20} />
                      </Link>
                      <button
                        onClick={() => onDelete(blog._id)}
                        className="flex flex-1 items-center justify-center p-6 hover:bg-rose-500 hover:text-white transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 size={20} />
                      </button>
                      <Link
                        to={`/blog/${blog.slug}`}
                        target="_blank"
                        className="flex flex-1 items-center justify-center p-6 hover:bg-[#FF633F] hover:text-white transition-all"
                        title="View Live"
                      >
                        <ArrowUpRight size={20} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer Metadata ────────────────────────────────────────── */}
        {!loading && (
          <div className="mt-8 flex flex-col justify-between gap-4 border-t border-slate-200 pt-8 font-mono text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 md:flex-row">
            <div className="flex gap-8">
              <span>Integrity_Check: <span className="text-black">100% Valid</span></span>
              <span>Items_Count: <span className="text-black">{items.length}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Hash size={12} strokeWidth={3} />
              <span>Session_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
