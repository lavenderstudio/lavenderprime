// client/src/components/Navbar.jsx
// ----------------------------------------------------
// Responsive Navbar
// - Desktop: left links + centered brand + right actions
// - Mobile: hamburger menu
// - Auth: Login or Account dropdown
// - Staff: settings icon between Contact and Account (admin/manager)
// - Cart badge: session-based item count
// ----------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, User, X, ChevronDown, Settings, LogOut, ClipboardList } from "lucide-react";
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

  // Helper: highlight active route
  const isActive = (path) => location.pathname === path;

  // Load cart count (session based)
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const res = await api.get(`/cart/${sessionId}`);
        const items = res.data?.items || [];

        // ✅ total quantity (not just number of lines)
        const qtySum = items.reduce((sum, it) => sum + (Number(it?.config?.quantity) || 1), 0);
        setCartCount(qtySum);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
  }, [sessionId, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Close dropdown on click outside + ESC
  useEffect(() => {
    const onDocClick = (e) => {
      const inDesktop =
        desktopDropdownRef.current?.contains(e.target) ?? false;
      const inMobile =
        mobileDropdownRef.current?.contains(e.target) ?? false;

      if (!inDesktop && !inMobile) {
        setAccountOpen(false);
      }
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


  const navLinkClass = (path) =>
    `text-sm font-semibold transition ${
      isActive(path) ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
    }`;

  const handleLogout = async () => {
    try {
      // ⚠️ Adjust this endpoint to match your backend.
      // Common options: POST /auth/logout  or  POST /auth/signout
      await api.post("/auth/logout");

      // Clear local state
      setUser(null);
      setAccountOpen(false);

      // Go home (or login)
      navigate("/login", { replace: true });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Even if request fails, clear UI so user isn't stuck
      setUser(null);
      setAccountOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        {/* Top row */}
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile: hamburger */}
          <button
            onClick={() => {
							setMobileOpen((v) => !v);
							setAccountOpen(false);
						}}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 lg:hidden"
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
              About Us
            </Link>
          </nav>

          {/* Center brand (true center, always full text) */}
					<div className="absolute left-1/2 -translate-x-1/2">
						<Link
							to="/"
							className="
								whitespace-nowrap
								select-none
								text-center
								font-extrabold
								sm:text-[16px] md:text-[20px]
								tracking-[0.12em] sm:tracking-[0.18em] md:tracking-[0.22em]
								text-gray-900
							"
						>
							GOLDEN ART FRAMES
						</Link>
					</div>

          {/* Desktop right area */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link className={navLinkClass("/contact")} to="/contact">
              Contact Us
            </Link>

            {/* ✅ Staff settings icon between Contact and Account */}
            {isStaff && (
              <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white p-2 hover:bg-gray-50"
                aria-label="Admin settings"
                title="Admin"
              >
                <Settings size={18} className="text-gray-900" />
              </button>
            )}

            {/* Login OR Account dropdown */}
            {!me ? (
              <Link
								to="/login"
								state={{ from: location.pathname }}
								className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
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
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                    {(me.fullName?.[0] || me.email?.[0] || "U").toUpperCase()}
                  </span>
                  <span className="hidden sm:block max-w-35 truncate">
                    {me.fullName?.split(" ")[0] || me.email}
                  </span>
                  <ChevronDown size={16} className="text-gray-700" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/orders");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      <ClipboardList size={16} />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/account");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      <User size={16} />
                      Account
                    </button>

                    <div className="h-px bg-gray-100" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white p-2 hover:bg-gray-50"
              aria-label="Cart"
            >
              <ShoppingCart size={18} className="text-gray-900" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-xs font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile right actions: cart + login/avatar */}
          <div ref={mobileDropdownRef} className="flex items-center gap-2 lg:hidden">
            {!me ? (
              <Link
								to="/login"
								state={{ from: location.pathname }}
								className="rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50"
							>
								<User size={18} className="text-gray-900"/>
							</Link>
            ) : (
              <button
								onClick={() => {
									setAccountOpen((v) => !v);
									setMobileOpen(false);
								}}
								className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white"
								aria-label={accountOpen ? "Close account menu" : "Open account menu"}
								aria-haspopup="menu"
								aria-expanded={accountOpen}
							>
								{accountOpen ? (
									<X size={18} />
								) : (
									<span className="text-sm font-bold">
										{(me.fullName?.[0] || me.email?.[0] || "U").toUpperCase()}
									</span>
								)}
							</button>
            )}
          </div>
        </div>

				{/* Mobile account dropdown (only on mobile) */}
				{me && accountOpen && (
					<div className="lg:hidden" onClick={(e) => e.stopPropagation()}>
						
						<div className="mt-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
							<button
								onClick={() => {
									setAccountOpen(false);
									navigate("/cart");
								}}
								className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
							>
								<span className="flex items-center gap-2">
									<ShoppingCart size={16} />
									Cart
								</span>

								{cartCount > 0 && (
									<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-xs font-bold text-white">
										{cartCount > 99 ? "99+" : cartCount}
									</span>
								)}
							</button>
							<button
								onClick={() => {
									setAccountOpen(false);
									navigate("/orders");
								}}
								className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
							>
								<ClipboardList size={16} />
								My Orders
							</button>

							<button
								onClick={() => {
									setAccountOpen(false);
									navigate("/account");
								}}
								className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
							>
								<User size={16} />
								Account
							</button>

							{/* ✅ Admin appears INSIDE dropdown on mobile */}
							{isStaff && (
								<button
									onClick={() => {
										setAccountOpen(false);
										navigate("/admin");
									}}
									className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
								>
									<Settings size={16} />
									Admin
								</button>
							)}

							<div className="my-1 h-px bg-gray-100" />

							<button
								onClick={() => {
									setAccountOpen(false);
									handleLogout();
								}}
								className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
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
            <div className="mt-2 grid gap-2 rounded-2xl border border-gray-200 bg-white p-3">
              <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50" to="/">
                Home
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50" to="/products">
                Products
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50" to="/about">
                About Us
              </Link>
              <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50" to="/contact">
                Contact Us
              </Link>

              {!me && (
                <Link className="rounded-xl bg-gray-900 px-3 py-2 text-center text-sm font-semibold text-white" to="/login">
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
