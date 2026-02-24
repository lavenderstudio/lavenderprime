// client/src/pages/Delivery.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Delivery Page — matches site theme.
// ALL existing content and structure is preserved. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  ClipboardList,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  Ruler,
  Image as ImageIcon,
  Clock,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { FadeUp, Stagger, item } from "../components/motion/MotionWrappers.jsx";

const ACCENT = "#FF633F";

// ─── Step card (numbered) ─────────────────────────────────────────────────────
function StepCard({ icon: Icon, title, text, number }) {
  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm
                 transition-shadow duration-300 hover:shadow-md"
    >
      {/* Step badge */}
      <div
        className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl text-xs font-extrabold text-white"
        style={{ background: "#0f172a" }}
      >
        {number}
      </div>

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

// ─── Info card ─────────────────────────────────────────────────────────────────
function InfoCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      variants={item}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm
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

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ tag, title, sub }) {
  return (
    <FadeUp>
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>{tag}</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">{title}</h2>
        {sub && <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">{sub}</p>}
      </div>
    </FadeUp>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Delivery() {
  const orderSteps = [
    { icon: ImageIcon, title: "Upload Your Photo / Artwork", text: "Choose your image from phone or desktop. We recommend high resolution for the sharpest print." },
    { icon: Ruler, title: "Pick Size, Frame & Finish", text: "Select dimensions, frame colour, mount (optional) and paper type. Preview updates live." },
    { icon: CreditCard, title: "Checkout Securely", text: "Add delivery details, pay securely, and you'll receive an order confirmation instantly." },
    { icon: ClipboardList, title: "We Produce Your Order", text: "We print, frame, quality-check, then package your order carefully for safe travel." },
  ];

  const packaging = [
    { icon: ShieldCheck, title: "Corner & Edge Protection", text: "Frames are protected with corner guards and edge padding to prevent knocks and scuffs." },
    { icon: Box, title: "Multi-Layer Wrap", text: "We wrap the item using protective layers to reduce movement inside the box during transit." },
    { icon: PackageCheck, title: "Rigid Box + Sealing", text: "Packed in a strong outer box and sealed securely to keep the product stable and protected." },
  ];

  const delivery = [
    { icon: Truck, title: "Doorstep Delivery", text: "Your order is delivered to your address. Please ensure someone is available to receive it." },
    { icon: MapPin, title: "Tracking Updates", text: "Once shipped, you can track your order using your order reference on the Track Order page." },
    { icon: Clock, title: "Estimated Timelines", text: "Most orders dispatch in 1–3 working days, depending on size, framing and customisation." },
    { icon: BadgeCheck, title: "Quality Checks Before Dispatch", text: "We inspect print sharpness, alignment, and frame finishing before anything leaves our workspace." },
  ];

  const faqs = [
    { q: "How Long Does Delivery Take?", a: "Production usually takes 1–3 working days. Delivery depends on your location and courier service. You'll get tracking once shipped." },
    { q: "What If My Frame Arrives Damaged?", a: "Message us with photos of the packaging and the product within 24–48 hours of delivery. We'll review and sort a replacement or solution quickly." },
    { q: "Can I Change My Address After Ordering?", a: "If your order hasn't shipped yet, contact us ASAP. Once shipped, changes may depend on courier policies." },
    { q: "Do You Deliver To Apartments / Flats?", a: "Yes. Add clear delivery instructions (building name, floor, access code). Couriers deliver to the doorstep where possible." },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-16 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
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
            Delivery & Packaging
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl"
          >
            Safely Delivering Your<br />
            <span style={{ color: ACCENT }}>Prints & Frames</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base"
          >
            From upload → printing → framing → packaging → courier delivery, every step is designed
            to protect your order and keep quality premium.
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
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── How to order ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeader
          tag="How To Order"
          title="Place An Order In Minutes"
          sub="Simple Flow: Upload → Customise → Checkout → We Produce and Ship."
        />

        <Stagger className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {orderSteps.map((s, idx) => (
            <StepCard key={s.title} number={idx + 1} icon={s.icon} title={s.title} text={s.text} />
          ))}
        </Stagger>

        <FadeUp>
          <div
            className="mt-6 rounded-2xl border border-slate-100 p-5 text-sm text-slate-700"
            style={{ background: `${ACCENT}08` }}
          >
            <span className="font-extrabold text-slate-900">Pro Tip: </span>
            For the sharpest results, use high-resolution photos and avoid screenshots where possible.
          </div>
        </FadeUp>
      </section>

      {/* ── Packaging ────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            tag="Packaging"
            title="How We Package Your Frame"
            sub="Frames And Prints Are Fragile — We Package With Impact Protection And Rigid Boxing."
          />

          <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
            {packaging.map((p) => <InfoCard key={p.title} icon={p.icon} title={p.title} text={p.text} />)}
          </Stagger>

          <FadeUp>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-extrabold text-slate-900">Before We Seal The Box</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-500">
                  <li>Print quality check (sharpness, color, alignment)</li>
                  <li>Frame finishing check (corners, mounts, cleanliness)</li>
                  <li>Secure fit check (no movement inside packaging)</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-extrabold text-slate-900">When You Receive The Parcel</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-500">
                  <li>Inspect the outer box before opening</li>
                  <li>Keep packaging until you're happy with the product</li>
                  <li>If anything looks wrong, take photos and contact support</li>
                </ul>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Delivery ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeader
          tag="Delivery"
          title="From Our Workshop To Your Doorstep"
          sub="Once Produced, We Dispatch Using Reliable Couriers With Tracking Where Available."
        />

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {delivery.map((d) => <InfoCard key={d.title} icon={d.icon} title={d.title} text={d.text} />)}
        </Stagger>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            tag="FAQs"
            title="Delivery Questions"
            sub="Common Questions Customers Ask Before Ordering."
          />

          <Stagger className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((f) => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </Stagger>

          {/* CTA */}
          <FadeUp>
            <div
              className="mt-10 overflow-hidden rounded-3xl p-8"
              style={{ background: `linear-gradient(135deg, ${ACCENT}18 0%, transparent 80%)` }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-extrabold" style={{ color: ACCENT }}>Ready To Order?</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">Start Your Golden Art Frames Order Today</p>
                  <p className="mt-1 text-sm text-slate-500">Upload Your Photo, Choose Frame And Size, And We'll Handle The Rest.</p>
                </div>
                <Link
                  to="/products"
                  className="inline-flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.03]"
                  style={{ background: ACCENT }}
                >
                  Start An Order <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
