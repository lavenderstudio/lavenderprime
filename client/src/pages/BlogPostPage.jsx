// client/src/pages/BlogPostPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Share2,
  Bookmark,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import api from "../lib/api.js";

// KHÔNG import ShinyText nữa - component không tồn tại → tránh lỗi build

const CYAN = "#00ffff";
const MAGENTA = "#ff00ff";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const yImage = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Endpoint API - chỉnh nếu backend của bạn dùng route khác (ví dụ /api/posts/:slug)
        const response = await api.get(`/blogs/${slug}`);
        setBlog(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi tải bài viết:", err);
        setError("Không tìm thấy bài viết hoặc lỗi kết nối. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600 animate-pulse">Đang tải bài viết...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4">
        <p className="text-2xl text-red-500 font-bold">{error || "Bài viết không tồn tại"}</p>
        <Link to="/blog" className="text-cyan-500 hover:underline">
          Quay về danh sách bài viết
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans antialiased selection:bg-[#00ffff]/30">
      {/* 1. Thanh tiến trình cuộn */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#00ffff] bg-[length:200%_100%]"
        style={{ scaleX }}
      />

      {/* 2. Thanh điều hướng */}
      <nav className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-between px-6 py-6 mix-blend-difference text-white">
        <Link to="/blog" className="flex items-center gap-4 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all group-hover:bg-white group-hover:text-black">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Quay về Danh sách</span>
        </Link>
        <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
          Phân loại: {blog?.tags?.[0] || "Nhật Ký Nghệ Thuật"} // {new Date().getFullYear()}
        </div>
      </nav>

      {/* 3. Phần đầu bài viết */}
      <header className="relative overflow-hidden pt-40 pb-20 md:pt-56 md:pb-32">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Metadata bên trái */}
            <div className="lg:col-span-3 flex flex-col justify-end border-l border-slate-200 pl-6 order-2 lg:order-1">
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Tác giả</p>
                  <p className="text-sm font-bold uppercase">{blog?.author?.fullName || "Ban biên tập"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Thời gian đọc</p>
                  <p className="text-sm font-bold uppercase flex items-center gap-2">
                    <Clock size={14} style={{ color: CYAN }} /> Khoảng 8 phút
                  </p>
                </div>
                <div className="pt-8">
                  <Fingerprint size={40} strokeWidth={1} className="text-slate-200" />
                </div>
              </div>
            </div>

            {/* Tiêu đề chính */}
            <div className="lg:col-span-9 order-1 lg:order-2">
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[12vw] md:text-[8vw] font-black leading-[0.85] tracking-tighter text-[#1a1a1a] uppercase italic"
              >
                {blog?.title?.split(" ").map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? "text-stroke-custom" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </motion.h1>

              <style jsx>{`
                .text-stroke-custom {
                  -webkit-text-stroke: 1.5px #1a1a1a;
                  color: transparent;
                }
              `}</style>
            </div>
          </div>
        </div>
      </header>

      {/* 4. Hình ảnh parallax */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden bg-slate-900">
        <motion.img
          style={{ y: yImage }}
          src={blog?.coverImage?.url || "/fallback-cover.jpg"} // thêm fallback nếu cần
          className="h-[120%] w-full object-cover opacity-80"
          alt={blog?.title || "Hình ảnh bài viết"}
        />
        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end text-white">
          <div className="max-w-md italic text-lg font-light opacity-80">
            "{blog?.excerpt || "Trích dẫn ngắn về bài viết..."}"
          </div>
          <div className="hidden md:block h-32 w-[1px] bg-gradient-to-t from-[#ff00ff] to-transparent" />
        </div>
      </section>

      {/* 5. Nội dung chính */}
      <main className="mx-auto max-w-7xl px-6 py-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-1 flex lg:flex-col gap-4 sticky top-32 h-fit">
          <button className="h-12 w-12 flex items-center justify-center rounded-none border border-slate-200 hover:bg-black hover:text-white transition-colors">
            <Share2 size={18} />
          </button>
          <button className="h-12 w-12 flex items-center justify-center rounded-none border border-slate-200 hover:bg-[#ff00ff] hover:text-white transition-colors">
            <Bookmark size={18} />
          </button>
        </aside>

        <article className="lg:col-span-8 lg:col-start-3">
          <div
            className="prose prose-xl prose-slate max-w-none prose-p:font-light prose-p:leading-[2] prose-p:text-slate-700 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-blockquote:border-l-4 prose-blockquote:border-[#00ffff] prose-blockquote:italic prose-img:shadow-[40px_40px_0px_0px_rgba(0,255,255,0.1)] prose-img:border prose-img:border-slate-100"
            dangerouslySetInnerHTML={{ __html: blog?.content || "<p>Nội dung đang được cập nhật...</p>" }}
          />
          <div className="mt-20 flex flex-wrap gap-2">
            {blog?.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>
      </main>

      {/* 6. Phần tiếp theo */}
      <section className="bg-black py-40 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ff00ff] mb-4">Tiếp tục đọc</p>
          <Link to="#" className="group">
            <h2 className="text-5xl md:text-8xl font-black uppercase leading-none tracking-tighter transition-all group-hover:italic group-hover:text-[#00ffff]">
              Nghệ thuật chạm khắc vàng ta <ChevronRight className="inline h-16 w-16" strokeWidth={3} />
            </h2>
          </Link>
        </div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[30vw] font-black text-white/5 whitespace-nowrap pointer-events-none">
          BÀI VIẾT TIẾP THEO
        </div>
      </section>
    </div>
  );
}
