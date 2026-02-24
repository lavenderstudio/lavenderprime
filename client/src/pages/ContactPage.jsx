// ─────────────────────────────────────────────────────────────────────────────
// Modern Contact Page — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Facebook, Instagram, Mail, MapPin, Phone, ArrowRight, MessageCircle } from "lucide-react";

const ACCENT = "#FF633F";
const WHATSAPP_NUMBER = "971522640871";

// ─── Shared input classes ─────────────────────────────────────────────────────
const INPUT =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#FF633F]/60 focus:bg-white focus:ring-2 focus:ring-[#FF633F]/10 placeholder:text-slate-400";

// ─── Contact info row ─────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{ background: `${ACCENT}18` }}
      >
        <Icon className="h-5 w-5" style={{ color: ACCENT }} />
      </div>
      <div>
        <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
        <div className="mt-1 text-sm leading-relaxed text-slate-500">{children}</div>
      </div>
    </div>
  );
}

// ─── Label wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    reason: "Service Enquiry",
    product: "",
    remarks: "",
  });

  const reasons = useMemo(
    () => ["Service Enquiry", "Product Enquiry", "Sales Enquiry", "Support Request", "Other"],
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      alert("Please fill in Name, Email and Phone.");
      return;
    }

    const message = `
*New Website Enquiry — Golden Art Frames*

*Name:* ${form.name}
*Email:* ${form.email}
*Phone:* ${form.phone}
*Location:* ${form.country || "-"}${form.city ? ` - ${form.city}` : ""}

*Reason:* ${form.reason || "-"}
*Product / Service:* ${form.product || "-"}

*Remarks:*
${form.remarks || "-"}
    `.trim();

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: ACCENT }}
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: ACCENT }}
        >
          Golden Art Frames
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-4xl font-extrabold text-white"
        >
          Let's Talk
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="mt-2 text-sm text-white/50"
        >
          Ask about custom sizes, bulk orders, delivery timelines or product recommendations
        </motion.p>
      </section>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Left: info card ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
          >
            {/* Accent header band */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Contact
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Say Hello</h2>
              <p className="mt-1 text-sm text-slate-500">
                We're happy to guide you on print finishes, frame styles, and delivery.
              </p>
            </div>

            {/* Info rows */}
            <div className="space-y-6">
              <InfoRow icon={MapPin} title="Address">
                1103-Al Ghanem Business Building Al-Majaz-3, Sharjah,
                <br /> United Arab Emirates
              </InfoRow>

              <InfoRow icon={Mail} title="Email">
                <a className="transition hover:underline" href="mailto:print@albumhq.ae" style={{ color: ACCENT }}>
                  print@albumhq.ae
                </a>
                <br />
                <a className="transition hover:underline" href="mailto:info@goldenartframe.com" style={{ color: ACCENT }}>
                  info@goldenartframe.com
                </a>
              </InfoRow>

              <InfoRow icon={Phone} title="Phone">
                <a className="transition hover:underline" href="tel:+971522640871" style={{ color: ACCENT }}>
                  +971 522640871
                </a>
                <br />
                <a className="transition hover:underline" href="tel:+97168053054" style={{ color: ACCENT }}>
                  +971 6 8053054
                </a>
              </InfoRow>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Social */}
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Follow us</p>
              <div className="mt-3 flex gap-3">
                {[
                  { href: "https://www.facebook.com/albumhq/",      Icon: Facebook,       label: "Facebook" },
                  { href: "https://www.instagram.com/albumhq.ae/",  Icon: Instagram,      label: "Instagram" },
                  { href: `https://wa.me/${WHATSAPP_NUMBER}`,        Icon: MessageCircle,  label: "WhatsApp" },
                ].map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-sm transition-all duration-200 hover:scale-105 hover:border-[#FF633F]/30 hover:bg-[#FF633F]/5"
                  >
                    <Icon className="h-5 w-5 text-slate-400 transition group-hover:text-[#FF633F]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="mt-auto flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </motion.div>

          {/* ── Right: enquiry form ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
              Enquiry
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Request A Call Back</h2>
            <p className="mt-1 text-sm text-slate-500">
              Fill the form — we'll open WhatsApp with a ready message.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Name" required>
                <input name="name" value={form.name} onChange={handleChange}
                  className={INPUT} placeholder="Your name" />
              </Field>

              <Field label="Email" required>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className={INPUT} placeholder="you@email.com" />
              </Field>

              <Field label="Phone" required>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  className={INPUT} placeholder="+971..." />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Country">
                  <input name="country" value={form.country} onChange={handleChange}
                    className={INPUT} placeholder="Country" />
                </Field>
                <Field label="City">
                  <input name="city" value={form.city} onChange={handleChange}
                    className={INPUT} placeholder="City" />
                </Field>
              </div>

              <Field label="Reason">
                <select name="reason" value={form.reason} onChange={handleChange} className={INPUT}>
                  {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>

              <Field label="Product / Service">
                <input name="product" value={form.product} onChange={handleChange}
                  className={INPUT} placeholder="e.g. Print & Frame" />
              </Field>

              <Field label="Remarks">
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF633F]/60 focus:bg-white focus:ring-2 focus:ring-[#FF633F]/10"
                  placeholder="Tell us what you need..."
                />
              </Field>

              {/* CTAs */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110"
                  style={{ background: ACCENT }}
                >
                  Send via WhatsApp <ArrowRight className="h-4 w-4" />
                </motion.button>

                <Link
                  to="/delivery"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-[#FF633F] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                    How delivery works
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <p className="text-xs text-slate-400">
                WhatsApp opens with your message — you can edit before sending.
              </p>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
