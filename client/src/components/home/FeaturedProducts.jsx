/* eslint-disable no-unused-vars */
// client/src/components/home/FeaturedProducts.jsx
import { Link, Star } from "lucide-react";
import { Container, ACCENT, ACCENT_BG, ACCENT_HOVER } from "./ui.jsx";
import { FadeUp, Stagger, item } from "../motion/MotionWrappers.jsx";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Rating({ value }) {
  return (
    <div className="flex items-center gap-1 text-sm text-slate-600">
      <Star className="h-4 w-4" />
      <span className="font-semibold text-slate-900">{value.toFixed(1)}</span>
      <span className="text-slate-500">/5</span>
    </div>
  );
}

function ProductCard({ name, price, imageUrl, rating = 4.7, tag, href }) {
  const navigate = useNavigate();
  return (
    <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
        {tag ? (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur">
            {tag}
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-slate-900">{name}</p>
            <p className={`mt-1 text-sm font-extrabold ${ACCENT}`}>{price}</p>
          </div>
          <Rating value={rating} />
        </div>

        <button
          type="button"
          onClick={() => navigate(href)}
          className={`mt-4 w-full rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-4 py-2.5 text-sm font-semibold text-white transition`}
        >
          Customize & Order
        </button>
      </div>
    </div>
  );
}

export default function FeaturedProducts({ products }) {
  return (
    <section className="border-y bg-slate-50 py-12 sm:py-16">
      <Container>
        <FadeUp>
          <div className="text-center mx-auto max-w-2xl">
            <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
              Featured
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Best-selling prints & frames
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Choose a style, upload your image and we’ll handle printing and delivery.
            </p>
          </div>
        </FadeUp>

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <motion.div key={p.name} variants={item}>
              <ProductCard {...p} />
            </motion.div>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
