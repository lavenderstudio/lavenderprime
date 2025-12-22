/* eslint-disable no-unused-vars */
// client/src/components/home/BlogPreview.jsx
// ----------------------------------------------------
// Blog preview section
// Responsive cards + subtle hover
// ----------------------------------------------------

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container, ACCENT } from "./ui.jsx";
import { FadeUp, Stagger, item } from "../motion/MotionWrappers.jsx";
import { motion } from "framer-motion";

function BlogCard({ title, date, excerpt, imageUrl, href }) {
  return (
    <div
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold text-slate-500">{date}</p>
        <p className="mt-1 text-base font-extrabold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{excerpt}</p>
      </div>
    </div>
  );
}

export default function BlogPreview({ blogs }) {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <FadeUp>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>Blog</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Tips, guides & delivery updates
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Quick reads to help you pick sizes, finishes and framing styles.
              </p>
            </div>
          </div>
        </FadeUp>

        <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
          {blogs.map((b) => (
            <motion.div key={b.title} variants={item}>
              <BlogCard {...b} />
            </motion.div>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
