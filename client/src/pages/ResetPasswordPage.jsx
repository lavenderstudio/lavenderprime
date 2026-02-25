// client/src/pages/ResetPasswordPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Reset Password — split-screen layout matching Login / Signup.
// ALL existing logic preserved exactly.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldAlert, AlertCircle } from "lucide-react";
import api from "../lib/api.js";

const ACCENT = "#FF633F";

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF633F]/60 focus:bg-white focus:ring-2 focus:ring-[#FF633F]/10 disabled:opacity-60";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token    = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login", { state: { resetSuccess: true } });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared left panel ──────────────────────────────────────────────────── */
  const LeftPanel = ({ tagline, sub }) => (
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
        <h2 className="mt-3 text-3xl font-extrabold leading-snug text-white">{tagline}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/40">{sub}</p>
      </div>
      <p className="relative text-xs text-white/20">
        © {new Date().getFullYear()} Golden Art Frames
      </p>
    </div>
  );

  /* ── Invalid / missing token ────────────────────────────────────────────── */
  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-[#fafafa] font-sans antialiased">
        <LeftPanel
          tagline={"Link\nexpired?"}
          sub="Request a new reset link and we'll send a fresh one to your inbox."
        />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <img
              src="/logo.png"
              alt="Golden Art Frames"
              className="mx-auto mb-8 h-9 w-auto object-contain lg:hidden"
            />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <ShieldAlert className="h-8 w-8 text-rose-500" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Invalid reset link</h1>
            <p className="mt-2 text-sm text-slate-500">
              This link is missing a reset token. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-flex items-center gap-1.5 rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #e8472a 100%)` }}
            >
              Request a reset link
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Main form ──────────────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#fafafa] font-sans antialiased">
      <LeftPanel
        tagline={"Almost\nThere."}
        sub="Choose a strong new password and you'll be back in no time."
      />

      {/* Right panel */}
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

          <h1 className="text-2xl font-extrabold text-slate-900">Set A New Password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Must be at least 8 characters long.
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
            {/* New password */}
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={INPUT + " pr-10"}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showCf ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`${INPUT} pr-10 ${
                    confirm && password !== confirm ? "border-rose-300 focus:ring-rose-100" : ""
                  }`}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCf((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="mt-1 text-xs font-semibold text-rose-500">Passwords don&apos;t match</p>
              )}
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
                  Resetting…
                </>
              ) : "Reset Password"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
