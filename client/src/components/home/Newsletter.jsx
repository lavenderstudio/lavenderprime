// client/src/components/home/Newsletter.jsx
// ----------------------------------------------------
// Newsletter signup CTA
// ----------------------------------------------------

import { Container, ACCENT, ACCENT_BG, ACCENT_HOVER } from "./ui.jsx";
import { FadeUp } from "../motion/MotionWrappers.jsx";

export default function Newsletter() {
  return (
    <section className="border-t bg-white py-12">
      <Container>
        <FadeUp>
          <div className="rounded-3xl border bg-linear-to-r from-blue-100 via-white to-white p-6 shadow-sm sm:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className={`text-sm font-extrabold ${ACCENT}`}>Newsletter</p>
                <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                  Get offers & new collections
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Discounts, framing tips, and new product drops — straight to your inbox.
                </p>
              </div>

              <form
                className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: Connect to backend later: POST /api/newsletter/subscribe
                  alert("Subscribed (demo)");
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm font-semibold outline-none focus:border-slate-900"
                />
                <button
                  type="submit"
                  className={`h-12 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 text-sm font-extrabold text-white transition`}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
