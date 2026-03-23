// client/src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Thiết kế bảo tàng — Cyan × Magenta thuần trên nền trắng
// Tràn viền hoàn toàn · Việt ngữ · Đẳng cấp gallery
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import api from "../lib/api.js";

import ShinyText from "../components/reactbits/ShinyText.jsx";
import RotatingText from "../components/reactbits/RotatingText.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";
import BlurText from "../components/reactbits/BlurText.jsx";
import CurvedLoop from "../components/reactbits/CurvedLoop.jsx";
import Magnet from "../components/reactbits/Magnet.jsx";
import TiltCard from "../components/reactbits/TiltCard.jsx";
import { MessageCircle } from "lucide-react";

// ─── Bảng màu ────────────────────────────────────────────────────────────────
const C  = "#00e5ff";   // cyan thuần
const M  = "#e040fb";   // magenta thuần
const CM = C;

// ─── Reveal ──────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Dòng sao ────────────────────────────────────────────────────────────────
function Stars({ n = 5 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" className="h-3.5 w-3.5" style={{ fill: C }}>
          <path d="M8 12.3l-4.9 2.9 1.3-5.4L.5 6.3l5.5-.5L8 .8l2 5 5.5.5-3.9 3.5 1.3 5.4z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Đường kẻ trang trí ──────────────────────────────────────────────────────
function Hairline({ gradient = false }) {
  return (
    <div
      className="w-full h-px"
      style={{ background: gradient ? CM : `${C}40` }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HERO — tràn viền, chữ khổng lồ, split bất đối xứng
// ─────────────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  "./hero/hero-1.avif",
  "./hero/hero-2.avif",
  "./hero/hero-3.avif",
  "./hero/hero-4.avif",
];

function Hero() {
  const [idx, setIdx] = useState(0);
  const { scrollY } = useScroll();
  const yImg = useTransform(scrollY, [0, 600], [0, 80]);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden bg-white">

      {/* Ảnh nền parallax */}
      <motion.div className="absolute inset-0" style={{ y: yImg }}>
        <AnimatePresence mode="crossfade">
          <motion.img
            key={HERO_SLIDES[idx]}
            src={HERO_SLIDES[idx]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
          />
        </AnimatePresence>
      </motion.div>

      {/* Overlay bảo tàng — trắng từ trái */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(105deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.85) 42%, rgba(255,255,255,0.1) 72%, transparent 100%)" }}
      />

      {/* Đường accent cyan dọc bên trái */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: CM }} />

      {/* Nội dung */}
      <div className="relative z-10 flex h-full flex-col justify-center px-10 sm:px-16 lg:px-24 max-w-4xl">

        {/* Số thứ tự kiểu bảo tàng */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex items-center gap-4"
        >
          <span className="font-mono text-xs tracking-[0.3em] text-slate-400">BỘ SƯU TẬP 2025</span>
          <div className="h-px flex-1 max-w-[60px]" style={{ background: C }} />
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ background: CM }}
          >
            <ShinyText text="Chế tác tại UAE" speed={3} color="white" shineColor="white" spread={100} />
          </span>
        </motion.div>

        {/* Tiêu đề khổng lồ */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-extrabold leading-[0.92] tracking-tighter text-slate-900"
          style={{ fontSize: "clamp(3.2rem, 8vw, 7rem)" }}
        >
          Nghệ thuật{" "}
          <span
            className="inline-block"
            style={{ WebkitTextStroke: `2px ${C}`, color: "transparent" }}
          >
            <RotatingText
              texts={["Khung tranh", "Bản in", "Canvas", "Gallery"]}
              interval={2800}
              mainClassName="align-bottom"
              style={{ WebkitTextStroke: `2px ${M}`, color: "transparent" }}
            />
          </span>
          <br />
          <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>
            Cho Không Gian
          </span>
          <br />
          <span className="text-slate-900">Của Bạn.</span>
        </motion.h1>

        {/* Mô tả */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-7 max-w-sm text-base leading-relaxed text-slate-500 sm:text-lg"
        >
          Tải ảnh lên · Chọn kích thước &amp; khung · Nhận hàng tận cửa.
          Chất lượng phòng trưng bày, giao khắp UAE.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Magnet padding={50} magnetStrength={8}>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-extrabold text-white tracking-wide transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl"
                style={{ background: CM, borderRadius: 2 }}
              >
                Bắt Đầu Thiết Kế →
              </Link>
            </motion.div>
          </Magnet>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-extrabold text-slate-800 tracking-wide border border-slate-200 transition-all duration-300 hover:border-slate-800 hover:scale-[1.04]"
              style={{ borderRadius: 2 }}
            >
              Về Chúng Tôi
            </Link>
          </motion.div>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-9 flex items-center gap-3"
        >
          <Stars />
          <span className="text-sm font-bold text-slate-700">4.9</span>
          <span className="text-xs text-slate-400">· 500+ khách hàng hài lòng</span>
        </motion.div>

        {/* Slide dots */}
        <div className="mt-8 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="h-0.5 rounded-full transition-all duration-500"
              style={{
                width: i === idx ? 40 : 10,
                background: i === idx ? C : "#cbd5e1",
              }}
            />
          ))}
        </div>
      </div>

      {/* Số thứ tự ảnh kiểu bảo tàng — góc dưới phải */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 right-10 flex items-center gap-3"
      >
        <span className="font-mono text-xs tracking-widest text-slate-400">
          {String(idx + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
        </span>
        <div className="h-px w-12" style={{ background: M }} />
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MARQUEE DẢI CHỮ CHẠY
// ─────────────────────────────────────────────────────────────────────────────
const LOOP_TEXT =
  "Khung Cao Cấp  ✦  Giao Toàn UAE  ✦  Bản In Lưu Trữ  ✦  Kích Thước Tùy Chỉnh  ✦  Chất Lượng Gallery  ✦  Xử Lý Nhanh  ✦ ";

function TrustBar() {
  return (
    <div className="overflow-hidden bg-white pt-2">
      <CurvedLoop
        marqueeText={LOOP_TEXT}
        speed={2}
        curveAmount={-70}
        direction="left"
        interactive
        fill={C}
        fontSize="2.6rem"
        fontWeight="800"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SẢN PHẨM — Layout bảo tàng bất đối xứng
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "In & Đóng Khung",
    desc: "Ảnh của bạn, khung thủ công, sẵn treo tường.",
    price: "từ 89 AED",
    tag: "Phổ biến nhất",
    img: "./feature/11.avif",
    href: "/editor/print-frame",
    accent: C,
  },
  {
    name: "In Nghệ Thuật",
    desc: "Độ phân giải cao trên giấy cao cấp.",
    price: "từ 29 AED",
    tag: "Premium",
    img: "./feature/12.avif",
    href: "/editor/fine-art-print",
    accent: M,
  },
  {
    name: "In Canvas",
    desc: "Canvas bọc gallery với khung gỗ chắc chắn.",
    price: "từ 149 AED",
    tag: "Bán chạy",
    img: "./feature/8.avif",
    href: "/editor/canvas",
    accent: C,
  },
  {
    name: "Khung Collage",
    desc: "Nhiều ảnh trong một khung đẹp.",
    price: "từ 179 AED",
    tag: "Tiết kiệm",
    img: "./feature/3.avif",
    href: "/editor/collage-frame",
    accent: M,
  },
];

function ProductsSection() {
  return (
    <section className="bg-white py-24 px-0">
      {/* Header tràn viền */}
      <div className="px-10 sm:px-16 lg:px-24 mb-14">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: M }} />
              <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: M }}>
                Sản Phẩm
              </span>
            </div>
            <h2
              className="font-extrabold tracking-tighter text-slate-900 leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Khung Cho Mọi<br />
              <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>
                Câu Chuyện
              </span>
            </h2>
          </div>
          <Link
            to="/products"
            className="group shrink-0 text-sm font-bold text-slate-400 transition hover:text-slate-900 flex items-center gap-2"
          >
            Xem Tất Cả
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </div>

      <Hairline gradient />

      {/* Grid tràn viền — không có padding bên */}
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.06}>
            <TiltCard rotateAmplitude={6} scaleOnHover={1.02}>
              <Link
                to={p.href}
                className="group relative flex flex-col overflow-hidden bg-white border-r border-slate-100 last:border-r-0 transition-all duration-500 hover:bg-slate-50"
                style={{ minHeight: 420 }}
              >
                {/* Ảnh */}
                <div className="relative overflow-hidden" style={{ height: 260 }}>
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.08]"
                  />
                  {/* Overlay màu accent khi hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: p.accent }}
                  />
                  {/* Tag */}
                  <span
                    className="absolute top-4 left-4 px-3 py-1 text-xs font-extrabold text-white"
                    style={{ background: p.accent, borderRadius: 1 }}
                  >
                    {p.tag}
                  </span>
                  {/* Số thứ tự bảo tàng */}
                  <span className="absolute bottom-4 right-4 font-mono text-xs text-white/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Thông tin */}
                <div className="flex flex-1 flex-col p-6 border-t border-slate-100">
                  <p className="text-lg font-extrabold text-slate-900 tracking-tight">{p.name}</p>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-400">{p.desc}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-extrabold" style={{ color: p.accent }}>
                      {p.price}
                    </span>
                    <span
                      className="text-xs font-bold border px-3 py-1.5 transition-all duration-300 group-hover:text-white"
                      style={{
                        borderColor: p.accent,
                        color: p.accent,
                        borderRadius: 1,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = p.accent;
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = p.accent;
                      }}
                    >
                      Thiết kế →
                    </span>
                  </div>
                </div>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <Hairline gradient />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. VỀ CHÚNG TÔI — Ảnh tràn, chữ editorial
// ─────────────────────────────────────────────────────────────────────────────
function AboutSplit() {
  return (
    <section className="bg-white py-0 overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {/* Ảnh tràn viền trái */}
        <Reveal className="relative" style={{ minHeight: 500 }}>
          <img
            src="./about/13.avif"
            alt="xưởng"
            className="w-full h-full object-cover"
            style={{ minHeight: 400 }}
          />
          <img
            src="./about/1.avif"
            alt="chi tiết khung"
            className="absolute bottom-8 right-0 w-2/5 h-40 object-cover border-4 border-white shadow-2xl"
          />
          {/* Badge số liệu */}
          <div
            className="absolute left-6 bottom-6 px-5 py-4 text-white"
            style={{ background: CM, borderRadius: 2 }}
          >
            <p className="text-3xl font-extrabold">
              <CountUp from={0} to={500} duration={2} /><span>+</span>
            </p>
            <p className="text-xs font-semibold opacity-80 tracking-widest uppercase">Tác phẩm đã chế tác</p>
          </div>
        </Reveal>

        {/* Nội dung */}
        <Reveal delay={0.12} className="flex flex-col justify-center px-10 sm:px-16 lg:px-20 py-20 bg-white">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ background: C }} />
            <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: C }}>
              Về Chúng Tôi
            </span>
          </div>
          <h2
            className="font-extrabold tracking-tighter text-slate-900 leading-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
          >
            Nơi Nhiếp Ảnh<br />
            Gặp <span style={{ color: "transparent", WebkitTextStroke: `2px ${M}` }}>Thủ Công Mỹ Nghệ</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-500 max-w-md">
            Đặt tại UAE, chúng tôi kết hợp in độ phân giải siêu cao với đóng khung thủ công — mang đến chất lượng phòng trưng bày cho những khoảnh khắc quý giá của bạn.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Mực lưu trữ chất lượng gallery",
              "Khung gỗ lắp ráp thủ công",
              "Kích thước tùy chỉnh, không đơn tối thiểu",
              "Giao tận cửa khắp UAE",
            ].map((item, i) => (
              <li key={item} className="flex items-center gap-4 text-sm font-semibold text-slate-700">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center text-white text-xs font-bold"
                  style={{ background: i % 2 === 0 ? C : M, borderRadius: 1 }}
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-extrabold text-white transition-all hover:scale-[1.03] hover:shadow-lg"
              style={{ background: CM, borderRadius: 2 }}
            >
              Tìm Hiểu Thêm →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. QUY TRÌNH — Nền tối, số lớn bảo tàng
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Tải Ảnh Lên", desc: "JPEG, PNG hoặc HEIC — mọi ảnh từ thiết bị hoặc đám mây của bạn." },
  { n: "02", title: "Chọn Kích Thước & Khung", desc: "Từ hàng chục kích thước được tuyển chọn và hoàn thiện khung cao cấp." },
  { n: "03", title: "Chúng Tôi In & Đóng Khung", desc: "In độ phân giải siêu cao, lắp ráp thủ công tại xưởng UAE." },
  { n: "04", title: "Giao Đến Tận Cửa", desc: "Đóng gói an toàn và vận chuyển nhanh đến mọi địa chỉ UAE." },
];

function HowItWorks() {
  return (
    <section className="bg-slate-950 py-24 px-0 overflow-hidden">
      <div className="px-10 sm:px-16 lg:px-24 mb-16">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: M }} />
            <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: M }}>
              Quy Trình
            </span>
          </div>
          <BlurText
            text="Cách Thực Hiện"
            tag="h2"
            className="font-extrabold tracking-tighter text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            delay={70}
          />
        </Reveal>
      </div>

      {/* 4 bước tràn viền */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-white/5">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08}>
            <div className="group relative p-8 lg:p-10 border-r border-white/5 last:border-r-0 transition-all duration-500 hover:bg-white/[0.03]">
              {/* Đường accent top khi hover */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: i % 2 === 0 ? C : M }}
              />
              <p
                className="font-mono text-6xl font-extrabold leading-none mb-6 transition-all duration-500 group-hover:opacity-100"
                style={{ color: i % 2 === 0 ? `${C}20` : `${M}20` }}
              >
                {s.n}
              </p>
              <p className="text-base font-extrabold text-white mb-3">{s.title}</p>
              <p className="text-sm leading-relaxed text-white/40">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GIAO HÀNG
// ─────────────────────────────────────────────────────────────────────────────
const DELIVERY_CARDS = [
  { icon: "🚚", title: "Giao Toàn UAE", body: "Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah và Umm Al Quwain." },
  { icon: "⚡", title: "Tùy Chọn Express", body: "Cần gấp? Chọn vận chuyển nhanh khi thanh toán — giao trong ngày hoặc hôm sau." },
  { icon: "📦", title: "Đóng Gói An Toàn", body: "Mỗi đơn được bọc đệm xốp — khung đến tay bạn hoàn hảo, được đảm bảo." },
  { icon: "🔄", title: "Làm Lại Miễn Phí", body: "Nếu bản in đến bị hỏng hoặc không khớp preview, chúng tôi làm lại và gửi lại — hoàn toàn miễn phí." },
];

function DeliverySection() {
  return (
    <section className="bg-white py-24">
      <div className="px-10 sm:px-16 lg:px-24 mb-14">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: C }} />
            <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: C }}>
              Giao Hàng
            </span>
          </div>
          <h2
            className="font-extrabold tracking-tighter text-slate-900"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
          >
            Nhanh · An Toàn ·{" "}
            <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>Khắp UAE</span>
          </h2>
        </Reveal>
      </div>

      <Hairline />

      <div className="grid grid-cols-2 lg:grid-cols-4">
        {DELIVERY_CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.07}>
            <div className="group p-8 lg:p-10 border-r border-slate-100 last:border-r-0 transition-all hover:bg-slate-50 relative">
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: i % 2 === 0 ? C : M }}
              />
              <span className="text-3xl mb-5 block">{c.icon}</span>
              <p className="text-base font-extrabold text-slate-900 mb-2">{c.title}</p>
              <p className="text-sm leading-relaxed text-slate-400">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Hairline />

      {/* Dải thành phố */}
      <Reveal delay={0.15}>
        <div
          className="mx-10 sm:mx-16 lg:mx-24 mt-10 flex flex-wrap items-center gap-3 px-8 py-5"
          style={{ background: CM, borderRadius: 2 }}
        >
          <span className="text-sm font-extrabold text-white mr-4 tracking-wide">Giao đến:</span>
          {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"].map(city => (
            <span
              key={city}
              className="bg-white/20 px-4 py-1.5 text-xs font-bold text-white tracking-wide"
              style={{ borderRadius: 1 }}
            >
              {city}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CHỈ SỐ — Tối giản, số lớn
// ─────────────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 500, suffix: "+", label: "Tác Phẩm Đã Chế Tác", accent: C },
  { value: 4.9, suffix: "★", label: "Đánh Giá Trung Bình", accent: M },
  { value: 70,  suffix: "+", label: "Điểm Giao Hàng UAE", accent: C },
  { value: 48,  suffix: "h", label: "Thời Gian Xử Lý TB", accent: M },
];

function StatsStrip() {
  return (
    <section className="bg-slate-950 py-0">
      <Hairline />
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="group flex flex-col items-center py-14 px-8 border-r border-white/5 last:border-r-0 text-center">
              <p
                className="tabular-nums font-extrabold tracking-tighter leading-none"
                style={{ fontSize: "clamp(3rem, 6vw, 5rem)", color: s.accent }}
              >
                <CountUp from={0} to={s.value} duration={2.2} delay={0.1} />
                <span>{s.suffix}</span>
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/30">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Hairline />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. ĐÁNH GIÁ
// ─────────────────────────────────────────────────────────────────────────────
const REVIEWS = [
  { name: "Hassan", role: "In & Đóng Khung", city: "Dubai", rating: 5, text: "Chất lượng thực sự cao cấp. Các góc khung hoàn hảo và đóng gói chắc chắn — đến tay an toàn." },
  { name: "Naveera", role: "In Canvas", city: "Abu Dhabi", rating: 5, text: "Canvas trông y hệt preview. Giao hàng nhanh và hỗ trợ khách hàng phản hồi nhanh chóng." },
  { name: "Areez", role: "Đơn In Số Lượng", city: "Sharjah", rating: 5, text: "Hoàn thiện xuất sắc, màu sắc bản in sạch nét, thanh toán dễ dàng trên di động. Sẽ đặt lại." },
];

function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="px-10 sm:px-16 lg:px-24 mb-14">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8" style={{ background: M }} />
              <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: M }}>
                Đánh Giá
              </span>
            </div>
            <BlurText
              text="Khách Hàng Nói Gì"
              tag="h2"
              className="font-extrabold tracking-tighter text-slate-900"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
              delay={55}
            />
          </div>
          <div className="flex items-center gap-2">
            <Stars />
            <span className="text-sm font-bold text-slate-700">4.9 Trung Bình</span>
          </div>
        </Reveal>
      </div>

      <Hairline />

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.09}>
            <div className="group flex flex-col p-10 border-r border-slate-100 last:border-r-0 relative transition-all hover:bg-slate-50">
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: i % 2 === 0 ? C : M }}
              />
              {/* Dấu ngoặc kép lớn */}
              <span
                className="text-6xl font-serif leading-none mb-4 select-none"
                style={{ color: i % 2 === 0 ? `${C}30` : `${M}30` }}
              >
                "
              </span>
              <Stars n={r.rating} />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 italic">"{r.text}"</p>
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
                <span
                  className="px-3 py-1 text-xs font-bold text-white"
                  style={{ background: i % 2 === 0 ? C : M, borderRadius: 1 }}
                >
                  {r.city}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Hairline />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. BLOG
// ─────────────────────────────────────────────────────────────────────────────
function formatBlogDate(blog) {
  const d = blog.publishedAt || blog.createdAt;
  if (!d) return "";
  const date = new Date(d);
  const month = date.toLocaleString("vi-VN", { month: "short" });
  const year = date.getFullYear();
  return `${month} ${year} · ${blog.tags?.[0] || "Bài viết"}`;
}

function BlogCard({ blog, i }) {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group flex flex-col overflow-hidden bg-white border-r border-slate-100 last:border-r-0 transition-all hover:bg-slate-50 relative"
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: i % 2 === 0 ? C : M }}
      />
      <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
        {blog.coverImage?.url ? (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
        )}
        <span className="absolute bottom-3 right-3 font-mono text-xs text-white/50">
          {String(i + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-8">
        <p className="font-mono text-xs text-slate-400 mb-2">{formatBlogDate(blog)}</p>
        <p className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight">{blog.title}</p>
        {blog.excerpt && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-2">{blog.excerpt}</p>
        )}
        <span
          className="mt-6 text-xs font-bold tracking-wide"
          style={{ color: i % 2 === 0 ? C : M }}
        >
          Đọc Thêm →
        </span>
      </div>
    </Link>
  );
}

function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get("/blogs", { params: { status: "published", limit: 3 } })
      .then(res => { if (!cancelled) setBlogs(res.data?.items || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <section className="bg-white py-24">
      <div className="px-10 sm:px-16 lg:px-24 mb-14">
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8" style={{ background: C }} />
              <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: C }}>
                Blog
              </span>
            </div>
            <h2
              className="font-extrabold tracking-tighter text-slate-900"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              Nhật Ký
            </h2>
          </div>
          {!loading && blogs.length > 0 && (
            <Link
              to="/blog"
              className="group shrink-0 text-sm font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2 transition"
            >
              Tất Cả Bài Viết
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          )}
        </Reveal>
      </div>

      <Hairline gradient />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [1, 2, 3].map(n => (
              <div key={n} className="animate-pulse border-r border-slate-100 p-8">
                <div className="bg-slate-100 mb-6" style={{ aspectRatio: "4/3" }} />
                <div className="h-3 bg-slate-100 w-1/3 mb-3 rounded" />
                <div className="h-5 bg-slate-100 w-4/5 rounded" />
              </div>
            ))
          : blogs.map((b, i) => (
              <Reveal key={b._id} delay={i * 0.08}>
                <BlogCard blog={b} i={i} />
              </Reveal>
            ))}
      </div>

      <Hairline gradient />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. NEWSLETTER — Tràn viền, nền CM gradient
// ─────────────────────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section
      className="py-28 px-0 relative overflow-hidden"
      style={{ background: "white" }}
    >
      {/* Khối gradient tràn viền */}
      <div
        className="mx-10 sm:mx-16 lg:mx-24 relative p-12 sm:p-20 overflow-hidden"
        style={{ background: "#0a0a0a", borderRadius: 2 }}
      >
        {/* Accent lines trang trí */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: CM }} />
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: CM }} />

        {/* Chữ to nền */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            fontSize: "clamp(6rem, 18vw, 16rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.03)",
            lineHeight: 1,
          }}
        >
          GIẢM 10%
        </div>

        <Reveal className="relative text-center max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8" style={{ background: C }} />
            <span className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: C }}>
              Bản Tin
            </span>
            <div className="h-px w-8" style={{ background: M }} />
          </div>
          <h2
            className="font-extrabold tracking-tighter text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Nhận{" "}
            <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>10% Giảm Giá</span>
            <br />Đơn Hàng Đầu Tiên
          </h2>
          <p className="mt-4 text-sm text-white/50 max-w-sm mx-auto">
            Đăng ký nhận ưu đãi độc quyền, mẹo &amp; cảm hứng trực tiếp vào hộp thư.
          </p>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 py-4 text-sm font-bold"
              style={{ color: C }}
            >
              🎉 Cảm ơn bạn! Mã 10% đang trên đường đến.
            </motion.div>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); if (email) setSent(true); }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <input
                type="email"
                required
                placeholder="email@cuaban.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full sm:w-72 px-5 py-4 text-sm font-semibold text-white placeholder-white/30 outline-none bg-white/5 border border-white/10 focus:border-white/30 transition"
                style={{ borderRadius: 1 }}
              />
              <button
                type="submit"
                className="px-8 py-4 text-sm font-extrabold text-black transition hover:scale-[1.03]"
                style={{ background: CM, borderRadius: 1 }}
              >
                Nhận Mã Ngay
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. NÚT LIÊN HỆ NỔI
// ─────────────────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "971522640871";

function FloatingContact() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Xin chào Golden Art Frames! Tôi muốn đặt khung tùy chỉnh và cần tư vấn về kích thước, hoàn thiện và giá cả.`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-extrabold text-white shadow-2xl transition hover:scale-[1.05]"
        style={{ background: CM, borderRadius: 2 }}
      >
        <MessageCircle className="h-4 w-4" />
        Liên Hệ Ngay
      </a>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANG CHỦ
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    let raf;
    function onFrame(time) { lenis.raf(time); raf = requestAnimationFrame(onFrame); }
    raf = requestAnimationFrame(onFrame);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <FloatingContact />
      <Hero />
      <TrustBar />
      <ProductsSection />
      <AboutSplit />
      <HowItWorks />
      <DeliverySection />
      <StatsStrip />
      <Testimonials />
      <BlogSection />
      <Newsletter />
    </div>
  );
}
