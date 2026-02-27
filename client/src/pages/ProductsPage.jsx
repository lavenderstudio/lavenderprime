// client/src/pages/ProductsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Products page — matches HomePage theme.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";

const ACCENT = "#FF633F";

// ─── Shared reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Product catalogue ────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: "print-frame",
    name: "Print & Frame",
    tagline: "Your Photo, Framed And Ready To Hang.",
    price: "From 89 AED",
    tag: "Most Popular",
    tagBg: ACCENT,
    category: "Framed",
    img: "/products/printandframe_converted.avif",
    href: "/editor/print-frame",
    features: ["Premium Timber Frame", "Archival Inks", "Ready To Hang"],
  },
  {
    id: "print",
    name: "Print",
    tagline: "High-Fidelity Print On Premium Paper.",
    price: "From 29 AED",
    tag: "Best Value",
    tagBg: "#1E293B",
    category: "Print",
    img: "/products/print_converted.avif",
    href: "/editor/print",
    features: ["Ultra HD Print", "Multiple Sizes", "Fast Turnaround"],
  },
  {
    id: "multiple-prints",
    name: "Multiple Prints",
    tagline: "Order Several Sizes In A Single Checkout.",
    price: "From 49 AED",
    tag: "Bundle",
    tagBg: "#7C3AED",
    category: "Print",
    img: "/products/print_converted.avif",
    href: "/editor/multiple-prints",
    features: ["Bulk Discount", "Mix & Match Sizes", "One Order"],
  },
  {
    id: "fine-art-print",
    name: "Fine Art Print",
    tagline: "Museum-Grade Giclée On Archival Cotton Paper.",
    price: "From 79 AED",
    tag: "Premium",
    tagBg: "#0F766E",
    category: "Print",
    img: "/products/canvas_converted.avif",
    href: "/editor/fine-art-print",
    features: ["Giclée Printing", "Cotton Rag Paper", "Gallery Quality"],
  },
  {
    id: "canvas",
    name: "Canvas Print",
    tagline: "Gallery-Wrapped Canvas With Solid Timber Frame.",
    price: "From 149 AED",
    tag: "Best Seller",
    tagBg: "#059669",
    category: "Canvas",
    img: "/products/canvas_converted.avif",
    href: "/editor/canvas",
    features: ["Solid Wood Frame", "Fade-Resistant Inks", "Wire-Mounted"],
  },
  {
    id: "mini-frames",
    name: "Mini Frames",
    tagline: "Compact, Elegant Frames For Small Spaces.",
    price: "From 59 AED",
    tag: "Compact",
    tagBg: "#B45309",
    category: "Framed",
    img: "/products/canvas_converted.avif",
    href: "/editor/mini-frames",
    features: ["Desk & Wall Ready", "Lightweight", "Multiple Finishes"],
  },
  {
    id: "collage-frame",
    name: "Collage Frame",
    tagline: "Multiple Photos In One Beautiful Display.",
    price: "From 179 AED",
    tag: "Creative",
    tagBg: "#7C3AED",
    category: "Framed",
    img: "/products/canvas_converted.avif",
    href: "/editor/collage-frame",
    features: ["4-16 Photo Slots", "Custom Layouts", "Gift Ready"],
  },
  {
    id: "wedding-frame",
    name: "Wedding Frame",
    tagline: "Elegant Framing For Your Most Cherished Moments.",
    price: "From 199 AED",
    tag: "Special",
    tagBg: "#BE185D",
    category: "Wedding",
    img: "/products/canvas_converted.avif",
    href: "/editor/wedding-frame",
    features: ["Gold / Silver Finish", "Keepsake Quality", "Gift Wrap Available"],
  },
  {
    id: "wedding-print",
    name: "Wedding Print",
    tagline: "Large-Format Prints For The Big Day.",
    price: "From 99 AED",
    tag: "Special",
    tagBg: "#BE185D",
    category: "Wedding",
    img: "/products/canvas_converted.avif",
    href: "/editor/wedding-print",
    features: ["Oversized Prints", "True-colour Inks", "Satin or Gloss"],
  },
];

const CATEGORIES = ["All", "Print", "Framed", "Canvas", "Wedding"];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ product, i }) {
  return (
    <Reveal delay={i * 0.06}>
      <motion.div whileTap={{ scale: 0.98 }} className="h-full">
        <Link
          to={product.href}
          className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm
                     transition-all duration-300 hover:shadow-xl hover:border-[#FF633F]/25 hover:-translate-y-1.5"
          aria-label={product.name}
        >
          {/* Image */}
          <div className="relative overflow-hidden bg-slate-50">
            <div className="aspect-4/3 w-full">
              <img
                src={product.img}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Tag pill */}
            <span
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold text-white shadow"
              style={{ background: product.tagBg }}
            >
              {product.tag}
            </span>

            {/* Overlay CTA on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0
                            transition-opacity duration-300 group-hover:opacity-100">
              <span
                className="rounded-2xl px-5 py-2.5 text-sm font-extrabold text-white shadow-lg"
                style={{ background: ACCENT }}
              >
                Start Designing →
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-extrabold text-slate-900">{product.name}</p>
              <span className="shrink-0 text-sm font-extrabold" style={{ color: ACCENT }}>
                {product.price}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{product.tagline}</p>

            {/* Feature pills */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.features.map(f => (
                <span
                  key={f}
                  className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600
                             transition-all duration-300 group-hover:bg-[#FF633F]/10 group-hover:text-[#FF633F]"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* CTA bar */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-400">{product.category}</span>
              <span
                className="rounded-xl px-3 py-1.5 text-xs font-extrabold text-white
                           transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                style={{ background: ACCENT }}
              >
                Design →
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === active);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-20 text-center">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: ACCENT }}
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: ACCENT }}
        >
          Golden Art Frames
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl"
        >
          Choose What You Want<br />
          <span style={{ color: ACCENT }}>To Create</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60"
        >
          Upload your photo, choose your size &amp; finish — we print, frame and deliver it to your doorstep across the UAE.
        </motion.p>

        {/* Category filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="rounded-full px-5 py-2 text-sm font-extrabold transition-all duration-300"
              style={
                active === cat
                  ? { background: ACCENT, color: "#fff" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }
              }
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </section>

      {/* ── Product grid ────────────────────────────────────────────────── */}
      <section className="bg-[#fafafa] px-4 py-16">
        <div className="mx-auto max-w-7xl">

          {/* Count label */}
          <Reveal className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {active !== "All" ? ` · ${active}` : ""}
            </p>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} i={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Bottom trust strip ──────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-white px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Why Us</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Every Order, Made With Care</h2>
          </Reveal>
          <Reveal delay={0.1} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🖼️", title: "Premium Quality", body: "Archival inks and solid timber frames." },
              { icon: "🚚", title: "UAE-Wide Delivery", body: "Delivered to all 7 Emirates." },
              { icon: "📦", title: "Safe Packaging", body: "Foam-padded, arrives perfect." },
              { icon: "🔄", title: "Free Remakes", body: "Damaged? We'll remake it free." },
            ].map(item => (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-3xl border border-slate-100 bg-[#fafafa]
                           p-6 text-center transition-all duration-300 hover:border-[#FF633F]/30 hover:shadow-sm"
              >
                <span className="text-3xl">{item.icon}</span>
                <p className="mt-3 text-sm font-extrabold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
