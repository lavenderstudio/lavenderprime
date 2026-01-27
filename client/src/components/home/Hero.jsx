/* eslint-disable no-unused-vars */
// client/src/components/home/Hero.jsx

import { Link } from "react-router-dom";
import { Sparkles, Truck, ShieldCheck, Ruler, Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container, ACCENT, ACCENT_BG, ACCENT_HOVER } from "./ui.jsx";
import { FadeUp } from "../motion/MotionWrappers.jsx";
import { useEffect, useMemo, useState } from "react";

function Rating({ value = 4.8 }) {
  return (
    <div className="flex items-center gap-1 text-sm text-slate-600">
      <Star className="h-4 w-4 text-amber-300" />
      <span className="font-semibold text-slate-900">{value.toFixed(1)}</span>
      <span className="text-slate-500">/5</span>
    </div>
  );
}

function Badge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
      <Icon className={`h-4 w-4 ${ACCENT}`} />
      <span className="text-xs font-semibold text-slate-800">{label}</span>
    </div>
  );
}

function PromoCard({ title, subtitle, cta, href, imageUrl }) {
  return (
    <Link
      to={href}
      className="group relative min-h-47.5 overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/30 to-black/10" />
      </div>

      <div className="relative p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/90">{subtitle}</p>
        <p className="mt-1 text-lg font-extrabold text-white sm:text-xl">{title}</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition group-hover:bg-white/20">
          {cta} <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

// Small helper to wrap index properly
function mod(n, m) {
  return ((n % m) + m) % m;
}

export default function Hero({
  promos,
  bgImages = ["./hero-img.png", "./hero-img-2.png", "./hero-img-3.png", "./hero-img.avif"],
  autoPlay = true,
  intervalMs = 4500,
}) {
  const images = useMemo(() => (Array.isArray(bgImages) && bgImages.length ? bgImages : ["./hero-img.avif"]), [bgImages]);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const goTo = (i) => setActive(mod(i, images.length));

  // ✅ Auto-rotate
  useEffect(() => {
    if (!autoPlay) return;
    if (paused) return;
    if (images.length <= 1) return;

    const t = setInterval(() => {
      setActive((i) => mod(i + 1, images.length));
    }, intervalMs);

    return () => clearInterval(t);
  }, [autoPlay, paused, images.length, intervalMs]);

  return (
    <section
      className="relative overflow-hidden"
      onFocusCapture={() => setPaused(true)} // ✅ pause when interacting
      onBlurCapture={() => setPaused(false)}
    >
      {/* ✅ Background slider */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[active]} // key triggers fade animation on change
            src={images[active]}
            alt="Hero background"
            className="h-full w-full object-cover"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.4 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/25 to-black/50" />
      </div>

      {/* ✅ Content on top */}
      <Container className="relative z-10 py-12 sm:py-16" >
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* White card with shadow */}
          <div className="rounded-3xl bg-white/95 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
              <Sparkles className={`h-4 w-4 ${ACCENT}`} />
              Premium prints • Perfect frames • Delivered fast
            </div>

            <FadeUp>
              <h1 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Luxury framing for modern living.{" "}
                <span className={`${ACCENT} underline decoration-blue-500/60 underline-offset-8`}>
                  Crafted in UAE.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Upload a photo, choose the size, frame and finish — we print, frame and deliver to your door.
              </p>
            </FadeUp>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/products"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition sm:w-auto`}
                >
                  Start Designing
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 sm:w-auto"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge icon={Truck} label="Fast Delivery" />
              <Badge icon={ShieldCheck} label="Secure Checkout" />
              <Badge icon={Ruler} label="Custom Sizes" />
            </div>
          </div>

          
        </div>
        {/* Promo cards */}
        <Container className="mt-14">
          <div className="grid gap-4 md:grid-cols-3">
            {promos.map((p) => (
              <PromoCard key={p.href || p.title} title={p.title} {...p} />
            ))}
          </div>
        </Container>
        {images.length > 1 && (
          <div className="mt-10 flex items-center justify-center">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === active ? "bg-slate-900" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
