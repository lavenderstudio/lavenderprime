// client/src/pages/BlogPostPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Thiết kế Bảo tàng — Trang chi tiết bài viết (Gallery Editorial Style)
// Tràn viền · Cyan × Magenta · Việt ngữ hoàn toàn
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Clock, User, Calendar, Share2 } from "lucide-react";
import api from "../lib/api.js";

// ─── Bảng màu đồng bộ Trang Chủ ──────────────────────────────────────────────
const C = "#00e5ff";   // cyan thuần
const M = "#e040fb";   // magenta thuần
const CM = C;

// ─── Component Reveal đồng bộ ────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Hairline({ gradient = false }) {
  return <div className="w-full h-px" style={{ background: gradient ? `linear-gradient(to right, ${C}, ${M})` : `${C}30` }} />;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function readingTime(html = "") {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BlogPostPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [blog, setBlog] = useState(null);

  const { scrollY } = useScroll();
  const yImage = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/blogs/${slug}`);
        if (!alive) return;
        setBlog(res.data?.blog);
      } catch (e) {
        if (!alive) return;
        setErr("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} 
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="h-12 w-12 border-2 border-cyan-400 rounded-full" 
      />
    </div>
  );

  if (err || !blog) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
      <h2 className="text-4xl font-black tracking-tighter mb-4">404</h2>
      <p className="text-slate-500 mb-8">{err || "Bài viết không tồn tại."}</p>
      <Link to="/products" className="px-8 py-3 bg-black text-white font-bold text-xs tracking-widest uppercase">Quay lại cửa hàng</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-cyan-100">
      
      {/* ── HEADER BẢO TÀNG (SPLIT LAYOUT) ─────────────────────────── */}
      <section className="relative grid lg:grid-cols-2 min-h-[70vh] border-b border-slate-100">
        
        {/* Cột trái: Nội dung tiêu đề */}
        <div className="flex flex-col justify-center px-10 sm:px-16 lg:px-24 py-20 relative z-10 bg-white">
          <Reveal>
            <Link to="/blog" className="group inline-flex items-center gap-2 mb-12 text-xs font-bold tracking-[0.2em] uppercase text-slate-400 hover:text-cyan-500 transition-colors">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Quay lại Blog
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8" style={{ background: M }} />
              <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: M }}>
                {blog.tags?.[0] || "Tài liệu"}
              </span>
            </div>
            
            <h1 
              className="font-extrabold leading-[0.95] tracking-tighter text-slate-900 mb-8"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              {blog.title}
            </h1>
          </Reveal>

          <Reveal delay={0.2} className="flex flex-wrap items-center gap-8 border-t border-slate-100 pt-8 mt-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">Tác giả</span>
              <span className="text-sm font-bold flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]" style={{ border: `1px solid ${C}` }}>
                  <User size={10} />
                </div>
                {blog.author?.fullName || "Art Team"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">Ngày đăng</span>
              <span className="text-sm font-bold flex items-center gap-2">
                <Calendar size={14} className="text-slate-300" />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">Thời gian đọc</span>
              <span className="text-sm font-bold flex items-center gap-2">
                <Clock size={14} className="text-slate-300" />
                {readingTime(blog.content)} phút
              </span>
            </div>
          </Reveal>
        </div>

        {/* Cột phải: Ảnh bìa Parallax */}
        <div className="relative overflow-hidden bg-slate-100 min-h-[400px] lg:min-h-full border-l border-slate-100">
          <motion.div className="absolute inset-0" style={{ y: yImage }}>
            {blog.coverImage?.url ? (
              <img 
                src={blog.coverImage.url} 
                alt="" 
                className="h-full w-full object-cover scale-110"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <span className="font-mono text-xs text-slate-400 tracking-[1em] rotate-90 uppercase">Bản in nghệ thuật</span>
              </div>
            )}
          </motion.div>
          {/* Accent Line */}
          <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: `linear-gradient(to right, transparent, ${C})` }} />
        </div>
      </section>

      {/* ── NỘI DUNG BÀI VIẾT (EDITORIAL CONTENT) ─────────────────── */}
      <section className="bg-white py-24 px-10 sm:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_2fr_1fr] gap-12">
          
          {/* Sidebar Trái: Social & Sticky Note */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-12">
              <div className="flex flex-col gap-4">
                <span className="font-mono text-[10px] tracking-widest text-slate-300 uppercase rotate-180 [writing-mode:vertical-lr] mb-4">Chia sẻ</span>
                <button className="h-10 w-10 flex items-center justify-center border border-slate-100 hover:border-cyan-400 transition-colors" style={{ borderRadius: 1 }}>
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </aside>

          {/* Nội dung chính */}
          <Reveal delay={0.3} className="relative">
            {/* Trích dẫn ngắn/Excerpt nếu có */}
            {blog.excerpt && (
              <p className="text-xl sm:text-2xl font-medium leading-relaxed text-slate-800 mb-16 italic font-serif border-l-4 pl-8" style={{ borderColor: C }}>
                {blog.excerpt}
              </p>
            )}

            <div 
              className="prose prose-slate prose-lg max-w-none 
                prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-900
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-8
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-img:rounded-sm prose-img:shadow-2xl
                prose-a:text-cyan-500 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-cyan-400 prose-blockquote:bg-slate-50 prose-blockquote:p-8 prose-blockquote:font-serif
              "
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags dưới bài */}
            {blog.tags?.length > 0 && (
              <div className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap gap-2">
                {blog.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-slate-50 text-[10px] font-bold tracking-widest uppercase text-slate-400 border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Reveal>

          {/* Sidebar Phải: Thông tin bổ sung kiểu Metadata */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 bg-slate-50 p-8 border border-slate-100" style={{ borderRadius: 2 }}>
              <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase mb-4">Mã số tài liệu</p>
              <p className="font-mono text-xs font-bold mb-8">ART-BLOG-{slug.substring(0, 5).toUpperCase()}-2025</p>
              
              <Hairline />
              
              <div className="mt-8 space-y-6">
                <p className="text-xs leading-relaxed text-slate-500 font-medium">
                  Bài viết này thuộc kho lưu trữ kiến thức chuyên sâu về kỹ thuật in và khung tranh cao cấp tại UAE.
                </p>
                <Link to="/products" className="block text-[10px] font-black tracking-widest uppercase text-cyan-500 hover:text-magenta-500 transition-colors">
                  Bắt đầu chế tác →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-24 px-10 sm:px-16 lg:px-24 text-center overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 opacity-20" style={{ background: `linear-gradient(to right, transparent, ${C}, ${M}, transparent)` }} />
        
        <Reveal>
          <span className="font-mono text-xs tracking-[0.4em] uppercase text-white/30 mb-6 block">Tiếp theo</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mb-10 leading-tight">
            Bạn đã sẵn sàng biến <br />
            <span style={{ color: "transparent", WebkitTextStroke: `1px ${C}` }}>Ký Ức Thành Nghệ Thuật?</span>
          </h2>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/products" 
              className="px-10 py-4 text-xs font-black tracking-widest uppercase text-white transition-all hover:scale-105"
              style={{ background: CM, borderRadius: 1 }}
            >
              Bắt đầu thiết kế ngay
            </Link>
            <Link 
              to="/blog" 
              className="px-10 py-4 text-xs font-black tracking-widest uppercase text-white border border-white/20 hover:border-white transition-all"
              style={{ borderRadius: 1 }}
            >
              Đọc các bài viết khác
            </Link>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
