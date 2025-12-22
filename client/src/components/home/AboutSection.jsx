// client/src/components/home/AboutSection.jsxx
import { Link } from "react-router-dom";
import { Container, ACCENT_BG, ACCENT_HOVER } from "./ui.jsx";
import { FadeUp } from "../motion/MotionWrappers.jsx";

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold tracking-wide uppercase text-amber-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

export default function AboutSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <FadeUp>
              <SectionHeader
                eyebrow="About"
                title="Made-to-order prints, frames & mounts"
                subtitle="Upload your photo, choose size and finish, then we print and frame using premium materials and deliver safely."
              />
            </FadeUp>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/about" className="rounded-2xl border bg-white p-5 shadow-sm cursor-pointer transition hover:-translate-y-2 hover:shadow-md">
                <p className="font-extrabold text-slate-900">Museum-style finish</p>
                <p className="mt-1 text-sm text-slate-600">
                  Clean cuts, sharp colors, and premium paper.
                </p>
              </Link>
              <Link to="/delivery" className="rounded-2xl border bg-white p-5 shadow-sm cursor-pointer transition hover:-translate-y-2 hover:shadow-md">
                <p className="font-extrabold text-slate-900">Safe delivery</p>
                <p className="mt-1 text-sm text-slate-600">
                  Corner protection + secure packaging.
                </p>
              </Link>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
              >
                Learn more
              </Link>
              <Link
                to="/products"
                className={`inline-flex items-center justify-center rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white`}
              >
                Start Designing
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="aspect-4/5 overflow-hidden rounded-3xl border bg-slate-100 shadow-sm">
                <img
                  src="./about1.jfif"
                  alt="Frames"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="aspect-4/5 overflow-hidden rounded-3xl border bg-slate-100 shadow-sm sm:mt-10">
                <img
                  src="./about2.jfif"
                  alt="Wall art"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
