/* eslint-disable no-unused-vars */
// client/src/pages/About.jsx
// ----------------------------------------------------
// SEO-Friendly About Page for Golden Art Frames
// - Keyword-rich (naturally) headings + copy
// - Meta tags via react-helmet-async
// - Mobile-first responsive layout (Tailwind)
// - Smooth reveal animations (Framer Motion wrappers)
// ----------------------------------------------------

import { Link } from "react-router-dom";
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
import { motion } from "framer-motion";
import { Container, ACCENT, ACCENT_BG, ACCENT_HOVER } from "../components/home/ui.jsx";

function ValueCard({ icon: Icon, title, text }) {
  return (
    <motion.div variants={item} className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className={`grid h-11 w-11 place-items-center rounded-xl bg-blue-50 ${ACCENT}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-extrabold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </motion.div>
  );
}

function FAQ({ q, a }) {
  return (
    <motion.div variants={item} className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-extrabold text-slate-900">{q}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{a}</p>
    </motion.div>
  );
}

export default function About() {
  const values = [
    {
      icon: ImageIcon,
      title: "Premium printing, sharp detail",
      text:
        "Golden Art Frames focuses on crisp print quality with strong colour accuracy, so your artwork and photos look premium on the wall.",
    },
    {
      icon: ShieldCheck,
      title: "High-quality frames & finishes",
      text:
        "Golden Art Frames offers modern and classic framing styles, mounts, and finishes designed for clean presentation and long-lasting quality.",
    },
    {
      icon: Truck,
      title: "Safe packaging & doorstep delivery",
      text:
        "Every Golden Art Frames order is packaged with corner and edge protection, then delivered carefully to your doorstep with tracking where available.",
    },
    {
      icon: Ruler,
      title: "Custom sizes that fit your space",
      text:
        "From standard sizes to custom measurements, Golden Art Frames helps you create wall art that fits perfectly in bedrooms, living rooms, offices, and galleries.",
    },
    {
      icon: BadgeCheck,
      title: "Quality checks before dispatch",
      text:
        "Golden Art Frames inspects prints, alignment, frame edges, and cleanliness before dispatch, so your order arrives looking exactly as expected.",
    },
    {
      icon: Sparkles,
      title: "Designed for gifting & decor",
      text:
        "Golden Art Frames is built for personal memories, home decor, and gifting—ideal for birthdays, weddings, anniversaries, and corporate spaces.",
    },
  ];

  const faqs = [
    {
      q: "What does Golden Art Frames do?",
      a:
        "Golden Art Frames creates custom prints and frames from your photos or artwork, then packages and delivers them to your address.",
    },
    {
      q: "How do I order from Golden Art Frames?",
      a:
        "Choose a product, upload your image, select size and finish, preview your design, and checkout. Golden Art Frames handles printing, framing, and delivery.",
    },
    {
      q: "Does Golden Art Frames deliver to my doorstep?",
      a:
        "Yes. Golden Art Frames delivers orders to your address with protective packaging to keep frames safe during transit.",
    },
    {
      q: "Can Golden Art Frames do custom sizes?",
      a:
        "Yes. Golden Art Frames supports standard sizes and custom sizing depending on the product type.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-blue-50 via-white to-white">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

        <Container className="py-10 sm:py-14">
          <FadeUp>
            <div className="max-w-3xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                About Golden Art Frames
              </p>

              <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                Golden Art Frames turns your photos and artwork into premium wall art
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Golden Art Frames is a print-and-frame brand built for customers who want high-quality
                printing, clean framing, and safe delivery. Whether you’re printing family photos,
                artwork, or custom designs, Golden Art Frames helps you create wall art that looks
                premium and arrives protected.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition`}
                >
                  Start Designing <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/delivery"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  How Delivery Works <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* Story / Mission */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <FadeUp>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Our mission at Golden Art Frames
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                  Golden Art Frames was created to make professional-quality wall art simple to order
                  online. We focus on premium materials, accurate printing, strong frames, and careful
                  packaging—so your final piece looks clean on the wall and arrives safely at your door.
                </p>

                <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                  From custom sizing to frame finishes, Golden Art Frames is designed for people who care
                  about detail. We build each order with quality checks before dispatch, and we improve our
                  process based on customer feedback.
                </p>

                <div className="mt-6 rounded-2xl border bg-slate-50 p-5 text-sm text-slate-700">
                  <span className="font-extrabold text-slate-900">What we make:</span>{" "}
                  prints, posters, canvas prints, and framed wall art — made to order at Golden Art Frames.
                </div>
              </div>
            </FadeUp>

            {/* Visual block */}
            <FadeUp>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="aspect-4/5 overflow-hidden rounded-3xl border bg-slate-100 shadow-sm">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1681113076872-c74b8926e70c"
                    alt="Golden Art Frames - framed wall art example"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="aspect-4/5 overflow-hidden rounded-3xl border bg-slate-100 shadow-sm sm:mt-10">
                  <img
                    src="https://images.unsplash.com/photo-1634969948017-a9abffad732f"
                    alt="Golden Art Frames - modern frames in interior"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="border-y bg-slate-50 py-12 sm:py-16">
        <Container>
          <FadeUp>
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                Why Golden Art Frames
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Quality, care, and delivery you can trust
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Golden Art Frames is built around premium output, careful packaging, and a smooth ordering experience.
              </p>
            </div>
          </FadeUp>

          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Process (SEO-friendly headings) */}
      <section className="py-12 sm:py-16">
        <Container>
          <FadeUp>
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                Our process
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                How Golden Art Frames creates your framed print
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                We keep it simple: design online, we produce it, then Golden Art Frames delivers it safely.
              </p>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
              <ol className="grid gap-4 md:grid-cols-2">
                <li className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm font-extrabold text-slate-900">1) Design your order</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Upload your photo/artwork and choose size, frame style, and finish on Golden Art Frames.
                  </p>
                </li>
                <li className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm font-extrabold text-slate-900">2) Print & quality check</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Golden Art Frames checks sharpness, colours, alignment, and cleanliness before framing.
                  </p>
                </li>
                <li className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm font-extrabold text-slate-900">3) Frame & finish</p>
                  <p className="mt-2 text-sm text-slate-600">
                    We mount (optional), frame your print, and confirm fit before packaging at Golden Art Frames.
                  </p>
                </li>
                <li className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm font-extrabold text-slate-900">4) Package & deliver</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Corner protection, rigid boxing, then doorstep delivery. See the full delivery page for details.
                  </p>
                </li>
              </ol>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/delivery"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  Delivery & Packaging <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/products"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition`}
                >
                  Shop Golden Art Frames <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t bg-slate-50 py-12 sm:py-16">
        <Container>
          <FadeUp>
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                FAQs
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                About Golden Art Frames
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Answers to common questions customers ask about Golden Art Frames.
              </p>
            </div>
          </FadeUp>

          <Stagger className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <FAQ key={f.q} {...f} />
            ))}
          </Stagger>

          <FadeUp>
            <div className="mt-10 rounded-3xl border bg-linear-to-r from-blue-50 via-white to-white-50 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-sm font-extrabold ${ACCENT}`}>Ready to create?</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    Start your Golden Art Frames order today
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Upload your photo, choose frame and size, and we’ll handle the rest.
                  </p>
                </div>
                <Link
                  to="/products"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition`}
                >
                  Start Designing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>
    </div>
  );
}
