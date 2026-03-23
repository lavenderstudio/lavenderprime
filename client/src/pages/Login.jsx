// ─────────────────────────────────────────────────────────────────────────────
// Museum Design — Cyan × Magenta pure on White
// Full-bleed · Vietnamese · Gallery Experience
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

// ─── Bảng màu ────────────────────────────────────────────────────────────────
const C = "#00e5ff";   // cyan thuần
const M = "#e040fb";   // magenta thuần
const CM = C;

const INPUT_STYLE = 
  "w-full border-b-2 border-slate-100 bg-transparent py-4 pl-10 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-[#00e5ff] disabled:opacity-50";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/";
  const resetSuccess = location.state?.resetSuccess || false;

  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="flex min-h-screen bg-white font-sans antialiased overflow-hidden">
      
      {/* ── Khối trái: Editorial Image ────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden border-r border-slate-100">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          src="./hero/hero-2.avif" // Dùng chung asset với HomePage
          className="absolute inset-0 h-full w-full object-cover"
          alt="Gallery View"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        
        {/* Overlay nội dung kiểu bảo tàng */}
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link to="/" className="w-fit">
             <span className="font-mono text-xs tracking-[0.4em] font-bold text-slate-900 border-b-2 border-cyan-400 pb-1">
               GOLDEN ART
             </span>
          </Link>

          <div>
            <span className="font-mono text-[10px] tracking-[0.5em] text-slate-500 uppercase mb-4 block">
              Thành viên / Truy cập
            </span>
            <h2 className="text-6xl font-extrabold tracking-tighter leading-[0.9] text-slate-900">
              Chào mừng<br />
              <span style={{ color: "transparent", WebkitTextStroke: `1.5px ${M}` }}>Trở lại</span><br />
              Phòng tranh.
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-slate-900" />
            <p className="text-xs font-mono tracking-widest text-slate-400 italic">
              Est. 2025 — UAE Quality
            </p>
          </div>
        </div>
      </div>

      {/* ── Khối phải: Minimal Form ──────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative">
        
        {/* Accent line chuẩn HomePage */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: C }} />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <header className="mb-12">
            <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Đăng Nhập</h1>
            <div className="mt-2 flex items-center gap-3">
               <div className="h-px w-6" style={{ background: M }} />
               <p className="text-sm text-slate-400 font-medium">
                Chưa có tài khoản?{" "}
                <Link to="/signup" className="text-slate-900 font-bold hover:underline decoration-cyan-400 underline-offset-4">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </header>

          {/* Thông báo lỗi / Thành công */}
          <AnimatePresence mode="wait">
            {resetSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-3 bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border-l-4 border-emerald-500"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mật khẩu đã được đặt lại! Bạn có thể đăng nhập.</span>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-3 bg-rose-50 p-4 text-xs font-bold text-rose-700 border-l-4 border-rose-500"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email */}
            <div className="relative group">
              <label className="absolute -top-6 left-0 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors group-focus-within:text-cyan-500">
                Địa chỉ Email
              </label>
              <Mail className="absolute left-0 top-4 h-4 w-4 text-slate-300 group-focus-within:text-cyan-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten-cua-ban@vi-du.com"
                className={INPUT_STYLE}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute -top-6 left-0 right-0 flex justify-between">
                <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-magenta-500">
                  Mật mã
                </label>
                <Link to="/forgot-password" style={{ color: M }} className="text-[10px] font-bold uppercase tracking-widest hover:opacity-70">
                  Quên?
                </Link>
              </div>
              <Lock className="absolute left-0 top-4 h-4 w-4 text-slate-300 group-focus-within:text-purple-500" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={INPUT_STYLE + " pr-10"}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-0 top-4 text-slate-300 hover:text-slate-600"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Submit Button - Chuẩn Magnet/Museum Style */}
            <div className="pt-4">
              <motion.button
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-between bg-slate-900 px-8 py-5 text-xs font-extrabold uppercase tracking-[0.3em] text-white transition-all hover:bg-black disabled:opacity-50"
                style={{ borderRadius: 2 }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang xác thực...
                  </span>
                ) : (
                  <>
                    Tiếp tục vào Gallery
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <footer className="mt-16 pt-8 border-t border-slate-100">
            <p className="font-mono text-[9px] text-slate-300 tracking-[0.3em] uppercase">
              Bảo mật bởi SSL Layer / © 2025 Golden Art UAE
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
