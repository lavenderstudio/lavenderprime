// client/src/components/Footer.jsx

import { Link } from "react-router-dom";

const C = "#00e5ff";
const M = "#e040fb";
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

// ── FooterLink — không có span, tiêu đề và link thẳng hàng ───────────────────
function FooterLink({ to, children, href }) {
  const cls = "block text-sm text-white/40 transition-colors duration-200 hover:text-white py-1";
  if (href) {
    return <li><a href={href} target="_blank" rel="noreferrer" className={cls}>{children}</a></li>;
  }
  return <li><Link to={to} className={cls}>{children}</Link></li>;
}

export default function Footer() {
  return (
    <footer
      className="w-full text-white"
      style={{
        background: "#0d0d10",
        borderTop:  "1px solid rgba(255,255,255,0.06)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Đường accent top cyan→magenta */}
      <div
        className="h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${C} 0%, ${M} 100%)` }}
      />

      {/* ── Main grid — vạch kẻ đứng, không có borderBottom ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* Cột 1 — Thương hiệu */}
        <div
          className="flex flex-col px-8 py-12 lg:px-10"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Link to="/" className="inline-block mb-6">
            <img
              src="/logo.png"
              alt="Golden Art Frames"
              className="h-11 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>

          <p className="text-sm leading-7 text-white/35 flex-1">
            Bản in, khung và canvas nghệ thuật tùy chỉnh cao cấp — được chế tác tỉ mỉ để nâng tầm
            không gian sống của bạn với vẻ đẹp vượt thời gian.
          </p>

          <div className="mt-8 flex items-center gap-2">
            {socials.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all duration-200"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C;
                  e.currentTarget.style.background  = `${C}18`;
                  e.currentTarget.style.color       = C;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                  e.currentTarget.style.background  = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color       = "rgba(255,255,255,0.40)";
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Cột 2 — Cửa hàng */}
        <div
          className="flex flex-col px-8 py-12 lg:px-10"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h4 className="text-sm font-bold mb-5" style={{ color: C }}>
            Cửa hàng
          </h4>
          <ul className="space-y-1">
            <FooterLink to="/products">Tất cả sản phẩm</FooterLink>
            <FooterLink to="/editor/print-frame">In &amp; đóng khung</FooterLink>
            <FooterLink to="/editor/canvas">In canvas</FooterLink>
            <FooterLink to="/editor/fine-art-print">In nghệ thuật</FooterLink>
            <FooterLink to="/cart">Giỏ hàng</FooterLink>
          </ul>
        </div>

        {/* Cột 3 — Hỗ trợ */}
        <div
          className="flex flex-col px-8 py-12 lg:px-10"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h4 className="text-sm font-bold mb-5" style={{ color: C }}>
            Hỗ trợ
          </h4>
          <ul className="space-y-1">
            <FooterLink to="/account">Tài khoản</FooterLink>
            <FooterLink to="/orders">Đơn hàng</FooterLink>
            <FooterLink to="/delivery">Thông tin giao hàng</FooterLink>
            <FooterLink to="/contact">Liên hệ</FooterLink>
            <FooterLink to="/about">Về chúng tôi</FooterLink>
          </ul>
        </div>

        {/* Cột 4 — Liên hệ */}
        <div className="flex flex-col px-8 py-12 lg:px-10">
          <h4 className="text-sm font-bold mb-5" style={{ color: C }}>
            Liên hệ
          </h4>
          <ul className="space-y-5 text-sm leading-7 text-white/35">
            <li>
              1103-Al Ghanem Business Building,
              <br />Al-Majaz-3, Sharjah,
              <br />United Arab Emirates
            </li>
            <li>
              <a
                href="mailto:info@goldenartframe.com"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => e.currentTarget.style.color = C}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
              >
                info@goldenartframe.com
              </a>
            </li>
            <li>
              <a
                href="tel:+971522640871"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => e.currentTarget.style.color = C}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
              >
                +971 52 264 0871
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar — không có border ─────────────────────────────── */}
      <div className="w-full px-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Golden Art Frames. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/20">
            <span>Made with</span>
            <span style={{ color: M }}>♥</span>
            <span>by Fazeel Khan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
