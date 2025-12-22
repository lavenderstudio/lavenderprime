/* eslint-disable no-unused-vars */
// client/src/components/Navbar.jsx
// ----------------------------------------------------
// Golden Art Frames Navbar (no Framer Motion)
// - Desktop: left links + centered brand + right actions
// - Mobile: hamburger + compact actions + menu panel
// - Auth: Login or Account dropdown
// - Staff: admin icon/menu item
// - Cart badge: session-based item count
// ----------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  ShoppingCart,
  User,
  X,
  ChevronDown,
  Settings,
  LogOut,
  ClipboardList,
  Phone,
  MapPin,
} from "lucide-react";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionId = useMemo(() => getSessionId(), []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user: me, setUser } = useAuth();

  // Dropdown state
  const [accountOpen, setAccountOpen] = useState(false);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  // Cart item count
  const [cartCount, setCartCount] = useState(0);

  const isStaff = !!me && ["admin", "manager"].includes(me.role);

  const isActive = (path) => location.pathname === path;

  // Load cart count (session based)
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const res = await api.get(`/cart/${sessionId}`);
        const items = res.data?.items || [];
        const qtySum = items.reduce(
          (sum, it) => sum + (Number(it?.config?.quantity) || 1),
          0
        );
        setCartCount(qtySum);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
  }, [sessionId, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Close dropdown on click outside + ESC
  useEffect(() => {
    const onDocClick = (e) => {
      const inDesktop = desktopDropdownRef.current?.contains(e.target) ?? false;
      const inMobile = mobileDropdownRef.current?.contains(e.target) ?? false;
      if (!inDesktop && !inMobile) setAccountOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const navLinkClass = (path) => {
    const active = isActive(path);
    return [
      "relative text-sm font-extrabold transition",
      active ? "text-slate-950" : "text-slate-600 hover:text-slate-950",
      // Accent underline for active
      active ? "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-amber-700 after:content-['']" : "",
    ].join(" ");
  };

  const iconBtnClass =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition";

  const pillBtnClass =
    "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50 transition";

  const primaryBtnClass =
    "inline-flex items-center justify-center rounded-2xl bg-amber-700 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-amber-900 transition";

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      setAccountOpen(false);
      navigate("/login", { replace: true });
    } catch {
      setUser(null);
      setAccountOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

      <div className="mx-auto max-w-6xl px-4">
        {/* Top row */}
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile: hamburger */}
          <button
            onClick={() => {
              setMobileOpen((v) => !v);
              setAccountOpen(false);
            }}
            className={iconBtnClass + " lg:hidden"}
            aria-label="Open menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Desktop left links */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link className={navLinkClass("/")} to="/">
              Home
            </Link>
            <Link className={navLinkClass("/products")} to="/products">
              Products
            </Link>
            <Link className={navLinkClass("/about")} to="/about">
              About
            </Link>
            <Link className={navLinkClass("/delivery")} to="/delivery">
              Delivery
            </Link>
          </nav>

          {/* Center brand */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              to="/"
              className="whitespace-nowrap select-none text-center font-extrabold tracking-[0.18em] text-slate-950 sm:text-[16px] md:text-[20px]"
              aria-label="Golden Art Frames"
            >
              GOLDEN ART FRAMES
            </Link>
            <div className="mx-auto mt-1 h-0.5 w-16 bg-amber-700/70 hidden md:block" />
          </div>

          {/* Desktop right area */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link className={navLinkClass("/contact")} to="/contact">
              Contact
            </Link>

            {isStaff && (
              <button
                onClick={() => navigate("/admin")}
                className={iconBtnClass}
                aria-label="Admin settings"
                title="Admin"
              >
                <Settings size={18} className="text-slate-900" />
              </button>
            )}

            {!me ? (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className={pillBtnClass}
              >
                Login
              </Link>
            ) : (
              <div ref={desktopDropdownRef} className="relative">
                <button
                  onClick={() => {
                    setAccountOpen((v) => !v);
                    setMobileOpen(false);
                  }}
                  className={pillBtnClass}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-800 text-white">
                    {(me.fullName?.[0] || me.email?.[0] || "U").toUpperCase()}
                  </span>

                  <span className="hidden sm:block max-w-40 truncate">
                    {me.fullName?.split(" ")[0] || me.email}
                  </span>

                  <ChevronDown size={16} className="text-slate-700" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/orders");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                    >
                      <ClipboardList size={16} />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/account");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                    >
                      <User size={16} />
                      Account
                    </button>

                    {isStaff && (
                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          navigate("/admin");
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                      >
                        <Settings size={16} />
                        Admin
                      </button>
                    )}

                    <div className="h-px bg-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-extrabold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link to="/cart" className={iconBtnClass} aria-label="Cart">
              <ShoppingCart size={18} className="text-slate-900" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-xs font-extrabold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* ✅ Mobile right actions: ONLY login/avatar (cart moves into user tab) */}
          <div ref={mobileDropdownRef} className="flex items-center gap-2 lg:hidden">
            {!me ? (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className={iconBtnClass}
                aria-label="Login"
              >
                <User size={18} className="text-slate-900" />
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAccountOpen((v) => !v);
                  setMobileOpen(false);
                }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-800 text-white shadow-sm"
                aria-label={accountOpen ? "Close account menu" : "Open account menu"}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                {accountOpen ? (
                  <X size={18} />
                ) : (
                  <span className="text-sm font-extrabold">
                    {(me.fullName?.[0] || me.email?.[0] || "U").toUpperCase()}
                  </span>
                )}

                {/* Optional tiny cart badge on avatar button (like "you have items") */}
                {cartCount > 0 && !accountOpen && (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ✅ Mobile account dropdown (includes Cart now) */}
        {me && accountOpen && (
          <div className="lg:hidden" onClick={(e) => e.stopPropagation()}>
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
              {/* Cart inside dropdown */}
              <button
                onClick={() => {
                  setAccountOpen(false);
                  navigate("/cart");
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Cart
                </span>

                {cartCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-xs font-extrabold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setAccountOpen(false);
                  navigate("/orders");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
              >
                <ClipboardList size={16} />
                My Orders
              </button>

              <button
                onClick={() => {
                  setAccountOpen(false);
                  navigate("/account");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
              >
                <User size={16} />
                Account
              </button>

              {isStaff && (
                <button
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/admin");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                >
                  <Settings size={16} />
                  Admin
                </button>
              )}

              <div className="my-1 h-px bg-slate-100" />

              <button
                onClick={() => {
                  setAccountOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="pb-4 lg:hidden">
            <div className="mt-2 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <Link className="rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50" to="/">
                Home
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50" to="/products">
                Products
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50" to="/about">
                About
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50" to="/delivery">
                Delivery
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50" to="/contact">
                Contact
              </Link>

              {!me && (
                <Link className="rounded-xl bg-amber-700 px-3 py-2 text-center text-sm font-extrabold text-white hover:bg-amber-900" to="/login">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
