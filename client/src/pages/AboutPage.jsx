/* eslint-disable no-unused-vars */
// client/src/pages/AboutPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern About Page — matches site theme.
// ALL existing content and structure is preserved. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  Truck,
  Image as ImageIcon,
  Ruler,
  Sparkles,
} from "lucide-react";
import { FadeUp, Stagger, item } from "../components/motion/MotionWrappers.jsx";

const ACCENT = "#FF633F";

// ─── Value card ───────────────────────────────────────────────────────────────
function ValueCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      variants={item}
      className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm
                 transition-shadow duration-300 hover:shadow-md"
    >
      <div
        className="grid h-11 w-11 place-items-center rounded-xl"
        style={{ background: `${ACCENT}18` }}
      >
        <Icon className="h-5 w-5" style={{ color: ACCENT }} />
      </div>
      <p className="mt-4 text-base font-extrabold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
    </motion.div>
  );
}

// ─── FAQ card ─────────────────────────────────────────────────────────────────
function FAQ({ q, a }) {
  return (
    <motion.div
      variants={item}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
    >
      <p className="text-sm font-extrabold text-slate-900">{q}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{a}</p>
    </motion.div>
  );
}

// ─── Process step ─────────────────────────────────────────────────────────────
function ProcessStep({ number, title, text }) {
  return (
    <div className="relative rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <span
        className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white"
        style={{ background: ACCENT }}
      >
        {number}
      </span>
      <p className="text-sm font-extrabold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function About() {
  const values = [
    { icon: ImageIcon, title: "Premium Printing, Sharp Detail", text: "Golden Art Frames focuses on crisp print quality with strong colour accuracy, so your artwork and photos look premium on the wall." },
    { icon: ShieldCheck, title: "High-Quality Frames & Finishes", text: "Golden Art Frames offers modern and classic framing styles, mounts, and finishes designed for clean presentation and long-lasting quality." },
    { icon: Truck, title: "Safe Packaging & Doorstep Delivery", text: "Every Golden Art Frames order is packaged with corner and edge protection, then delivered carefully to your doorstep with tracking where available." },
    { icon: Ruler, title: "Custom Sizes That Fit Your Space", text: "From standard sizes to custom measurements, Golden Art Frames helps you create wall art that fits perfectly in bedrooms, living rooms, offices, and galleries." },
    { icon: BadgeCheck, title: "Quality Checks Before Dispatch", text: "Golden Art Frames inspects prints, alignment, frame edges, and cleanliness before dispatch, so your order arrives looking exactly as expected." },
    { icon: Sparkles, title: "Designed For Gifting & Decor", text: "Golden Art Frames is built for personal memories, home decor, and gifting—ideal for birthdays, weddings, anniversaries, and corporate spaces." },
  ];

  const faqs = [
    { q: "What Does Golden Art Frames Do?", a: "Golden Art Frames creates custom prints and frames from your photos or artwork, then packages and delivers them to your address." },
    { q: "How Do I Order From Golden Art Frames?", a: "Choose a product, upload your image, select size and finish, preview your design, and checkout. Golden Art Frames handles printing, framing, and delivery." },
    { q: "Does Golden Art Frames Deliver To My Doorstep?", a: "Yes. Golden Art Frames delivers orders to your address with protective packaging to keep frames safe during transit." },
    { q: "Can Golden Art Frames Do Custom Sizes?", a: "Yes. Golden Art Frames supports standard sizes and custom sizing depending on the product type." },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-16 text-center">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full opacity-10 blur-3xl"
          style={{ background: ACCENT }}
        />

        <div className="relative mx-auto max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: ACCENT }}
          >
            About Golden Art Frames
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl"
          >
            Turning Photos & Artwork into{" "}
            <span style={{ color: ACCENT }}>Premium Wall Art</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base"
          >
            A print-and-frame brand built for customers who want high-quality printing, clean framing,
            and safe delivery to their door.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="mt-7 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.03]"
              style={{ background: ACCENT }}
            >
              Start Designing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/delivery"
              className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              How Delivery Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Mission + Images ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeUp>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Our Mission
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Our Mission At Golden Art Frames
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
                Golden Art Frames was created to make professional-quality wall art simple to order
                online. We focus on premium materials, accurate printing, strong frames, and careful
                packaging—so your final piece looks clean on the wall and arrives safely at your door.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
                From custom sizing to frame finishes, Golden Art Frames is designed for people who care
                about detail. We build each order with quality checks before dispatch, and we improve
                our process based on customer feedback.
              </p>
              <div
                className="mt-6 rounded-2xl border border-slate-100 p-5 text-sm text-slate-700"
                style={{ background: `${ACCENT}08` }}
              >
                <span className="font-extrabold text-slate-900">What We Make: </span>
                Prints, Posters, Canvas Prints, &amp; Framed Wall Art — Made to order at Golden Art Frames.
              </div>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-4/5 overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm">
                <img
                  src="./about/13.avif"
                  alt="Golden Art Frames - framed wall art example"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="aspect-4/5 mt-10 overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm">
                <img
                  src="./about/1.avif"
                  alt="Golden Art Frames - modern frames in interior"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <FadeUp>
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Why Golden Art Frames
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Quality, Care & Delivery You Can Trust
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
                Built around premium output, careful packaging, and a smooth ordering experience.
              </p>
            </div>
          </FadeUp>

          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => <ValueCard key={v.title} {...v} />)}
          </Stagger>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <FadeUp>
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Our Process
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                How Golden Art Frames Creates Your Framed Print
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
                Simple: design online → we produce → Golden Art Frames delivers it safely.
              </p>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="mt-8 grid gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
              <ProcessStep number={1} title="Design Your Order"
                text="Upload your photo/artwork and choose size, frame style, and finish on Golden Art Frames." />
              <ProcessStep number={2} title="Print & Quality Check"
                text="Golden Art Frames checks sharpness, colours, alignment, and cleanliness before framing." />
              <ProcessStep number={3} title="Frame & Finish"
                text="We mount (optional), frame your print, and confirm fit before packaging at Golden Art Frames." />
              <ProcessStep number={4} title="Package & Deliver"
                text="Corner protection, rigid boxing, then doorstep delivery. See the full delivery page for details." />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/delivery"
                className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-[#FF633F] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                  Delivery & Packaging
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110"
                style={{ background: ACCENT }}
              >
                Shop Golden Art Frames <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <FadeUp>
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                FAQs
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">About Golden Art Frames</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Answers to common questions customers ask about Golden Art Frames.
              </p>
            </div>
          </FadeUp>

          <Stagger className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((f) => <FAQ key={f.q} {...f} />)}
          </Stagger>

          {/* CTA banner */}
          <FadeUp>
            <div
              className="mt-10 overflow-hidden rounded-3xl p-8"
              style={{ background: `linear-gradient(135deg, ${ACCENT}18 0%, transparent 80%)` }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-extrabold" style={{ color: ACCENT }}>Ready to create?</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    Start your Golden Art Frames order today
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Upload your photo, choose frame and size, and we'll handle the rest.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.03]"
                  style={{ background: ACCENT }}
                >
                  Start Designing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
