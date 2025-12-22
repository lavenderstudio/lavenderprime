// client/src/components/home/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Container, ACCENT_BG, ACCENT_HOVER } from "./ui.jsx";

export default function Header({ nav }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <Container className="py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${ACCENT_BG} text-white`}>
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold">Print & Frame</p>
              <p className="text-xs font-semibold text-slate-500">Custom • Delivered</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.href}
                className="text-sm font-bold text-slate-800 hover:text-slate-950"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/custom"
              className={`hidden rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-4 py-2 text-sm font-bold text-white transition md:inline-flex`}
            >
              Start Designing
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white md:hidden"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mt-3 overflow-hidden rounded-2xl border bg-white md:hidden"
            >
              <div className="p-3">
                <div className="grid gap-1">
                  {nav.map((n) => (
                    <Link
                      key={n.label}
                      to={n.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <Link
                    to="/custom"
                    onClick={() => setMobileOpen(false)}
                    className={`mt-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-3 py-2 text-center text-sm font-bold text-white`}
                  >
                    Start Designing
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>
    </header>
  );
}
