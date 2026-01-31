import { useState } from "react";
import { Container, ACCENT, ACCENT_BG, ACCENT_HOVER } from "./ui.jsx";
import { FadeUp } from "../motion/MotionWrappers.jsx";
import api from "../../lib/api.js"; // ✅ use your existing axios instance

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      // ✅ Call your backend
      const { data } = await api.post("/newsletter/subscribe", { email });

      // ✅ Show response to user
      setMsg(data?.message || "Subscribed!");
      setEmail("");
    } catch (err) {
      // ✅ Show a friendly error
      const message =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-t bg-white py-12">
      <Container>
        <FadeUp>
          <div className="rounded-3xl border bg-linear-to-r from-[#FF633F]/25 via-white to-white p-6 shadow-[5px_5px_5px_0_rgba(0,0,0,0.6)] sm:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className={`text-sm font-extrabold ${ACCENT}`}>Newsletter</p>
                <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                  Get offers & new collections
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Discounts, framing tips, and new product drops — straight to your inbox.
                </p>

                {/* ✅ Feedback message */}
                {msg ? (
                  <p className="mt-3 text-sm font-semibold text-slate-700">{msg}</p>
                ) : null}
              </div>

              <form
                className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={onSubmit}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm font-semibold outline-none focus:border-slate-900"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 sm:w-auto`}
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
