// client/src/components/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Nền tối · Full width · Nunito font · Cyan × Magenta
// Chiều cao 72px · Chữ hoa · Active = màu cyan (không gạch chân, không nền)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, ShoppingCart, User, X,
  ChevronDown, Settings, LogOut, ClipboardList,
} from "lucide-react";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import { useAuth } from "../context/AuthContext.jsx";

const C = "#00e5ff";
const M = "#e040fb";

const NAV_LINKS = [
  { to: "/",         label: "TRANG CHỦ"    },
  { to: "/products", label: "SẢN PHẨM"     },
  { to: "/about",    label: "VỀ CHÚNG TÔI" },
  { to: "/delivery", label: "GIAO HÀNG"    },
  { to: "/blog",     label: "BLOG"          },
  { to: "/contact",  label: "LIÊN HỆ"      },
];

// ─── NavLink — active chỉ đổi màu chữ, không gạch chân, không nền ────────────
function NavLink({ to, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative px-3.5 py-2 text-xs font-bold tracking-widest transition-colors duration-200"
      style={{
        fontFamily: "'Nunito', sans-serif",
        color:      active ? C : "rgba(255,255,255,0.55)",
        background: "transparent",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
    >
      {label}
    </Link>
  );
}

// ─── Dropdown item ────────────────────────────────────────────────────────────
function DropItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-150 ${
        danger
          ? "text-rose-400 hover:bg-rose-500/10"
          : "text-slate-300 hover:bg-white/8 hover:text-white"
      }`}
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const sessionId = useMemo(() => getSessionId(), []);
  const { user: me, setUser } = useAuth();
  const isStaff = !!me && ["admin", "manager"].includes(me.role);

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartCount,   setCartCount]   = useState(0);

  const desktopDropRef  = useRef(null);
  const mobileButtonRef = useRef(null);
  const mobileDropRef   = useRef(null);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get(`/cart/${sessionId}`)
      .then(res => {
        if (cancelled) return;
        const items = res.data?.items || [];
        setCartCount(items.reduce((s, it) => s + (Number(it?.config?.quantity) || 1), 0));
      })
      .catch(() => { if (!cancelled) setCartCount(0); });
    return () => { cancelled = true; };
  }, [sessionId, location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      const inD  = desktopDropRef.current?.contains(e.target)  ?? false;
      const inMB = mobileButtonRef.current?.contains(e.target) ?? false;
      const inMD = mobileDropRef.current?.contains(e.target)   ?? false;
      if (!inD && !inMB && !inMD) setAccountOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") { setAccountOpen(false); setMobileOpen(false); }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setUser(null);
    setAccountOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          fontFamily:    "'Nunito', sans-serif",
          background:    scrolled ? "rgba(10,10,13,0.97)" : "#0d0d10",
          backdropFilter:"blur(20px)",
          borderBottom:  "1px solid rgba(255,255,255,0.06)",
          boxShadow:     scrolled ? "0 4px 40px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Đường accent top cyan→magenta */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${C} 0%, ${M} 100%)` }}
        />

        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center gap-3">

            {/* ── Logo trái ──────────────────────────────────────────── */}
            <Link to="/" className="flex-shrink-0 mr-4">
              <motion.img
                src="/logo.png"
                alt="Golden Art Frames"
                className="h-10 w-auto brightness-0 invert"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              />
            </Link>

            {/* ── Desktop nav ───────────────────────────────────────── */}
            <nav className="hidden items-center gap-1 lg:flex flex-1">
              {NAV_LINKS.map(l => (
                <NavLink key={l.to} {...l} active={isActive(l.to)} />
              ))}
            </nav>

            {/* ── Desktop right ─────────────────────────────────────── */}
            <div className="hidden items-center gap-2 lg:flex ml-auto">

              {/* Admin */}
              {isStaff && (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => navigate("/admin")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-all hover:border-white/20 hover:bg-white/8 hover:text-white"
                  title="Admin"
                >
                  <Settings size={15} />
                </motion.button>
              )}

              {/* Auth — chưa đăng nhập */}
              {!me ? (
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-4 py-2 text-xs font-bold tracking-widest uppercase text-slate-300 transition-all duration-200 hover:border-white/30 hover:bg-white/12 hover:text-white"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <User size={14} />
                  ĐĂNG NHẬP
                </Link>
              ) : (
                <div ref={desktopDropRef} className="relative">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setAccountOpen(v => !v); setMobileOpen(false); }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-bold tracking-widest uppercase text-slate-300 transition-all duration-200 hover:border-white/25 hover:bg-white/12 hover:text-white"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                    aria-expanded={accountOpen}
                  >
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-xs font-extrabold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${C}, ${M})`, color: "#0a0a0a" }}
                    >
                      {(me.fullName?.[0] || me.email?.[0] || "U").toUpperCase()}
                    </span>
                    <span className="hidden max-w-28 truncate sm:block">
                      {me.fullName?.split(" ")[0] || me.email}
                    </span>
                    <motion.span
                      animate={{ rotate: accountOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={13} className="text-slate-500" />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 py-2 shadow-2xl"
                        style={{ background: "#16161a", fontFamily: "'Nunito', sans-serif" }}
                      >
                        <div className="h-px w-full mb-2" style={{ background: `linear-gradient(90deg, ${C}, ${M})` }} />
                        <div className="px-2">
                          <DropItem icon={ClipboardList} label="Đơn Hàng"  onClick={() => { setAccountOpen(false); navigate("/orders"); }} />
                          <DropItem icon={User}          label="Tài Khoản" onClick={() => { setAccountOpen(false); navigate("/account"); }} />
                          {isStaff && (
                            <DropItem icon={Settings} label="Admin" onClick={() => { setAccountOpen(false); navigate("/admin"); }} />
                          )}
                          <div className="my-2 h-px bg-white/8" />
                          <DropItem icon={LogOut} label="Đăng Xuất" onClick={handleLogout} danger />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Cart */}
              <motion.div whileTap={{ scale: 0.93 }}>
                <Link
                  to="/cart"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-all duration-200"
                  onMouseEnter={e => {
                    e.currentTarget.style.background  = C;
                    e.currentTarget.style.borderColor = C;
                    e.currentTarget.style.color       = "#0a0a0a";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background  = "transparent";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                    e.currentTarget.style.color       = "#94a3b8";
                  }}
                  aria-label="Giỏ hàng"
                >
                  <ShoppingCart size={15} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold"
                        style={{ background: C, color: "#0a0a0a" }}
                      >
                        {cartCount > 99 ? "99+" : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            </div>

            {/* ── Mobile right ──────────────────────────────────────── */}
            <div ref={mobileButtonRef} className="flex items-center gap-2 ml-auto lg:hidden">
              <Link
                to="/cart"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/8 hover:text-white"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart size={15} />
                {cartCount > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-extrabold"
                    style={{ background: C, color: "#0a0a0a" }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {!me ? (
                <Link
                  to="/login"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/8 hover:text-white"
                  aria-label="Đăng nhập"
                >
                  <User size={15} />
                </Link>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => { setAccountOpen(v => !v); setMobileOpen(false); }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold"
                  style={{ background: `linear-gradient(135deg, ${C}, ${M})`, color: "#0a0a0a" }}
                  aria-label="Tài khoản"
                >
                  {accountOpen
                    ? <X size={14} />
                    : (me.fullName?.[0] || me.email?.[0] || "U").toUpperCase()}
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => { setMobileOpen(v => !v); setAccountOpen(false); }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/8 hover:text-white"
                aria-label="Menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "x" : "m"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.14 }}
                  >
                    {mobileOpen ? <X size={15} /> : <Menu size={15} />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* ── Mobile account dropdown ──────────────────────────────── */}
          <AnimatePresence>
            {me && accountOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden lg:hidden"
                ref={mobileDropRef}
              >
                <div
                  className="mb-3 rounded-2xl border border-white/10 py-2"
                  style={{ background: "#16161a", fontFamily: "'Nunito', sans-serif" }}
                >
                  <div className="h-px w-full mb-2" style={{ background: `linear-gradient(90deg, ${C}, ${M})` }} />
                  <div className="px-2">
                    <DropItem icon={ShoppingCart}  label="Giỏ Hàng"  onClick={() => { setAccountOpen(false); navigate("/cart"); }} />
                    <DropItem icon={ClipboardList} label="Đơn Hàng"  onClick={() => { setAccountOpen(false); navigate("/orders"); }} />
                    <DropItem icon={User}          label="Tài Khoản" onClick={() => { setAccountOpen(false); navigate("/account"); }} />
                    {isStaff && (
                      <DropItem icon={Settings} label="Admin" onClick={() => { setAccountOpen(false); navigate("/admin"); }} />
                    )}
                    <div className="my-2 h-px bg-white/8" />
                    <DropItem icon={LogOut} label="Đăng Xuất" onClick={handleLogout} danger />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col shadow-2xl lg:hidden"
              style={{
                background:  "#0d0d10",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                fontFamily:  "'Nunito', sans-serif",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${C}, ${M})` }}
              />

              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <img src="/logo.png" alt="Golden Art Frames" className="h-8 w-auto brightness-0 invert" />
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/8 hover:text-white transition"
                >
                  <X size={14} />
                </motion.button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
                {NAV_LINKS.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-200"
                      style={{
                        color:      isActive(l.to) ? C : "rgba(255,255,255,0.55)",
                        background: "transparent",
                      }}
                    >
                      {isActive(l.to) && (
                        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: C }} />
                      )}
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {!me && (
                <div className="px-4 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-2xl py-3.5 text-center text-xs font-bold tracking-widest uppercase transition hover:opacity-90"
                    style={{ background: `linear-gradient(90deg, ${C}, ${M})`, color: "#0a0a0a" }}
                  >
                    ĐĂNG NHẬP / ĐĂNG KÝ
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
