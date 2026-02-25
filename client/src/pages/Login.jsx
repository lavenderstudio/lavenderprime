// client/src/pages/Login.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Login page — split-screen layout.
// ALL existing logic preserved exactly.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ACCENT = "#FF633F";

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF633F]/60 focus:bg-white focus:ring-2 focus:ring-[#FF633F]/10 disabled:opacity-60";

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const redirectTo     = location.state?.from || "/";
  const resetSuccess   = location.state?.resetSuccess || false;

  const { setUser } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      await api.post("/auth/login", { email, password });
      const meRes = await api.get("/auth/me");
      setUser(meRes.data?.user || null);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setUser(null);
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#fafafa] font-sans antialiased">

      {/* ── Left dark panel ──────────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 px-12 py-14 lg:flex lg:w-5/12 xl:w-2/5">
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full opacity-10 blur-2xl"
          style={{ background: ACCENT }}
        />

        {/* Logo */}
        <img
          src="/logo.png"
          alt="Golden Art Frames"
          className="relative h-10 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
        />

        {/* Tagline */}
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
            Welcome back
          </p>
          <h2 className="mt-3 text-3xl font-extrabold leading-snug text-white">
            Frames That Tell<br />Your Story.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/40">
            Login to continue to your orders, favourites, and personalised frames.
          </p>
        </div>

        {/* Bottom quote */}
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

          <h1 className="text-2xl font-extrabold text-slate-900">Log In</h1>
          <p className="mt-1 text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              state={{ from: redirectTo }}
              className="font-bold hover:underline"
              style={{ color: ACCENT }}
            >
              Sign Up
            </Link>
          </p>

          {/* Banners */}
          <AnimatePresence>
            {resetSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span><b>Password reset!</b> You can now log in with your new password.</span>
              </motion.div>
            )}
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

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Email
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

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold hover:underline"
                  style={{ color: ACCENT }}
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={INPUT + " pr-10"}
                  required
                  autoComplete="current-password"
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

            {/* Submit */}
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
                  Logging In…
                </>
              ) : "Log In"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
