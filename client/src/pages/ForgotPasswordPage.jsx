// client/src/pages/ForgotPasswordPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Forgot Password — split-screen layout matching Login / Signup.
// ALL existing logic preserved exactly.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from "lucide-react";
import api from "../lib/api.js";

const ACCENT = "#FF633F";

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF633F]/60 focus:bg-white focus:ring-2 focus:ring-[#FF633F]/10 disabled:opacity-60";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#fafafa] font-sans antialiased">

      {/* ── Left dark panel ──────────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 px-12 py-14 lg:flex lg:w-5/12 xl:w-2/5">
        <div
          className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full opacity-10 blur-2xl"
          style={{ background: ACCENT }}
        />

        <img
          src="/logo.png"
          alt="Golden Art Frames"
          className="relative h-10 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
        />

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
            Account recovery
          </p>
          <h2 className="mt-3 text-3xl font-extrabold leading-snug text-white">
            Happens To<br />The Best Of Us.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/40">
            Enter your email and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>

        <p className="relative text-xs text-white/20">
          © {new Date().getFullYear()} Golden Art Frames
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <img
            src="/logo.png"
            alt="Golden Art Frames"
            className="mx-auto mb-8 h-9 w-auto object-contain lg:hidden"
          />

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Success state ──────────────────────────────── */
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: `${ACCENT}18` }}
                >
                  <CheckCircle className="h-8 w-8" style={{ color: ACCENT }} />
                </div>
                <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Check your inbox!</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  If an account exists for{" "}
                  <span className="font-bold text-slate-700">{email}</span>, a reset link has been
                  sent. It expires in <b>1 hour</b>.
                </p>
                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
                  style={{ color: ACCENT }}
                >
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Link>
              </motion.div>
            ) : (
              /* ── Form state ─────────────────────────────────── */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-2xl font-extrabold text-slate-900">Forgot Password?</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Remember it?{" "}
                  <Link to="/login" className="font-bold hover:underline" style={{ color: ACCENT }}>
                    Log in
                  </Link>
                </p>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key={error}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={INPUT}
                        required
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #e8472a 100%)` }}
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send Reset Link
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
