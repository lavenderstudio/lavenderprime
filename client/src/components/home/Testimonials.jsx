/* eslint-disable no-unused-vars */
// client/src/components/home/Testimonials.jsx
// ----------------------------------------------------
// Testimonials section
// Responsive grid + scroll reveal
// ----------------------------------------------------

import { Star } from "lucide-react";
import { Container, ACCENT } from "./ui.jsx";
import { FadeUp, Stagger, item } from "../motion/MotionWrappers.jsx";
import { motion } from "framer-motion";

function TestimonialCard({ name, role, text, rating = 5 }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-extrabold text-slate-900">{name}</p>
          <p className="text-xs font-semibold text-slate-500">{role}</p>
        </div>

        <div className="flex items-center gap-1 text-slate-700">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="text-amber-500 h-4 w-4" />
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

export default function Testimonials({ testimonials }) {
  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-2xl text-center">
            <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>Testimonials</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Loved for quality & packaging
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Real feedback from customers who ordered prints and frames online.
            </p>
          </div>
        </FadeUp>

        <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={item}>
              <TestimonialCard {...t} />
            </motion.div>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
