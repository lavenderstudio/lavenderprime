/* eslint-disable no-unused-vars */
// client/src/components/home/Hero.jsx

import { Link } from "react-router-dom";
import { Sparkles, Truck, ShieldCheck, Ruler, Star, ArrowRight} from "lucide-react";
import { motion } from "framer-motion";
import { Container, ACCENT, ACCENT_BG, ACCENT_HOVER } from "./ui.jsx";
import { FadeUp} from "../motion/MotionWrappers.jsx";

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
      className="group relative min-h-47.5 overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={title}
          decoding="async"
          className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/30 to-black/10" />
      </div>

      <div className="relative p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/90">
          {subtitle}
        </p>
        <p className="mt-1 text-lg font-extrabold text-white sm:text-xl">{title}</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition group-hover:bg-white/20">
          {cta} <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

export default function Hero({ promos }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from bg-blue-100 via-white to-white">
      <div className="hidden sm:block absolute -top-24 right-0 h-64 w-64 rounded-full bg-blue-200/40 blur-xl opacity-45" />
      <div className="hidden sm:block absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-blue-300/40 blur-xl opacity-45" />

      <Container className="py-10 sm:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
              <Sparkles className={`h-4 w-4 ${ACCENT}`} />
              Premium prints • Perfect frames • Delivered fast
            </div>

            <FadeUp>
              <h1 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-3xl">
                Luxury framing for modern living.{" "}
                <span className={`${ACCENT} underline decoration-blue-500/60 underline-offset-8`}>
                  Crafted in UAE.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Upload a photo, choose the size, frame and finish — we print, frame and deliver to your door.
              </p>
            </FadeUp>
            <div className="mt-6 flex gap-3 sm:items-center">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/products"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition`}
                >
                  Start Designing
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
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

          {/* Hero image + floating rating card */}
          <div className="relative">
            <div className="aspect-4/3 overflow-hidden rounded-3xl border bg-slate-100 shadow-sm">
              <img
                src="./hero-img.avif"
                alt="Framed print in interior"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="absolute -bottom-5 left-1/2 w-[92%] -translate-x-1/2 rounded-2xl border bg-white p-4 shadow-sm sm:w-96 sm:p-5 lg:left-6 lg:translate-x-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-900">Top Rated Quality</p>
                <Rating value={4.8} />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Crisp prints, premium mounts, and strong packaging.
              </p>
            </div>
          </div>
          
        </div>
        <Container className="mt-16">
          <div className="grid gap-4 md:grid-cols-3">
            {promos.map((p) => (
              <PromoCard title={p.title} {...p} />
            ))}
          </div>
        </Container>
      </Container>
    </section>

    

  );
}
