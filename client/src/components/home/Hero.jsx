/* eslint-disable no-unused-vars */
// client/src/components/home/Hero.jsx

import { Link } from "react-router-dom";
import { Sparkles, Truck, ShieldCheck, Ruler, Star, ChevronLeft, ChevronRight } from "lucide-react";
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



// Small helper to wrap index properly
function mod(n, m) {
  return ((n % m) + m) % m;
}

export default function Hero({
  bgImages = ["./hero/hero-1.avif", "./hero/hero-2.avif", "./hero/hero-3.avif", "./hero/hero-4.avif"],
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
        <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/5 to-black/20" />
      </div>

      {/* ✅ Content on top */}
      <Container className="relative z-10 py-12 sm:py-16" >
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* White card with shadow */}
          <div className="rounded-3xl p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
              <Sparkles className={`h-4 w-4 ${ACCENT}`} />
              Premium prints • Perfect frames • Delivered fast
            </div>

            <FadeUp>
              <h1 className="mt-4 text-2xl font-extrabold leading-tight text-black sm:text-3xl lg:text-4xl">
                Luxury framing for modern living.{" "}
                <span className={`${ACCENT} underline decoration-[#FF633F]/35 underline-offset-8`}>
                  Crafted in UAE.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-black sm:text-base">
                Upload a photo, choose the size, frame and finish — we print, frame and deliver to your door.
              </p>
            </FadeUp>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/products"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 sm:w-auto`}
                >
                  Start Designing
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/contact"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50 hover:scale-105 transition-all duration-200 sm:w-auto"
                >
                  <span
                  className="
                    relative after:absolute after:left-0
                    after:-bottom-1 after:h-0.5
                    after:w-full after:origin-left
                    after:scale-x-0 after:bg-[#FF633F]
                    after:transition-transform after:duration-300
                    after:ease-out group-hover:after:scale-x-100
                  "
                  >
                    Contact Us
                  </span>
                  
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
        {/* Payment accepted box */}
        <Container className="mt-10">
          <div className="flex flex-col items-center w-xl gap-4 rounded-2xl border border-white/30 bg-white/80 px-6 py-5 shadow-md backdrop-blur sm:flex-row sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Secure Payments</p>
              <p className="mt-0.5 text-base font-bold text-slate-900">We Accept</p>
              <p className="mt-1 max-w-xs text-xs text-slate-500 leading-relaxed">
                All transactions are encrypted and processed securely via Stripe.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Visa SVG */}
              <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 65" className="w-full">
                  <path d="M82.5 57.4H66.6L76.7 7.7H92.6L82.5 57.4Z" fill="#1A1F71"/>
                  <path d="M140.7 9.2C137.5 8 132.6 6.6 126.5 6.6C110.8 6.6 99.7 14.9 99.6 26.7C99.5 35.4 107.4 40.3 113.4 43.2C119.6 46.2 121.7 48.1 121.7 50.8C121.6 54.9 116.7 56.7 112.1 56.7C105.7 56.7 102.3 55.8 97.1 53.5L95 52.5L92.7 66.5C96.5 68.2 103.6 69.6 111 69.7C127.8 69.7 138.7 61.5 138.8 49C138.9 42.8 134.9 38 126.2 33.9C120.6 31.1 117.2 29.2 117.2 26.3C117.3 23.7 120.1 21 126.4 21C131.7 20.9 135.5 22.1 138.5 23.3L140 24L142.3 10.4L140.7 9.2Z" fill="#1A1F71"/>
                  <path d="M164.4 6.6C160.7 6.6 157.8 7.3 156.2 11.1L132.3 57.4H149.1C149.1 57.4 151.8 50.3 152.4 48.7C154.2 48.7 170.5 48.7 172.8 48.7C173.3 50.8 174.8 57.4 174.8 57.4H189.7L176.7 6.6H164.4ZM157.1 36.9C158.4 33.5 163.4 20.4 163.4 20.4C163.3 20.6 164.7 17 165.5 14.9L166.6 19.8C166.6 19.8 169.8 34.5 170.5 36.9H157.1Z" fill="#1A1F71"/>
                  <path d="M52.6 7.7L37 43.2L35.3 35C32.4 25.1 23.2 14.3 12.9 9L27.1 57.3H44L69.4 7.7H52.6Z" fill="#1A1F71"/>
                  <path d="M22.1 7.7H-4.7L-5 9.1C16.3 14.2 30.1 26.2 35.3 35L29.9 12.2C29 8.5 26.7 7.8 22.1 7.7Z" fill="#FAA61A"/>
                </svg>
              </div>
              {/* Mastercard SVG */}
              <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 shadow-sm">
                <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" className="w-full">
                  <rect width="38" height="24" rx="4" fill="white"/>
                  <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                  <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
                  <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00"/>
                </svg>
              </div>
            </div>
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
