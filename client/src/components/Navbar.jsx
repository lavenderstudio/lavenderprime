// client/src/components/Navbar2.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Navbar — matches HomePage2 theme.
// - Scroll-aware: transparent → frosted glass backdrop
// - Desktop: left links + centered logo + right actions
// - Links: sliding orange underline on hover + active state
// - Mobile: full-screen animated drawer panel
// - Auth: login pill / account avatar dropdown
// - Staff: settings icon
// - Cart: accent icon with badge
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ShoppingCart,
  User,
  X,
  ChevronDown,
  Settings,
  LogOut,
  ClipboardList,
} from "lucide-react";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import { useAuth } from "../context/AuthContext.jsx";

const ACCENT = "#FF633F";

// ─── Nav links config ────────────────────────────────────────────────────────
const LEFT_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/delivery", label: "Delivery" },
];
const RIGHT_LINKS = [
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];
const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

// ─── NavLink with sliding underline ─────────────────────────────────────────
function NavLink({ to, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="group relative text-sm font-semibold transition-all duration-300"
      style={{ color: active ? ACCENT : undefined }}
    >
      <span
        className={`transition-colors duration-300 ${
          active ? "" : "text-slate-600 group-hover:text-slate-900"
        }`}
      >
        {label}
      </span>
      {/* Sliding underline */}
      <span
        className="absolute -bottom-1 left-0 h-[2px] rounded-full transition-all duration-300 ease-out"
        style={{
          background: ACCENT,
          width: active ? "100%" : "0%",
        }}
      />
      {/* On hover when not active, also show partial underline via CSS group-hover */}
      {!active && (
        <span
          className="absolute -bottom-1 left-0 h-[2px] rounded-full origin-left scale-x-0 group-hover:scale-x-100
                     transition-transform duration-300 ease-out"
          style={{ background: ACCENT, width: "100%" }}
        />
      )}
    </Link>
  );
}

// ─── Dropdown item ────────────────────────────────────────────────────────────
function DropItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR2
// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionId = useMemo(() => getSessionId(), []);
  const { user: me, setUser } = useAuth();
  const isStaff = !!me && ["admin", "manager"].includes(me.role);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const desktopDropRef   = useRef(null);
  const mobileButtonRef  = useRef(null);   // avatar button wrapper
  const mobileDropRef    = useRef(null);   // mobile dropdown panel
  const isActive = (path) => location.pathname === path;

  // ── Scroll-aware frosted glass ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Cart count ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    api
      .get(`/cart/${sessionId}`)
      .then((res) => {
        if (cancelled) return;
        const items = res.data?.items || [];
        setCartCount(items.reduce((s, it) => s + (Number(it?.config?.quantity) || 1), 0));
      })
      .catch(() => { if (!cancelled) setCartCount(0); });
    return () => { cancelled = true; };
  }, [sessionId, location.pathname]);

  // ── Close panels on route change ────────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // ── Close dropdown on outside click / ESC ──────────────────────────────
  useEffect(() => {
    const onClick = (e) => {
      const inDesktop = desktopDropRef.current?.contains(e.target)  ?? false;
      const inMobile  = mobileButtonRef.current?.contains(e.target) ?? false;
      const inMobDrop = mobileDropRef.current?.contains(e.target)   ?? false;
      if (!inDesktop && !inMobile && !inMobDrop) setAccountOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setAccountOpen(false); };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    setUser(null);
    setAccountOpen(false);
    navigate("/login", { replace: true });
  };

  // ── Header background ───────────────────────────────────────────────────
  const headerBg = scrolled
    ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60"
    : "bg-white border-b border-slate-100";

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${headerBg}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative flex h-16 items-center justify-between">

            {/* ── Mobile hamburger ──────────────────────────────────── */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => { setMobileOpen((v) => !v); setAccountOpen(false); }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200
                         bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <X size={17} /> : <Menu size={17} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* ── Desktop left links ────────────────────────────────── */}
            <nav className="hidden items-center gap-7 lg:flex">
              {LEFT_LINKS.map((l) => (
                <NavLink key={l.to} {...l} active={isActive(l.to)} />
              ))}
            </nav>

            {/* ── Centered logo ─────────────────────────────────────── */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link to="/" aria-label="Golden Art Frames">
                <motion.img
                  src="/logo.png"
                  alt="Golden Art Frames"
                  className="h-11 w-auto"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </Link>
            </div>

            {/* ── Desktop right actions ─────────────────────────────── */}
            <div className="hidden items-center gap-6 lg:flex">
              {/* Right nav links */}
              {RIGHT_LINKS.map((l) => (
                <NavLink key={l.to} {...l} active={isActive(l.to)} />
              ))}

              {/* Staff settings */}
              {isStaff && (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => navigate("/admin")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200
                             bg-white shadow-sm transition-all duration-200 hover:border-[#FF633F]/40 hover:bg-slate-50"
                  title="Admin"
                >
                  <Settings size={16} className="text-slate-700" />
                </motion.button>
              )}

              {/* Auth */}
              {!me ? (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white
                               px-4 py-2 text-sm font-extrabold text-slate-800 shadow-sm
                               transition-all duration-300 hover:border-[#FF633F]/50 hover:scale-[1.03]"
                  >
                    <span
                      className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px]
                                 after:w-full after:origin-left after:scale-x-0 after:bg-[#FF633F]
                                 after:transition-transform after:duration-300 after:ease-out
                                 group-hover:after:scale-x-100"
                    >
                      Login
                    </span>
                  </Link>
                </motion.div>
              ) : (
                <div ref={desktopDropRef} className="relative">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setAccountOpen((v) => !v); setMobileOpen(false); }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white
                               px-3 py-2 text-sm font-extrabold text-slate-800 shadow-sm
                               transition-all duration-300 hover:border-[#FF633F]/50"
                    aria-haspopup="menu"
                    aria-expanded={accountOpen}
                  >
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-extrabold"
                      style={{ background: ACCENT }}
                    >
                      {(me.fullName?.[0] || me.email?.[0] || "U").toUpperCase()}
                    </span>
                    <span className="hidden max-w-32 truncate sm:block">
                      {me.fullName?.split(" ")[0] || me.email}
                    </span>
                    <motion.span
                      animate={{ rotate: accountOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} className="text-slate-500" />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200
                                   bg-white py-1 shadow-xl"
                      >
                        <DropItem icon={ClipboardList} label="My Orders" onClick={() => { setAccountOpen(false); navigate("/orders"); }} />
                        <DropItem icon={User} label="Account" onClick={() => { setAccountOpen(false); navigate("/account"); }} />
                        {isStaff && (
                          <DropItem icon={Settings} label="Admin" onClick={() => { setAccountOpen(false); navigate("/admin"); }} />
                        )}
                        <div className="my-1 h-px bg-slate-100" />
                        <DropItem icon={LogOut} label="Logout" onClick={handleLogout} danger />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Cart */}
              <motion.div whileTap={{ scale: 0.93 }}>
                <Link
                  to="/cart"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200
                             bg-white text-slate-700 shadow-sm transition-all duration-300
                             hover:border-[#FF633F]/50 hover:bg-[#FF633F] hover:text-white"
                  aria-label="Cart"
                >
                  <ShoppingCart size={16} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center
                                   rounded-full bg-slate-950 px-1 text-[10px] font-extrabold text-white"
                      >
                        {cartCount > 99 ? "99+" : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            </div>

            {/* ── Mobile right: login icon or avatar ────────────────── */}
            <div ref={mobileButtonRef} className="flex items-center gap-2 lg:hidden">
              {/* Cart (mobile) */}
              <Link
                to="/cart"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200
                           bg-white text-slate-700 shadow-sm transition-all duration-300
                           hover:bg-[#FF633F] hover:text-white hover:border-[#FF633F]"
                aria-label="Cart"
              >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center
                                   rounded-full bg-slate-950 px-0.5 text-[9px] font-extrabold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Auth icon */}
              {!me ? (
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200
                             bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                  aria-label="Login"
                >
                  <User size={16} />
                </Link>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => { setAccountOpen((v) => !v); setMobileOpen(false); }}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-extrabold shadow-sm"
                  style={{ background: ACCENT }}
                  aria-label="Account"
                >
                  {accountOpen
                    ? <X size={15} />
                    : (me.fullName?.[0] || me.email?.[0] || "U").toUpperCase()}
                </motion.button>
              )}
            </div>
          </div>

          {/* ── Mobile account dropdown ──────────────────────────────────── */}
          <AnimatePresence>
            {me && accountOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden lg:hidden"
                ref={mobileDropRef}
              >
                <div className="mb-3 rounded-2xl border border-slate-200 bg-white py-1 shadow-sm">
                  <DropItem icon={ShoppingCart} label="Cart" onClick={() => { setAccountOpen(false); navigate("/cart"); }} />
                  <DropItem icon={ClipboardList} label="My Orders" onClick={() => { setAccountOpen(false); navigate("/orders"); }} />
                  <DropItem icon={User} label="Account" onClick={() => { setAccountOpen(false); navigate("/account"); }} />
                  {isStaff && (
                    <DropItem icon={Settings} label="Admin" onClick={() => { setAccountOpen(false); navigate("/admin"); }} />
                  )}
                  <div className="my-1 h-px bg-slate-100" />
                  <DropItem icon={LogOut} label="Logout" onClick={handleLogout} danger />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Mobile drawer — full-screen slide-in ─────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-2xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <img src="/logo.png" alt="Golden Art Frames" className="h-9 w-auto" />
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200
                             text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Drawer links */}
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                {ALL_LINKS.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold
                                  transition-all duration-200 ${
                        isActive(l.to)
                          ? "bg-[#FF633F]/10 font-extrabold text-[#FF633F]"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {isActive(l.to) && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: ACCENT }}
                        />
                      )}
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer footer CTA */}
              {!me && (
                <div className="border-t border-slate-100 px-4 py-4">
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-2xl py-3 text-center text-sm font-extrabold text-white
                                 transition-all duration-300 hover:brightness-110"
                      style={{ background: ACCENT }}
                    >
                      Login / Sign Up
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
