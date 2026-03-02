// client/src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern homepage redesign — fully self-contained, no existing files modified.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";

// ─── ReactBits animated components ───────────────────────────────────────────
import ShinyText from "../components/reactbits/ShinyText.jsx";
import RotatingText from "../components/reactbits/RotatingText.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";
import BlurText from "../components/reactbits/BlurText.jsx";
import CurvedLoop from "../components/reactbits/CurvedLoop.jsx";
import Magnet from "../components/reactbits/Magnet.jsx";
import TiltCard from "../components/reactbits/TiltCard.jsx";

// ─── Theme ───────────────────────────────────────────────────────────────────
const ACCENT = "#FF633F";

// ─── Shared: scroll-triggered reveal ─────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Shared: star row ────────────────────────────────────────────────────────
function Stars({ n = 5 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-amber-400">
          <path d="M8 12.3l-4.9 2.9 1.3-5.4L.5 6.3l5.5-.5L8 .8l2 5 5.5.5-3.9 3.5 1.3 5.4z" />
        </svg>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HERO
// ─────────────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  "./hero/hero-1.avif",
  "./hero/hero-2.avif",
  "./hero/hero-3.avif",
  "./hero/hero-4.avif",
];

function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
      {/* Slideshow */}
      <AnimatePresence mode="crossfade">
        <motion.img
          key={HERO_SLIDES[idx]}
          src={HERO_SLIDES[idx]}
          alt="hero"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        />
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 xl:via-transparent to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 xl:via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-16 px-6 sm:px-14 max-w-2xl">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/25
                     bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
          <ShinyText text="Crafted In The UAE" speed={2.5} color="rgba(255, 255, 255, 0.9)" shineColor="#FF633F" spread={120} />
        </motion.span>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          Luxury{" "}
          <RotatingText
            texts={["Framing", "Canvas", "Prints", "Art"]}
            interval={2600}
            mainClassName="align-bottom"
            style={{ color: ACCENT }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
          />
          <br />
          <span style={{ color: ACCENT }}>For Modern Living.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 max-w-xs text-sm leading-relaxed text-white/80 sm:text-base sm:max-w-sm"
        >
          Upload A Photo, Choose Your Size &amp; Frame — We Print, Frame And Deliver To Your Door.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          {/* Primary — magnetic accent fill */}
          <Magnet padding={60} magnetStrength={10}>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                to="/products"
                style={{ background: ACCENT }}
                className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-extrabold text-white shadow-lg
                           transition-all duration-300 hover:brightness-110 hover:scale-[1.04] hover:shadow-xl"
              >
                Start Designing
              </Link>
            </motion.div>
          </Magnet>

          {/* Secondary ghost — orange border on hover */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5
                         text-sm font-extrabold text-white backdrop-blur
                         transition-all duration-300 hover:border-[#FF633F]/70 hover:bg-white/15 hover:scale-[1.04]"
            >
              <span
                className="relative after:absolute after:left-0 after:-bottom-0.5
                           after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                           after:bg-[#FF633F] after:transition-transform after:duration-300
                           after:ease-out group-hover:after:scale-x-100"
              >
                Our Story
              </span>
            </Link>
          </motion.div>

          {/* Tertiary ghost — orange border on hover + underline animation */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-5 py-3.5
                         text-sm font-extrabold text-white/80 backdrop-blur
                         transition-all duration-300 hover:border-[#FF633F]/60 hover:bg-white/15 hover:text-white hover:scale-[1.04]"
            >
              <span
                className="relative after:absolute after:left-0 after:-bottom-0.5
                           after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                           after:bg-[#FF633F] after:transition-transform after:duration-300
                           after:ease-out group-hover:after:scale-x-100"
              >
                Contact Us
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Rating pill — MOVED HERE below the CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78 }}
          className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/20
                     bg-white/10 px-4 py-2.5 backdrop-blur w-fit"
        >
          <Stars />
          <span className="text-sm font-extrabold text-white">4.9</span>
          <span className="text-xs text-white/60">· 500+ happy customers</span>
        </motion.div>

        {/* Dots */}
        <div className="mt-8 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === idx ? 28 : 8,
                background: i === idx ? ACCENT : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>

        {/* Payment badges — glass themed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 flex items-center gap-3"
        >
          <span className="text-xs font-semibold text-white/50">Secure Payments</span>
          {/* Visa */}
          <div className="flex h-8 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 65" className="w-9">
              <path d="M82.5 57.4H66.6L76.7 7.7H92.6L82.5 57.4Z" fill="white"/>
              <path d="M140.7 9.2C137.5 8 132.6 6.6 126.5 6.6C110.8 6.6 99.7 14.9 99.6 26.7C99.5 35.4 107.4 40.3 113.4 43.2C119.6 46.2 121.7 48.1 121.7 50.8C121.6 54.9 116.7 56.7 112.1 56.7C105.7 56.7 102.3 55.8 97.1 53.5L95 52.5L92.7 66.5C96.5 68.2 103.6 69.6 111 69.7C127.8 69.7 138.7 61.5 138.8 49C138.9 42.8 134.9 38 126.2 33.9C120.6 31.1 117.2 29.2 117.2 26.3C117.3 23.7 120.1 21 126.4 21C131.7 20.9 135.5 22.1 138.5 23.3L140 24L142.3 10.4L140.7 9.2Z" fill="white"/>
              <path d="M164.4 6.6C160.7 6.6 157.8 7.3 156.2 11.1L132.3 57.4H149.1C149.1 57.4 151.8 50.3 152.4 48.7C154.2 48.7 170.5 48.7 172.8 48.7C173.3 50.8 174.8 57.4 174.8 57.4H189.7L176.7 6.6H164.4ZM157.1 36.9C158.4 33.5 163.4 20.4 163.4 20.4C163.3 20.6 164.7 17 165.5 14.9L166.6 19.8C166.6 19.8 169.8 34.5 170.5 36.9H157.1Z" fill="white"/>
              <path d="M52.6 7.7L37 43.2L35.3 35C32.4 25.1 23.2 14.3 12.9 9L27.1 57.3H44L69.4 7.7H52.6Z" fill="white"/>
              <path d="M22.1 7.7H-4.7L-5 9.1C16.3 14.2 30.1 26.2 35.3 35L29.9 12.2C29 8.5 26.7 7.8 22.1 7.7Z" fill="rgba(255,255,255,0.6)"/>
            </svg>
          </div>
          {/* Mastercard */}
          <div className="flex h-8 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur">
            <svg viewBox="0 0 38 24" className="w-9">
              <circle cx="15" cy="12" r="7" fill="#EB001B"/>
              <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
              <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00"/>
            </svg>
          </div>
          {/* Apple Pay */}
          <div className="flex h-8 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/15 backdrop-blur">
            <span className="text-[10px] font-extrabold text-white tracking-tight">Pay</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TRUST MARQUEE
// ─────────────────────────────────────────────────────────────────────────────
const TRUST = [
  "🖼️  Premium quality frames",
  "🚚  Fast UAE delivery",
  "🔒  Secure checkout",
  "✨  Custom sizes available",
  "📦  Safe packaging guaranteed",
  "🎨  True-to-life colour printing",
  "📍  Delivered across all Emirates",
];

function TrustMarquee() {
  return (
    <div className="overflow-hidden border-y border-slate-100 bg-white py-4">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
        className="flex w-max gap-12"
      >
        {[...TRUST, ...TRUST].map((item, i) => (
          <span key={i} className="whitespace-nowrap text-sm font-semibold text-slate-600">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CURVED LOOP BANNER
// ─────────────────────────────────────────────────────────────────────────────
const LOOP_TEXT =
  "Premium Frames  ✦  UAE-Wide Delivery  ✦  Archival Prints  ✦  Custom Sizes  ✦  Gallery Quality  ✦  Fast Turnaround  ✦ ";

function TrustBar() {
  return (
    <div
      className="overflow-hidden pt-2"
    >
      <CurvedLoop
        marqueeText={LOOP_TEXT}
        speed={2}
        curveAmount={-70}
        direction="left"
        interactive
        fill="#FF633F"
        fontSize="2.6rem"
        fontWeight="800"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STATS STRIP
// ─────────────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 500,  suffix: "+", label: "Frames Crafted",    icon: "🖼️" },
  { value: 4.9,  suffix: "★", label: "Average Rating",     icon: "⭐" },
  { value: 70,    suffix: "+",  label: "Emirates Delivered", icon: "📦" },
  { value: 48,   suffix: "h", label: "Avg. Turnaround",    icon: "⚡" },
];

function StatsStrip() {
  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-white py-12 px-4">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: ACCENT }}
      />
      <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.09} className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-3xl">{s.icon}</span>
            <p className="tabular-nums text-4xl font-extrabold text-slate-900 sm:text-5xl">
              <CountUp from={0} to={s.value} duration={2.2} delay={0.1} />
              <span>{s.suffix}</span>
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PRODUCTS — Clean uniform 4-card grid
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "Print & Frame",
    desc: "Your photo, custom-framed and ready to hang.",
    price: "from 89 AED",
    tag: "Most Popular",
    img: "./feature/feature1_converted.avif",
    href: "/editor/print-frame",
    tagBg: ACCENT,
  },
  {
    name: "Fine Art Print",
    desc: "High-resolution printing on premium paper.",
    price: "from 29 AED",
    tag: "Premium",
    img: "./feature/feature2_converted.avif",
    href: "/editor/fine-art-print",
    tagBg: "#1E293B",
  },
  {
    name: "Canvas Print",
    desc: "Gallery-wrapped canvas with solid timber frame.",
    price: "from 149 AED",
    tag: "Best Seller",
    img: "./feature/feature3_converted.avif",
    href: "/editor/canvas",
    tagBg: "#059669",
  },
  {
    name: "Collage Frame",
    desc: "Multiple photos in one beautiful frame.",
    price: "from 179 AED",
    tag: "Value",
    img: "./promo/promo1_converted.avif",
    href: "/editor/collage-frame",
    tagBg: "#7C3AED",
  },
];

function ProductsSection() {
  return (
    <section className="bg-[#fafafa] pb-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <Reveal className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
              Our Products
            </p>
            <h2 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Frames For Every Story
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md">
              Four ways to turn your favourite photos into wall-worthy art — all printed and framed by hand in the UAE.
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              to="/products"
              className="group shrink-0 inline-flex items-center text-sm font-bold text-slate-500
                         transition-all duration-300 hover:text-slate-900 relative"
            >
              <span className="relative after:absolute after:left-0 after:-bottom-0.5
                               after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                               after:bg-[#FF633F] after:transition-transform after:duration-300
                               after:ease-out group-hover:after:scale-x-100 group-hover:text-[#FF633F]">
                View All Products →
              </span>
            </Link>
          </motion.div>
        </Reveal>

        {/* 4-column uniform grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <TiltCard rotateAmplitude={8} scaleOnHover={1.02}>
                <Link
                  to={p.href}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm
                             transition-all duration-300 hover:shadow-xl hover:border-[#FF633F]/25"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                    <span
                      className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold text-white shadow"
                      style={{ background: p.tagBg }}
                    >
                      {p.tag}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-base font-extrabold text-slate-900">{p.name}</p>
                    <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{p.desc}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-extrabold" style={{ color: ACCENT }}>
                        {p.price}
                      </span>
                      <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700
                                      transition-all duration-300 group-hover:bg-[#FF633F] group-hover:text-white group-hover:scale-105">
                        Design →
                      </span>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ABOUT SPLIT
// ─────────────────────────────────────────────────────────────────────────────
function AboutSplit() {
  return (
    <section className="bg-white py-20 px-4">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        {/* Image stack */}
        <Reveal>
          <div className="relative h-80 lg:h-[460px]">
            <img
              src="./promo/promo2_converted.avif"
              alt="workshop"
              className="absolute left-0 top-0 h-4/5 w-3/4 rounded-3xl object-cover shadow-xl"
            />
            <img
              src="./promo/promo3_converted.avif"
              alt="frame detail"
              className="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-3xl border-4 border-white object-cover shadow-xl"
            />
            <div
              className="absolute left-4 bottom-8 rounded-2xl px-5 py-3 text-white shadow-lg"
              style={{ background: ACCENT }}
            >
              <p className="text-2xl font-extrabold">
                <CountUp from={0} to={500} duration={2} />
                <span>+</span>
              </p>
              <p className="text-xs font-semibold opacity-80">Frames crafted</p>
            </div>
          </div>
        </Reveal>

        {/* Text */}
        <Reveal delay={0.12}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
            About Us
          </p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Where Photography<br />Meets Craftsmanship
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-500">
            Based in the UAE, we combine high-resolution printing with handcrafted framing — giving your memories the gallery-quality finish they deserve.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Gallery-Grade Archival Inks",
              "Hand-Assembled Timber Frames",
              "Custom Sizing, No Minimum Order",
              "Door-To-Door Delivery Across The UAE",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs"
                  style={{ background: ACCENT }}
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <motion.div whileTap={{ scale: 0.97 }} className="mt-8 w-fit">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white
                         transition-all duration-300 hover:brightness-110 hover:scale-[1.04] hover:shadow-lg"
              style={{ background: ACCENT }}
            >
              Learn More →
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Upload Your Photo", desc: "JPEG, PNG or HEIC — any image from your device or cloud." },
  { n: "02", title: "Pick Size & Frame", desc: "Choose from dozens of curated sizes and premium frame finishes." },
  { n: "03", title: "We Print & Frame It", desc: "Ultra-high-resolution print, hand-assembled in our UAE studio." },
  { n: "04", title: "Delivered To Your Door", desc: "Safely packaged and shipped fast to any UAE address." },
];

function HowItWorks() {
  return (
    <section className="bg-slate-950 py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Process</p>
          <BlurText
            text="How It Works"
            tag="h2"
            className="mt-2 text-3xl font-extrabold text-white sm:text-4xl"
            delay={70}
          />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-[#FF633F]/40">
                <p className="text-5xl font-extrabold text-white/10 transition group-hover:text-[#FF633F]/25">{s.n}</p>
                <p className="mt-4 text-base font-extrabold text-white">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELIVERY DETAILS (new)
// ─────────────────────────────────────────────────────────────────────────────
const DELIVERY_CARDS = [
  {
    icon: "🚚",
    title: "UAE-Wide Delivery",
    body: "We deliver to Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.",
  },
  {
    icon: "⚡",
    title: "Express Options",
    body: "Need it fast? Select express shipping at checkout for same-day or next-day delivery in most Emirates.",
  },
  {
    icon: "📦",
    title: "Safe Packaging",
    body: "Every order is wrapped in foam-padded protective packaging — your frame arrives in perfect condition, guaranteed.",
  },
  {
    icon: "🔄",
    title: "Free Remakes",
    body: "If your print arrives damaged or doesn't match the preview, we'll remake and reship it — free of charge.",
  },
];

function DeliverySection() {
  return (
    <section className="bg-white pt-20 pb-10 px-4">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Delivery</p>
          <BlurText
            text="Fast, Safe, Across The UAE"
            tag="h2"
            className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl"
            delay={60}
          />
          <p className="mt-3 text-sm text-slate-500 max-w-lg mx-auto">
            From our studio to your home — every order is handled with care from start to finish.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DELIVERY_CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.07}>
              <div className="h-full rounded-3xl border border-slate-100 bg-[#fafafa] p-6 transition hover:border-[#FF633F]/30 hover:shadow-sm">
                <span className="text-3xl">{c.icon}</span>
                <p className="mt-4 text-base font-extrabold text-slate-900">{c.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Delivery map strip */}
        <Reveal delay={0.15} className="mt-8">
          <div
            className="flex flex-wrap items-center justify-center gap-3 rounded-3xl p-5 text-white"
            style={{ background: ACCENT }}
          >
            <span className="text-sm font-extrabold">We Deliver To:</span>
            {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"].map(city => (
              <span
                key={city}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold"
              >
                {city}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────
const REVIEWS = [
  { name: "Hassan", role: "Print & Frame", city: "Dubai", rating: 5, text: "Quality is proper premium. The frame corners were perfect and packaging was solid — arrived safely." },
  { name: "Naveera", role: "Canvas Print", city: "Abu Dhabi", rating: 5, text: "The canvas looked exactly like the preview. Delivery was quick and customer support replied fast." },
  { name: "Areez", role: "Bulk Print Order", city: "Sharjah", rating: 5, text: "Great finishing, clean print colors, and easy checkout on mobile. Would order again." },
];

function Testimonials() {
  return (
    <section className="bg-[#fafafa] py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Reviews</p>
            <BlurText
              text="What Our Customers Say"
              tag="h2"
              className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl"
              delay={55}
            />
          </div>
          <div className="flex items-center gap-2">
            <Stars />
            <span className="text-sm font-bold text-slate-700">4.9 Average</span>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.09}>
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Stars n={r.rating} />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">"{r.text}"</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.role}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{r.city}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. BLOG SECTION (new — fetches live posts)
// ─────────────────────────────────────────────────────────────────────────────
function formatBlogDate(blog) {
  const d = blog.publishedAt || blog.createdAt;
  if (!d) return "";
  const date = new Date(d);
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const tag = blog.tags?.[0] || "Article";
  return `${month} ${year} · ${tag}`;
}

function BlogCard({ blog }) {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm
                 transition-all duration-300 hover:shadow-lg hover:border-[#FF633F]/25 hover:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {blog.coverImage?.url ? (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-slate-100 to-slate-200" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-slate-400">{formatBlogDate(blog)}</p>
        <p className="mt-1.5 text-base font-extrabold text-slate-900 leading-snug">{blog.title}</p>
        {blog.excerpt && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-2">{blog.excerpt}</p>
        )}
        <span
          className="group/rm mt-4 inline-flex w-fit items-center text-xs font-bold
                     transition-all duration-300"
          style={{ color: ACCENT }}
        >
          <span className="relative after:absolute after:left-0 after:-bottom-0.5
                           after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                           after:bg-[#FF633F] after:transition-transform after:duration-300 after:ease-out
                           group-hover/rm:after:scale-x-100"
          >Read More →</span>
        </span>
      </div>
    </Link>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-100 bg-white">
      <div className="aspect-video bg-slate-200" />
      <div className="space-y-2 p-5">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/blogs", { params: { status: "published", limit: 3 } })
      .then(res => { if (!cancelled) setBlogs(res.data?.items || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <section className="bg-white py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Blog</p>
            <h2 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Tips, Guides &amp; Updates
            </h2>
            <p className="mt-2 text-sm text-slate-500">Quick reads to help you pick sizes, finishes and framing styles.</p>
          </div>
          {!loading && blogs.length > 0 && (
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                to="/blog"
                className="group shrink-0 inline-flex items-center text-sm font-bold transition-all duration-300"
                style={{ color: ACCENT }}
              >
                <span className="relative after:absolute after:left-0 after:-bottom-0.5
                                 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                                 after:bg-[#FF633F] after:transition-transform after:duration-300
                                 after:ease-out group-hover:after:scale-x-100">
                  View All Posts →
                </span>
              </Link>
            </motion.div>
          )}
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [1, 2, 3].map(n => <BlogCardSkeleton key={n} />)
            : blogs.map((b, i) => (
                <Reveal key={b._id} delay={i * 0.08}>
                  <BlogCard blog={b} />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. NEWSLETTER
// ─────────────────────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section className="bg-[#fafafa] px-4 py-20">
      <Reveal>
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-4xl p-10 text-center sm:p-14"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #FF8C6B 60%, #FFB347 100%)` }}
        >
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">Newsletter</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Get 10% Off Your First Order</h2>
            <p className="mt-3 text-sm text-white/80">
              Subscribe and receive exclusive offers, tips &amp; inspiration straight to your inbox.
            </p>
            {sent ? (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 rounded-2xl bg-white/20 px-6 py-4 text-sm font-extrabold text-white"
              >
                🎉 Thank you! Your 10% code is on its way.
              </motion.p>
            ) : (
              <form
                onSubmit={e => { e.preventDefault(); if (email) setSent(true); }}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/30 bg-white/20 px-5 py-3.5 text-sm font-semibold text-white placeholder-white/60 outline-none backdrop-blur focus:border-white sm:w-72"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  className="shrink-0 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold
                             transition-all duration-300 hover:scale-[1.04] hover:shadow-lg"
                  style={{ color: ACCENT }}
                >
                  Claim My 10%
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. FOOTER PAYMENT BADGE
// ─────────────────────────────────────────────────────────────────────────────
function PaymentBadge() {
  return (
    <div className="border-t border-slate-100 bg-white py-5 px-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 sm:justify-between">
        <p className="text-xs font-semibold text-slate-400">Secure payments powered by Stripe</p>
        <div className="flex items-center gap-3">
          {/* Visa */}
          <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 65" className="w-10">
              <path d="M82.5 57.4H66.6L76.7 7.7H92.6L82.5 57.4Z" fill="#1A1F71"/>
              <path d="M140.7 9.2C137.5 8 132.6 6.6 126.5 6.6C110.8 6.6 99.7 14.9 99.6 26.7C99.5 35.4 107.4 40.3 113.4 43.2C119.6 46.2 121.7 48.1 121.7 50.8C121.6 54.9 116.7 56.7 112.1 56.7C105.7 56.7 102.3 55.8 97.1 53.5L95 52.5L92.7 66.5C96.5 68.2 103.6 69.6 111 69.7C127.8 69.7 138.7 61.5 138.8 49C138.9 42.8 134.9 38 126.2 33.9C120.6 31.1 117.2 29.2 117.2 26.3C117.3 23.7 120.1 21 126.4 21C131.7 20.9 135.5 22.1 138.5 23.3L140 24L142.3 10.4L140.7 9.2Z" fill="#1A1F71"/>
              <path d="M164.4 6.6C160.7 6.6 157.8 7.3 156.2 11.1L132.3 57.4H149.1C149.1 57.4 151.8 50.3 152.4 48.7C154.2 48.7 170.5 48.7 172.8 48.7C173.3 50.8 174.8 57.4 174.8 57.4H189.7L176.7 6.6H164.4ZM157.1 36.9C158.4 33.5 163.4 20.4 163.4 20.4C163.3 20.6 164.7 17 165.5 14.9L166.6 19.8C166.6 19.8 169.8 34.5 170.5 36.9H157.1Z" fill="#1A1F71"/>
              <path d="M52.6 7.7L37 43.2L35.3 35C32.4 25.1 23.2 14.3 12.9 9L27.1 57.3H44L69.4 7.7H52.6Z" fill="#1A1F71"/>
              <path d="M22.1 7.7H-4.7L-5 9.1C16.3 14.2 30.1 26.2 35.3 35L29.9 12.2C29 8.5 26.7 7.8 22.1 7.7Z" fill="#FAA61A"/>
            </svg>
          </div>
          {/* Mastercard */}
          <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <svg viewBox="0 0 38 24" className="w-10">
              <circle cx="15" cy="12" r="7" fill="#EB001B"/>
              <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
              <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00"/>
            </svg>
          </div>
          {/* Apple Pay */}
          <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-slate-200 bg-black shadow-sm">
            <span className="text-[10px] font-extrabold text-white tracking-tight">Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. FLOATING CONTACT BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function FloatingContact() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <Link
        to="/contact"
        style={{ background: ACCENT }}
        className="group flex items-center gap-2 rounded-full py-3 pl-4 pr-5 text-white shadow-xl transition hover:brightness-110 hover:scale-[1.05] hover:shadow-2xl"
      >
        {/* Chat bubble icon */}
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-sm font-extrabold">Contact Us</span>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <FloatingContact />
      <Hero />
      {/* <TrustMarquee /> */}
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
