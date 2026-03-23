// ─────────────────────────────────────────────────────────────────────────────
// Signup Page — Museum Archive Aesthetic (Cyan × Magenta)
// Tràn viền · Việt ngữ · Đối xứng bất đối xứng
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import api from "../lib/api.js";

// ─── Bảng màu đồng nhất ──────────────────────────────────────────────────────
const C = "#00e5ff";   // cyan thuần
const M = "#e040fb";   // magenta thuần
const CM = C;

const INPUT_STYLE = 
  "w-full border-b-2 border-slate-100 bg-transparent py-4 pl-10 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-[#00e5ff] disabled:opacity-50";

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await api.post("/auth/register", { fullName, email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Đã xảy ra lỗi khi đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased overflow-hidden">
      
      {/* ─── CỘT TRÁI: Gallery Visual (Tràn viền) ─────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-slate-50 overflow-hidden border-r border-slate-100">
        {/* Ảnh nền trừu tượng hoặc ảnh sản phẩm high-end */}
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="./hero/hero-2.avif" 
          className="absolute inset-0 h-full w-full object-cover"
          alt="Art Gallery"
        />
        
        {/* Overlay dốc trắng đặc trưng bảo tàng */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-transparent" />
        
        {/* Đường kẻ Accent dọc */}
        <div className="absolute right-0 top-0 bottom-0 w-1" style={{ background: C }} />

        <div className="relative z-10 flex flex-col justify-between p-20">
          <Link to="/" className="group flex items-center gap-2">
            <div className="h-8 w-1" style={{ background: M }} />
            <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase">Trang Chủ</span>
          </Link>

          <div>
            <span className="font-mono text-xs font-bold tracking-[0.4em]" style={{ color: M }}>
              01 / KHỞI TẠO
            </span>
            <h2 className="mt-6 font-extrabold leading-[0.95] tracking-tighter text-slate-900" style={{ fontSize: "clamp(3rem, 5vw, 5rem)" }}>
              Lưu giữ<br /> 
              <span style={{ WebkitTextStroke: `1.5px ${C}`, color: "transparent" }}>Kỷ niệm</span><br />
              Của bạn.
            </h2>
            <p className="mt-8 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
              Gia nhập cộng đồng nghệ thuật để cá nhân hóa không gian sống với chất lượng phòng trưng bày UAE.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              © 2026 Golden Art Frames
            </span>
          </div>
        </div>
      </div>

      {/* ─── CỘT PHẢI: Form (Minimalist) ─────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-10 sm:px-20 lg:px-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-md"
        >
          {/* Header Form */}
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Đăng ký thành viên</h1>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-slate-400">Đã có tài khoản?</span>
              <Link
                to="/login"
                state={{ from: redirectTo }}
                className="font-bold underline decoration-2 underline-offset-4 transition-colors hover:text-[#e040fb]"
                style={{ color: M }}
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 flex items-center gap-3 overflow-hidden rounded-sm border-l-4 border-rose-500 bg-rose-50 p-4 text-sm font-bold text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-8">
            
            {/* Full Name */}
            <div className="group relative">
              <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-[#00e5ff]">
                Họ và Tên
              </label>
              <User className="absolute bottom-4 left-0 h-5 w-5 text-slate-300" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className={INPUT_STYLE}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="group relative">
              <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-[#00e5ff]">
                Địa chỉ Email
              </label>
              <Mail className="absolute bottom-4 left-0 h-5 w-5 text-slate-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vi-du@email.com"
                className={INPUT_STYLE}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-[#00e5ff]">
                Mật khẩu
              </label>
              <Lock className="absolute bottom-4 left-0 h-5 w-5 text-slate-300" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                className={INPUT_STYLE + " pr-12"}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute bottom-4 right-0 text-slate-300 transition hover:text-slate-600"
              >
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                whileHover={{ x: 8 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-between bg-slate-900 px-8 py-5 text-sm font-extrabold uppercase tracking-widest text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                style={{ borderRadius: 2 }}
              >
                {loading ? "Đang xử lý..." : "Tạo tài khoản"}
                <ArrowRight className="h-5 w-5" style={{ color: C }} />
              </motion.button>
            </div>
          </form>

          {/* Footer Form Mobile */}
          <p className="mt-12 text-center font-mono text-[9px] uppercase tracking-widest text-slate-300 lg:hidden">
            Golden Art Frames — Dubai / UAE
          </p>
        </motion.div>
      </div>
    </div>
  );
}
