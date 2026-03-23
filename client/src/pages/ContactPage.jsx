// client/src/pages/ContactPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CONTACT PAGE — "THE CURATOR'S CORRESPONDENCE"
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  Mail, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Globe, 
  PenTool,
  SendHorizontal
} from "lucide-react";

const CYAN = "#00ffff";
const MAGENTA = "#ff00ff";
const WHATSAPP_NUMBER = "971522640871";

// ─── Museum Input Style (The Ink on Paper) ──────────────────────────────────
const INPUT =
  "w-full border-b-[1px] border-slate-200 bg-transparent py-4 text-sm font-medium text-slate-900 " +
  "outline-none transition-all duration-700 focus:border-[#ff00ff] focus:pl-4 " +
  "placeholder:text-slate-200 placeholder:font-light italic group-hover:border-slate-400";

// ─── Shared Info Component ────────────────────────────────────────────────────
function InfoRow({ icon: Icon, title, children, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className="group flex items-start gap-8"
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-white shadow-sm transition-all duration-500 group-hover:border-[#00ffff] group-hover:rotate-[15deg]">
        <div className="absolute inset-0 bg-[#00ffff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-900" />
      </div>
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff00ff]">{title}</h3>
        <div className="text-[13px] font-light leading-relaxed text-slate-500 md:text-sm">{children}</div>
      </div>
    </motion.div>
  );
}

// ─── Field Animation Wrapper ─────────────────────────────────────────────────
function Field({ label, required, children, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group flex flex-col gap-2"
    >
      <label className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 group-focus-within:text-[#ff00ff] transition-colors">
        {label} {required && <span className="text-[#ff00ff]">*</span>}
      </label>
      {children}
    </motion.div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", country: "", city: "",
    reason: "Service Enquiry", product: "", remarks: "",
  });

  const reasons = useMemo(
    () => ["Service Enquiry", "Product Enquiry", "Custom Framing", "Partnership", "Support"],
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `*Enquiry từ Golden Art*\n\n*Họ tên:* ${form.name}\n*Lý do:* ${form.reason}\n*Lời nhắn:* ${form.remarks}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-[#00ffff]/20">
      
      {/* ── Artistic Header (The Canvas) ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#fafafa] py-40 px-6 lg:py-56">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-[11px] font-black uppercase tracking-[1em] text-[#ff00ff]">EST. 2026</span>
            <h1 className="mt-10 text-[12vw] font-black leading-[0.8] tracking-[-0.08em] md:text-[8rem] lg:text-[10rem]">
              LIÊN HỆ<span className="text-[#00ffff]">.</span>
            </h1>
            <div className="mt-16 flex flex-col items-start gap-8 md:flex-row md:items-end md:gap-24">
               <p className="max-w-md text-sm font-light leading-relaxed text-slate-400">
                Hãy để lại dấu ấn của bạn. Mỗi yêu cầu tư vấn là bước đầu tiên để hiện thực hóa một không gian sống đầy cảm hứng nghệ thuật.
               </p>
               <motion.div 
                 animate={{ rotate: [0, 10, 0] }} 
                 transition={{ repeat: Infinity, duration: 5 }}
                 className="h-px w-32 bg-slate-200" 
               />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Body (The Correspondence) ──────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-32 lg:py-48">
        <div className="grid grid-cols-1 gap-32 lg:grid-cols-12 lg:items-start">

          {/* ── Left: Museum Dossier ──────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-24">
            <section>
              <h2 className="mb-16 font-mono text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Archive Info</h2>
              <div className="space-y-16">
                <InfoRow icon={MapPin} title="The Studio" delay={0.1}>
                  1103-Al Ghanem Business Building <br /> 
                  <span className="font-bold text-slate-900 uppercase tracking-tighter">Al-Majaz-3, Sharjah, UAE</span>
                </InfoRow>
                <InfoRow icon={Mail} title="Correspondence" delay={0.2}>
                  <a href="mailto:info@goldenartframe.com" className="block hover:text-[#ff00ff] transition-colors">info@goldenartframe.com</a>
                  <span className="text-[10px] text-slate-400 italic">Response within 24 curators' hours</span>
                </InfoRow>
                <InfoRow icon={Phone} title="Direct Line" delay={0.3}>
                  <a href="tel:+971522640871" className="text-lg font-bold tracking-tighter text-slate-900 hover:text-[#00ffff]">+971 522 640 871</a>
                </InfoRow>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-16">
              <h2 className="mb-10 font-mono text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Social Presence</h2>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, label: "IG" },
                  { icon: Facebook, label: "FB" },
                  { icon: Globe, label: "WEB" }
                ].map((s, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ y: -5 }}
                    className="flex h-14 w-14 items-center justify-center border border-slate-100 bg-white transition-all hover:bg-black hover:text-white"
                    href="#"
                  >
                    <s.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: The Aesthetic Form ──────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative border-[1px] border-slate-200 bg-white p-10 shadow-[40px_40px_0px_#f8f8f8] md:p-20 lg:col-span-8"
          >
            <div className="absolute right-10 top-10 opacity-5">
              <PenTool className="h-32 w-32 rotate-12" />
            </div>

            <header className="mb-20">
              <h2 className="text-4xl font-black tracking-tighter uppercase md:text-5xl">Start a <br /><span className="italic font-light">Dialogue</span></h2>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-400">WhatsApp Integrated Enquiry System</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid gap-12 md:grid-cols-2">
                <Field label="Collector Name" required delay={0.1}>
                  <input className={INPUT} placeholder="How should we address you?" onChange={(e) => setForm({...form, name: e.target.value})} />
                </Field>
                <Field label="Email Address" required delay={0.2}>
                  <input className={INPUT} type="email" placeholder="curator@gallery.com" />
                </Field>
              </div>

              <div className="grid gap-12 md:grid-cols-3">
                <Field label="Phone / WhatsApp" required delay={0.3}>
                  <input className={INPUT} placeholder="+971 -- --- ----" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Interested In" delay={0.4}>
                    <input className={INPUT} placeholder="e.g. Canvas Stretched, Wedding Frames..." />
                  </Field>
                </div>
              </div>

              <Field label="Your Message / Vision" delay={0.5}>
                <textarea 
                  rows={4} 
                  className={`${INPUT} resize-none`} 
                  placeholder="Tell us about your space or your creative idea..."
                  onChange={(e) => setForm({...form, remarks: e.target.value})}
                />
              </Field>

              <div className="flex flex-col gap-10 pt-10 md:flex-row md:items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center justify-center gap-6 bg-black px-12 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-white transition-all hover:bg-[#ff00ff] hover:shadow-[0_20px_40px_rgba(255,0,255,0.2)]"
                >
                  Send to Curator <SendHorizontal className="h-4 w-4" />
                </motion.button>

                <Link to="/products" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-black transition-colors">
                  Explore Gallery <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      {/* ── Footer Decor (The Final Stamp) ────────────────────────────── */}
      <footer className="bg-black py-32 text-center text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-light italic tracking-tighter md:text-6xl">
            L'art pour l'art.
          </h2>
          <p className="mt-8 font-mono text-[10px] font-black uppercase tracking-[1em] text-slate-500">
            Golden Art Framing Studio — Dubai
          </p>
        </div>
      </footer>
    </div>
  );
}
