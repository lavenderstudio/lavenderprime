// client/src/pages/BlogListPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Search, 
  Settings, 
  ArrowRight, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Plus
} from "lucide-react";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const CYAN = "#00ffff";
const MAGENTA = "#ff00ff";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("vi-VN", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  } catch { return ""; }
}

// ─── Blog Card (Exhibition Style) ──────────────────────────────────────────
function BlogCard({ blog, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link to={`/blog/${blog.slug}`} className="block">
        {/* Frame bao quanh ảnh - Phong cách Bảo tàng */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f0f0f0]">
          {blog.coverImage?.url ? (
            <img
              src={blog.coverImage.url}
              alt={blog.title}
              className="h-full w-full object-cover transition-transform duration-[2s] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-slate-200" strokeWidth={1} />
            </div>
          )}
          
          {/* Label mã số lưu trữ (Index) */}
          <div className="absolute bottom-0 left-0 bg-white px-4 py-2 font-mono text-[10px] font-black tracking-tighter text-black">
            INV-{String(index + 1).padStart(3, '0')}
          </div>
        </div>

        {/* Thông tin bài viết */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-[#666]">
              {blog.category || "Cảm hứng"}
            </span>
            <span className="font-mono text-[9px] font-black text-slate-300">
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>

          <h3 className="text-2xl font-black leading-[1.1] tracking-tighter text-[#1a1a1a] transition-all duration-500 group-hover:text-[#ff00ff] lg:text-3xl">
            {blog.title}
          </h3>

          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
            {blog.excerpt || "Khám phá chiều sâu của tác phẩm và những câu chuyện phía sau khung tranh được kể bởi các chuyên gia..."}
          </p>

          <div className="flex items-center gap-2 pt-2 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">
             Xem chi tiết <Plus className="h-3 w-3" style={{ color: CYAN }} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BlogListPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { user: me } = useAuth();
  const isStaff = !!me && ["admin", "manager"].includes(me.role);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 9 });

  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "published");
    params.set("page", String(page));
    params.set("limit", "9");
    if (q.trim()) params.set("q", q.trim());
    return params.toString();
  }, [page, q]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/blogs?${queryParams}`);
        if (alive && res.data?.ok) {
          setItems(res.data.items || []);
          setPagination(res.data.pagination);
        }
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [queryParams]);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      
      {/* ── Header Section (Typography Display) ────────────────────────── */}
      <motion.section 
        style={{ y: headerY }}
        className="relative flex min-h-[70vh] flex-col justify-center px-6 pt-32 pb-20 overflow-hidden"
      >
        {/* Grid nền tinh tế */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
        
        <div className="relative mx-auto w-full max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-12 bg-black" />
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-black">
              BẢN IN NGHỆ THUẬT
            </span>
          </div>

          <h1 className="text-[12vw] font-black leading-[0.85] tracking-tighter text-[#1a1a1a] lg:text-[10vw]">
            NHẬT KÝ <br />
            <span 
              className="inline-block" 
              style={{ WebkitTextStroke: `1.5px ${MAGENTA}`, color: 'transparent' }}
            >
              NGHỆ THUẬT
            </span>
          </h1>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="max-w-md">
              <p className="text-lg font-medium leading-relaxed text-slate-600">
                Nơi những câu chuyện về di sản, kỹ thuật chế tác và tâm hồn nghệ thuật được lưu giữ vĩnh cửu.
              </p>
            </div>
            <div className="flex items-end justify-start lg:justify-end">
                <div className="flex flex-col items-end border-r-4 border-[#0ff] pr-6">
                    <span className="font-mono text-5xl font-black italic">{pagination.total}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Records</span>
                </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Filter & Search Bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-y border-slate-100 bg-white/80 py-6 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff00ff]" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="TÌM THEO TÊN BÀI VIẾT / TÁC GIẢ..."
              className="w-full border-b border-transparent bg-transparent pl-8 font-mono text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:border-[#ff00ff]"
            />
          </div>

          {isStaff && (
            <button
              onClick={() => navigate("/admin/blogs")}
              className="hidden items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-black hover:text-[#ff00ff] md:flex"
            >
              <Settings className="h-4 w-4" /> Editorial Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ── Main Gallery Grid ─────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-24">
        {loading ? (
          <div className="grid gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse space-y-6">
                <div className="aspect-[4/5] bg-slate-50" />
                <div className="h-4 w-1/4 bg-slate-50" />
                <div className="h-8 w-full bg-slate-50" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-x-12 gap-y-32 md:grid-cols-2 lg:grid-cols-3">
            {items.map((blog, i) => (
              <BlogCard key={blog._id} blog={blog} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40">
             <span className="font-mono text-[10px] font-black text-slate-300 uppercase tracking-[1em] mb-4 text-center">Empty Records</span>
             <h2 className="text-4xl font-black tracking-tighter">Không có dữ liệu lưu trữ.</h2>
          </div>
        )}

        {/* ── Museum Pagination ────────────────────────────────────────── */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-40 flex items-center justify-between border-t-2 border-black pt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-4 font-mono text-[11px] font-black uppercase tracking-tighter transition-all hover:-translate-x-2 disabled:opacity-20"
            >
              <ChevronLeft className="h-5 w-5" /> Previous
            </button>

            <div className="flex items-center gap-8">
               {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(num => (
                 <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`font-mono text-sm font-black transition-all ${page === num ? 'text-[#ff00ff] scale-150' : 'text-slate-300 hover:text-black'}`}
                 >
                   {String(num).padStart(2, '0')}
                 </button>
               ))}
            </div>

            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="flex items-center gap-4 font-mono text-[11px] font-black uppercase tracking-tighter transition-all hover:translate-x-2 disabled:opacity-20"
            >
              Next Record <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </main>

      {/* ── Footer Branding ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white py-40 px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
             <div className="mb-10 h-24 w-[1px] bg-gradient-to-b from-black to-transparent" />
             <h4 className="text-[5vw] font-black tracking-tighter text-[#f0f0f0]">GOLDEN ART ARCHIVE</h4>
             <p className="mt-4 font-mono text-[10px] font-black uppercase tracking-[1em] text-slate-300">
               Est. 2026 / Editorial Unit
             </p>
          </div>
      </footer>
    </div>
  );
}
