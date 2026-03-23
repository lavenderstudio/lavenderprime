// client/src/pages/ProductsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bảo tàng · Tràn viền · Cyan × Magenta · Việt ngữ · Phá cách
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";

const C = "#00e5ff";
const M = "#e040fb";

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const PRODUCTS = [
  {
    id: "print-frame",
    name: "In & Đóng Khung",
    tagline: "Ảnh của bạn, khung thủ công, sẵn treo tường.",
    price: "Từ 89 AED",
    tag: "Phổ biến nhất",
    num: "01",
    category: "Có Khung",
    img: "/products/print&frame.avif",
    href: "/editor/print-frame",
    accent: C,
    features: ["Khung gỗ cao cấp", "Mực lưu trữ", "Sẵn sàng treo"],
  },
  {
    id: "print",
    name: "Bản In",
    tagline: "In độ phân giải cao trên giấy cao cấp.",
    price: "Từ 29 AED",
    tag: "Tiết kiệm nhất",
    num: "02",
    category: "Bản In",
    img: "/products/print.avif",
    href: "/editor/print",
    accent: M,
    features: ["Ultra HD", "Nhiều kích thước", "Xử lý nhanh"],
  },
  {
    id: "multiple-prints",
    name: "In Nhiều Ảnh",
    tagline: "Đặt nhiều kích thước trong một lần thanh toán.",
    price: "Từ 49 AED",
    tag: "Combo",
    num: "03",
    category: "Bản In",
    img: "/products/multipleprint.avif",
    href: "/editor/multiple-prints",
    accent: C,
    features: ["Giảm giá số lượng", "Kích thước tùy chọn", "Một đơn hàng"],
  },
  {
    id: "fine-art-print",
    name: "In Nghệ Thuật",
    tagline: "Giclée chất lượng bảo tàng trên giấy cotton lưu trữ.",
    price: "Từ 79 AED",
    tag: "Premium",
    num: "04",
    category: "Bản In",
    img: "/products/fineartprint.avif",
    href: "/editor/fine-art-print",
    accent: M,
    features: ["In Giclée", "Giấy cotton", "Chất lượng gallery"],
  },
  {
    id: "canvas",
    name: "In Canvas",
    tagline: "Canvas bọc gallery với khung gỗ chắc chắn.",
    price: "Từ 149 AED",
    tag: "Bán chạy",
    num: "05",
    category: "Canvas",
    img: "/products/canvas.avif",
    href: "/editor/canvas",
    accent: C,
    features: ["Khung gỗ đặc", "Mực bền màu", "Treo dây"],
  },
  {
    id: "mini-frames",
    name: "Khung Mini",
    tagline: "Khung thanh lịch, nhỏ gọn cho không gian hẹp.",
    price: "Từ 59 AED",
    tag: "Nhỏ gọn",
    num: "06",
    category: "Có Khung",
    img: "/products/miniframe.avif",
    href: "/editor/mini-frames",
    accent: M,
    features: ["Để bàn & treo tường", "Nhẹ", "Nhiều hoàn thiện"],
  },
  {
    id: "collage-frame",
    name: "Khung Collage",
    tagline: "Nhiều ảnh trong một khung trưng bày đẹp.",
    price: "Từ 179 AED",
    tag: "Sáng tạo",
    num: "07",
    category: "Có Khung",
    img: "/products/collageframe.avif",
    href: "/editor/collage-frame",
    accent: C,
    features: ["4-16 ô ảnh", "Bố cục tùy chỉnh", "Phù hợp làm quà"],
  },
  {
    id: "wedding-frame",
    name: "Khung Cưới",
    tagline: "Khung sang trọng cho những khoảnh khắc trân quý nhất.",
    price: "Từ 199 AED",
    tag: "Đặc biệt",
    num: "08",
    category: "Đám Cưới",
    img: "/products/weddingframe.avif",
    href: "/editor/wedding-frame",
    accent: M,
    features: ["Viền vàng / bạc", "Chất lượng kỷ niệm", "Có gói quà"],
  },
  {
    id: "wedding-print",
    name: "In Ảnh Cưới",
    tagline: "Bản in khổ lớn cho ngày trọng đại.",
    price: "Từ 99 AED",
    tag: "Đặc biệt",
    num: "09",
    category: "Đám Cưới",
    img: "/products/weddingprint.avif",
    href: "/editor/wedding-print",
    accent: C,
    features: ["Khổ lớn", "Màu sắc trung thực", "Bóng mờ / bóng láng"],
  },
];

const CATEGORIES = [
  { key: "All",      label: "Tất Cả" },
  { key: "Bản In",   label: "Bản In" },
  { key: "Có Khung", label: "Có Khung" },
  { key: "Canvas",   label: "Canvas" },
  { key: "Đám Cưới", label: "Đám Cưới" },
];

function ProductCard({ product, i }) {
  return (
    <Reveal delay={i * 0.05}>
      <Link
        to={product.href}
        className="group flex flex-col overflow-hidden bg-white transition-all duration-500 hover:bg-slate-50 relative"
        style={{
          minHeight: 480,
          borderBottom: "1px solid #f1f5f9",
          borderRight:  "1px solid #f1f5f9",
        }}
        aria-label={product.name}
      >
        {/* Accent line top khi hover */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, ${product.accent}, ${product.accent === C ? M : C})` }}
        />

        {/* Ảnh */}
        <div className="relative overflow-hidden bg-slate-50" style={{ aspectRatio: "4/3" }}>
          <img
            src={product.img}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-500 flex items-center justify-center">
            <span
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0 px-6 py-3 text-xs font-bold uppercase tracking-widest"
              style={{
                background: product.accent,
                color: product.accent === C ? "#0a0a0a" : "#fff",
                borderRadius: 2,
              }}
            >
              Thiết Kế Ngay →
            </span>
          </div>
          <span
            className="absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: product.accent,
              color: product.accent === C ? "#0a0a0a" : "#fff",
              borderRadius: 2,
            }}
          >
            {product.tag}
          </span>
          <span className="absolute bottom-3 right-4 font-mono text-xs text-white/40">
            {product.num}
          </span>
        </div>

        {/* Nội dung */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-base font-extrabold text-slate-900 tracking-tight">{product.name}</p>
            <span className="shrink-0 text-sm font-extrabold" style={{ color: product.accent }}>
              {product.price}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 flex-1">{product.tagline}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {product.features.map(f => (
              <span
                key={f}
                className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 border border-slate-100 transition-all duration-200 group-hover:border-transparent"
                style={{ borderRadius: 2 }}
              >
                {f}
              </span>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="font-mono text-[10px] text-slate-300 tracking-wider uppercase">{product.category}</span>
            <span className="text-xs font-bold" style={{ color: product.accent }}>
              Xem chi tiết →
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try { await api.post("/newsletter/subscribe", { email }); } catch {}
    setSent(true);
  };

  return (
    <section className="w-full" style={{ background: "#0a0a0d" }}>
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${C}, ${M})` }} />

      <div className="grid lg:grid-cols-2">
        {/* Trái */}
        <div
          className="flex flex-col justify-center px-10 sm:px-16 lg:px-20 py-20"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8" style={{ background: C }} />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: C }}>
              Bản Tin
            </span>
          </div>
          <h2
            className="font-extrabold tracking-tighter text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Nhận{" "}
            <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>
              10% Giảm Giá
            </span>
            <br />Đơn Đầu Tiên
          </h2>
          <p className="mt-5 text-sm text-white/40 max-w-sm leading-relaxed">
            Đăng ký nhận ưu đãi độc quyền, hướng dẫn chọn khung và cảm hứng trang trí thẳng vào hộp thư của bạn.
          </p>
        </div>

        {/* Phải */}
        <div className="flex flex-col justify-center px-10 sm:px-16 lg:px-20 py-20">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold"
              style={{ color: C }}
            >
              🎉 Cảm ơn bạn! Mã 10% đang trên đường đến.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">
                  Địa chỉ email
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@cuaban.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-4 text-sm font-semibold text-white placeholder-white/20 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 2,
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = C}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"}
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 text-sm font-extrabold uppercase tracking-widest transition-all hover:opacity-90"
                style={{ background: C, borderRadius: 2 }}
              >
                Nhận Mã Ngay
              </button>
              <p className="text-[10px] text-white/20 text-center">
                Không spam. Hủy đăng ký bất cứ lúc nào.
              </p>
            </form>
          )}
        </div>
      </div>

      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${M}, ${C})` }} />
    </section>
  );
}

export default function ProductsPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === active);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ── Hero nền tối tràn viền ──────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ background: "#0d0d10" }}>
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${C}, ${M})` }} />

        {/* Chữ lớn nền mờ */}
        <div
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-end pr-10 overflow-hidden"
          style={{
            fontSize: "clamp(4rem, 16vw, 14rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.03)",
            lineHeight: 1,
          }}
        >
          BỘ SƯU TẬP
        </div>

        <div className="relative px-10 sm:px-16 lg:px-24 py-24">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-8" style={{ background: M }} />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: M }}>
              Bộ Sưu Tập 2025
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-extrabold tracking-tighter text-white leading-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
          >
            Chọn Điều Bạn<br />
            Muốn{" "}
            <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>
              Tạo Ra
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mt-6 max-w-lg text-sm leading-relaxed text-white/50"
          >
            Tải ảnh lên, chọn kích thước &amp; hoàn thiện — chúng tôi in, đóng khung và giao tận cửa khắp UAE.
          </motion.p>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-2"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActive(cat.key)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-200"
                style={{
                  background: active === cat.key ? C : "rgba(255,255,255,0.06)",
                  color:      active === cat.key ? "#0a0a0a" : "rgba(255,255,255,0.55)",
                  borderRadius: 2,
                  border: active === cat.key ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />
      </section>

      {/* ── Đếm sản phẩm ───────────────────────────────────────────── */}
      <div
        className="w-full px-10 sm:px-16 lg:px-24 py-4 flex items-center justify-between bg-white"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-400">
          {filtered.length} tác phẩm
          {active !== "All" ? ` · ${CATEGORIES.find(c => c.key === active)?.label}` : " · Tất cả"}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full" style={{ background: C }} />
          <div className="h-1 w-1 rounded-full" style={{ background: M }} />
        </div>
      </div>

      {/* ── Product grid tràn viền ──────────────────────────────────── */}
      <section className="w-full bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} i={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Newsletter tràn viền ────────────────────────────────────── */}
      <Newsletter />
    </div>
  );
}
