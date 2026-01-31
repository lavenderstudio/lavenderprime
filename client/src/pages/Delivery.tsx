// client/src/pages/Delivery.jsx
// ----------------------------------------------------
// Delivery Page (Print & Frame)
// - How to order (steps)
// - Packaging process (safe & premium)
// - Delivery timeline + tracking
// - FAQs + CTA
// Uses Tailwind + Framer Motion for smooth section reveals
// ----------------------------------------------------

import { Link } from "react-router-dom";
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
import { motion } from "framer-motion";
import { FadeUp, Stagger, item } from "../components/motion/MotionWrappers.jsx";
import { Container, ACCENT, ACCENT_BG, ACCENT_HOVER } from "../components/home/ui.jsx";

function StepCard({ icon: Icon, title, text, number }) {
  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)]"
    >
      {/* Step number bubble */}
      <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-extrabold text-white">
        {number}
      </div>

      <div className={`grid h-11 w-11 place-items-center rounded-xl bg-[#FF633F]/15 ${ACCENT}`}>
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-base font-extrabold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </motion.div>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <motion.div variants={item} className="rounded-2xl border bg-white p-5 shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)]">
      <div className={`grid h-11 w-11 place-items-center rounded-xl bg-[#FF633F]/15 ${ACCENT}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-extrabold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </motion.div>
  );
}

function FAQ({ q, a }) {
  return (
    <motion.div variants={item} className="rounded-2xl border bg-white p-5 shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)]">
      <p className="text-sm font-extrabold text-slate-900">{q}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{a}</p>
    </motion.div>
  );
}

export default function Delivery() {
  const orderSteps = [
    {
      icon: ImageIcon,
      title: "Upload your photo / artwork",
      text:
        "Choose your image from phone or desktop. We recommend high resolution for the sharpest print.",
    },
    {
      icon: Ruler,
      title: "Pick size, frame & finish",
      text:
        "Select dimensions, frame colour, mount (optional) and paper type. Preview updates live.",
    },
    {
      icon: CreditCard,
      title: "Checkout securely",
      text:
        "Add delivery details, pay securely, and you’ll receive an order confirmation instantly.",
    },
    {
      icon: ClipboardList,
      title: "We produce your order",
      text:
        "We print, frame, quality-check, then package your order carefully for safe travel.",
    },
  ];

  const packaging = [
    {
      icon: ShieldCheck,
      title: "Corner & edge protection",
      text:
        "Frames are protected with corner guards and edge padding to prevent knocks and scuffs.",
    },
    {
      icon: Box,
      title: "Multi-layer wrap",
      text:
        "We wrap the item using protective layers to reduce movement inside the box during transit.",
    },
    {
      icon: PackageCheck,
      title: "Rigid box + sealing",
      text:
        "Packed in a strong outer box and sealed securely to keep the product stable and protected.",
    },
  ];

  const delivery = [
    {
      icon: Truck,
      title: "Doorstep delivery",
      text:
        "Your order is delivered to your address. Please ensure someone is available to receive it.",
    },
    {
      icon: MapPin,
      title: "Tracking updates",
      text:
        "Once shipped, you can track your order using your order reference on the Track Order page.",
    },
    {
      icon: Clock,
      title: "Estimated timelines",
      text:
        "Most orders dispatch in 1–3 working days, depending on size, framing and customisation.",
    },
    {
      icon: BadgeCheck,
      title: "Quality checks before dispatch",
      text:
        "We inspect print sharpness, alignment, and frame finishing before anything leaves our workspace.",
    },
  ];

  const faqs = [
    {
      q: "How long does delivery take?",
      a:
        "Production usually takes 1–3 working days. Delivery depends on your location and courier service. You’ll get tracking once shipped.",
    },
    {
      q: "What if my frame arrives damaged?",
      a:
        "Message us with photos of the packaging and the product within 24–48 hours of delivery. We’ll review and sort a replacement or solution quickly.",
    },
    {
      q: "Can I change my address after ordering?",
      a:
        "If your order hasn’t shipped yet, contact us ASAP. Once shipped, changes may depend on courier policies.",
    },
    {
      q: "Do you deliver to apartments / flats?",
      a:
        "Yes. Add clear delivery instructions (building name, floor, access code). Couriers deliver to the doorstep where possible.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-[#FF633F]/10 via-white to-white">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#FF633F]/20 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-[#FF633F]/20 blur-3xl" />

        <Container className="py-10 sm:py-14">
          <FadeUp>
            <div className="max-w-3xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                Delivery & Packaging
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                How we deliver your prints & frames safely to your doorstep
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                From upload → printing → framing → packaging → courier delivery, every step is designed
                to protect your order and keep quality premium.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105`}
                >
                  Start Designing <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  <span
                  className="
                    relative after:absolute after:left-0
                    after:-bottom-1 after:h-0.5
                    after:w-full after:origin-left flex items-center gap-2
                    after:scale-x-0 after:bg-[#FF633F]
                    after:transition-transform after:duration-300
                    after:ease-out group-hover:after:scale-x-100
                  "
                  >
                    Contact Us <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* How to order */}
      <section className="py-12 sm:py-16">
        <Container>
          <FadeUp>
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                How to order
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Place an order in minutes
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Simple flow: upload → customise → checkout → we produce and ship.
              </p>
            </div>
          </FadeUp>

          <Stagger className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {orderSteps.map((s, idx) => (
              <StepCard
                key={s.title}
                number={idx + 1}
                icon={s.icon}
                title={s.title}
                text={s.text}
              />
            ))}
          </Stagger>

          <FadeUp>
            <div className="mt-8 rounded-2xl border bg-slate-50 p-5 text-sm text-slate-700 shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)]">
              <span className="font-extrabold text-slate-900">Pro tip:</span>{" "}
              For the sharpest results, use high-resolution photos and avoid screenshots where possible.
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* Packaging */}
      <section className="border-y bg-slate-50 py-12 sm:py-16">
        <Container>
          <FadeUp>
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                Packaging
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                How we package your frame
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Frames and prints are fragile — we package with impact protection and rigid boxing.
              </p>
            </div>
          </FadeUp>

          <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
            {packaging.map((p) => (
              <InfoCard key={p.title} icon={p.icon} title={p.title} text={p.text} />
            ))}
          </Stagger>

          <FadeUp>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-5 shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)]">
                <p className="text-sm font-extrabold text-slate-900">Before we seal the box</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li>Print quality check (sharpness, color, alignment)</li>
                  <li>Frame finishing check (corners, mounts, cleanliness)</li>
                  <li>Secure fit check (no movement inside packaging)</li>
                </ul>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)]">
                <p className="text-sm font-extrabold text-slate-900">When you receive the parcel</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li>Inspect the outer box before opening</li>
                  <li>Keep packaging until you’re happy with the product</li>
                  <li>If anything looks wrong, take photos and contact support</li>
                </ul>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* Delivery */}
      <section className="py-12 sm:py-16">
        <Container>
          <FadeUp>
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                Delivery
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                From our workshop to your doorstep
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Once produced, we dispatch using reliable couriers with tracking where available.
              </p>
            </div>
          </FadeUp>

          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {delivery.map((d) => (
              <InfoCard key={d.title} icon={d.icon} title={d.title} text={d.text} />
            ))}
          </Stagger>
        </Container>
      </section>

      {/* FAQs */}
      <section className="border-t bg-slate-50 py-12 sm:py-16">
        <Container>
          <FadeUp>
            <div className="max-w-2xl">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
                FAQs
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Delivery questions
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Common questions customers ask before ordering.
              </p>
            </div>
          </FadeUp>

          <Stagger className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <FAQ key={f.q} q={f.q} a={f.a} />
            ))}
          </Stagger>

          <FadeUp>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className={`inline-flex items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105`}
              >
                Start an Order <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeUp>
        </Container>
      </section>
    </div>
  );
}
