// client/src/pages/BlogPostPage.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useScroll, useSpring, useInView } from "framer-motion";
import { ArrowLeft, Clock, Share2, Bookmark, Calendar } from "lucide-react";
import api from "../lib/api.js";

// Import các hiệu ứng từ trang chủ để đồng bộ
import ShinyText from "../components/reactbits/ShinyText.jsx";
import BlurText from "../components/reactbits/BlurText.jsx";

const C = "#00e5ff"; // Cyan thuần từ trang chủ
const M = "#e040fb"; // Magenta thuần từ trang chủ

function Hairline({ gradient = false }) {
  return <div className="w-full h-px" style={{ background: gradient ? `linear-gradient(to right, ${C}, ${M})` : `${C}30` }} />;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/blogs/${slug}`);
        if (res.data?.ok) setBlog(res.data.blog);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    }
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white font-sans antialiased selection:bg-[#00e5ff]/20">
      {/* Progress Bar kiểu Museum */}
      <motion.div className="fixed top-0 left-0 right-0 z-[100] h-1 origin-left" style={{ scaleX, background: C }} />

      {/* 1. HERO SECTION - Kế thừa phong cách tràn viền bất đối xứng */}
      <header className="relative pt-20 border-l-4" style={{ borderColor: M }}>
        <div className="px-10 sm:px-16 lg:px-24">
          <Link to="/blog" className="group flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-slate-400 hover:text-black transition-colors">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-2" />
            BACK TO ARCHIVE
          </Link>

          <div className="mt-12 mb-16 max-w-5xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase">
                {new Date(blog?.createdAt).toLocaleDateString("vi-VN")}
              </span>
              <div className="h-px w-8" style={{ background: C }} />
              <span className="rounded-full px-3 py-1 text-[10px] font-bold text-white" style={{ background: M }}>
                {blog?.tags?.[0] || "ART JOURNAL"}
              </span>
            </div>

            <h1 className="font-extrabold leading-[0.95] tracking-tighter text-slate-900" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
              {blog?.title}
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-500 font-light border-l-2 pl-6" style={{ borderColor: C }}>
              {blog?.excerpt}
            </p>
          </div>
        </div>

        {/* Ảnh Cover Tràn Viền - Giống Hero trang chủ */}
        <div className="relative h-[60vh] w-full overflow-hidden bg-slate-100">
          <img src={blog?.coverImage?.url} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
          {/* Label góc ảnh kiểu bảo tàng */}
          <div className="absolute bottom-8 right-10 flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-2">
            <span className="font-mono text-[10px] tracking-widest text-slate-900 uppercase">Exhibit No. 042</span>
            <div className="h-px w-8" style={{ background: M }} />
          </div>
        </div>
      </header>

      {/* 2. CONTENT SECTION - Editorial Layout */}
      <div className="grid lg:grid-cols-[1fr_minmax(auto,800px)_1fr] gap-0">
        {/* Sidebar Left - Metadata */}
        <aside className="hidden lg:block border-r border-slate-100 p-10">
          <div className="sticky top-32 space-y-12">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-slate-400 mb-4 uppercase">Author</p>
              <p className="font-bold text-sm tracking-tight">{blog?.author?.fullName || "Editorial Team"}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-slate-400 mb-4 uppercase">Reading Time</p>
              <p className="font-bold text-sm tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: C }} /> 6 MINS
              </p>
            </div>
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <button className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase hover:text-[#e040fb] transition-colors">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </aside>

        {/* Main Article */}
        <main className="px-10 py-24 sm:px-16 lg:px-20 bg-white">
          <article className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-extrabold prose-headings:tracking-tighter prose-headings:text-slate-900
            prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:mb-8
            prose-strong:text-slate-900 prose-strong:font-bold
            prose-blockquote:border-l-4 prose-blockquote:border-[#00e5ff] prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:not-italic
            prose-img:shadow-none prose-img:border prose-img:border-slate-100
            [&>p:first-of-type]:text-xl [&>p:first-of-type]:text-slate-800"
            dangerouslySetInnerHTML={{ __html: blog?.content }}
          />

          {/* Tags */}
          <footer className="mt-20 pt-10 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
              {blog?.tags?.map(t => (
                <span key={t} className="bg-slate-50 px-4 py-2 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                  #{t}
                </span>
              ))}
            </div>
          </footer>
        </main>

        {/* Sidebar Right - Empty or Decor */}
        <aside className="hidden lg:block border-l border-slate-100" />
      </div>

      <Hairline gradient />

      {/* 3. NEXT STEPS - Đồng bộ với CTA trang chủ */}
      <section className="bg-slate-950 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 font-black text-[20vw] text-white pointer-events-none select-none flex items-center justify-center">
            GALLERY
        </div>
        
        <div className="relative z-10 px-10">
          <BlurText text="Tiếp Tục Khám Phá" tag="h2" className="text-white font-extrabold tracking-tighter text-5xl mb-10" />
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/products" className="px-10 py-4 font-extrabold text-sm tracking-widest text-white transition-all hover:scale-105" style={{ background: C, borderRadius: 2 }}>
                THIẾT KẾ NGAY →
            </Link>
            <Link to="/blog" className="px-10 py-4 font-extrabold text-sm tracking-widest text-white border border-white/20 hover:border-white transition-all" style={{ borderRadius: 2 }}>
                XEM BLOG KHÁC
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
