// client/src/components/Footer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern dark footer — logo, navigation columns, social links, bottom bar.
// All existing links and contact info preserved.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";

const ACCENT = "#FF633F";

const WHATSAPP = "971522640871";

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/albumhq/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/albumhq.ae/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${WHATSAPP}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors duration-200 hover:text-white"
      >
        <span
          className="h-0.5 w-0 rounded-full bg-[#FF633F] transition-all duration-300 group-hover:w-3"
        />
        {children}
      </Link>
    </li>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4">

        {/* ── Main grid ───────────────────────────────────────────── */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Golden Art Frames"
                className="h-12 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-white/40">
              Premium custom prints, frames, and canvas art crafted with care — designed to elevate
              your space with timeless elegance.
            </p>

            {/* Social row */}
            <div className="mt-6 flex items-center gap-2">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-all duration-200 hover:border-[#FF633F]/40 hover:bg-[#FF633F]/10 hover:text-[#FF633F]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Shop</h4>
            <ul className="mt-5 space-y-3">
              <FooterLink to="/products">All Products</FooterLink>
              <FooterLink to="/editor/print-frame">Print &amp; Frame</FooterLink>
              <FooterLink to="/editor/canvas">Canvas Prints</FooterLink>
              <FooterLink to="/cart">Cart</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Support</h4>
            <ul className="mt-5 space-y-3">
              <FooterLink to="/account">My Account</FooterLink>
              <FooterLink to="/orders">My Orders</FooterLink>
              <FooterLink to="/delivery">Delivery Info</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Contact</h4>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-white/40">
              <li>
                1103-Al Ghanem Business Building,
                <br />Al-Majaz-3, Sharjah,
                <br />United Arab Emirates
              </li>
              <li>
                <a
                  href="mailto:info@goldenartframe.com"
                  className="transition-colors hover:text-white"
                >
                  info@goldenartframe.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+971522640871"
                  className="transition-colors hover:text-white"
                >
                  +971 52 264 0871
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 py-6 sm:flex-row">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Golden Art Frames. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <span>Made with</span>
            <span style={{ color: ACCENT }}>♥</span>
            <span>in UAE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
