// ─────────────────────────────────────────────────────────────────────────────
// Account Page — Thiết kế Bảo tàng (Cyan × Magenta)
// Tràn viền · Việt ngữ · Đẳng cấp Gallery
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Mail, Phone, ShieldCheck, MapPin, Package, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import api from "../lib/api.js";

import ShinyText from "../components/reactbits/ShinyText.jsx";

// ─── Bảng màu ────────────────────────────────────────────────────────────────
const C = "#00e5ff";   // cyan thuần
const M = "#e040fb";   // magenta thuần
const CM = C;

const UAE_CITIES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain", "Khorfakkan",
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const INPUT =
  "w-full border-b border-slate-200 bg-transparent px-0 py-3 text-base font-bold text-slate-900 outline-none transition-all focus:border-[#00e5ff] placeholder:text-slate-300";

const INPUT_DISABLED =
  "w-full border-b border-slate-100 bg-transparent px-0 py-3 text-base font-bold text-slate-400 cursor-not-allowed";

// ─── Components bổ trợ ───────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Hairline({ className = "" }) {
  return <div className={`h-px w-full bg-slate-100 ${className}`} />;
}

function Field({ icon: Icon, label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
        {Icon && <Icon size={12} style={{ color: C }} />}
        {label}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", role: "user",
    shippingAddress: { line1: "", line2: "", city: "", postcode: "", country: "" },
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users/me");
        const u = res.data?.user;
        setForm({
          fullName: u?.fullName || "",
          email: u?.email || "",
          phone: u?.phone || "",
          role: u?.role || "user",
          shippingAddress: {
            line1: u?.shippingAddress?.line1 || "",
            line2: u?.shippingAddress?.line2 || "",
            city: u?.shippingAddress?.city || "",
            postcode: u?.shippingAddress?.postcode || "",
            country: u?.shippingAddress?.country || "",
          },
        });
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setError(""); setSuccess(""); setSaving(true);
      const res = await api.patch("/users/me", {
        fullName: form.fullName,
        phone: form.phone,
        shippingAddress: form.shippingAddress,
      });
      setSuccess("Đã lưu thay đổi thành công ✅");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const isUAE = useMemo(() => {
    const c = String(form.shippingAddress?.country || "").toLowerCase();
    return c === "united arab emirates" || c === "uae" || c.includes("emirates");
  }, [form.shippingAddress?.country]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      
      {/* ── Section 1: Hero Header (Tràn viền) ────────────────── */}
      <section className="relative border-b border-slate-100 bg-white pt-32 pb-20 px-10 sm:px-16 lg:px-24">
        {/* Accent line dọc đúng chất bảo tàng */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: C }} />
        
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-4">
                <span className="font-mono text-xs tracking-[0.3em] text-slate-400">ID: {form.role?.toUpperCase()}</span>
                <div className="h-px w-12" style={{ background: M }} />
                <span className="rounded-full px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest" style={{ background: C }}>
                   Tài khoản xác thực
                </span>
              </div>
              
              <h1 className="font-extrabold leading-[0.9] tracking-tighter text-slate-900" style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
                Hồ Sơ<br />
                <span style={{ color: "transparent", WebkitTextStroke: `2px ${M}` }}>Của Bạn.</span>
              </h1>
              
              <p className="mt-8 max-w-md text-base leading-relaxed text-slate-500 sm:text-lg">
                Quản lý thông tin cá nhân, địa chỉ giao hàng và theo dõi các tác phẩm nghệ thuật bạn đã đặt chế tác.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 shrink-0">
              <Link to="/orders" className="group flex items-center gap-3 border border-slate-200 px-8 py-4 text-xs font-extrabold tracking-widest uppercase transition-all hover:border-slate-900">
                <Package size={16} /> Đơn hàng của tôi
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Section 2: Form Body (Grid bất đối xứng) ───────────── */}
      <section className="grid lg:grid-cols-12 border-b border-slate-100">
        
        {/* Sidebar Title */}
        <div className="lg:col-span-4 border-r border-slate-100 p-10 sm:p-16 lg:p-24 bg-slate-50/50">
          <Reveal>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400 block mb-4">01 — Chi tiết</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">Thông Tin Cá Nhân</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Thông tin này được sử dụng để xác thực đơn hàng và in chứng nhận tác phẩm cho bạn.
            </p>
          </Reveal>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-8 p-10 sm:p-16 lg:p-24">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div exit={{ opacity: 0 }} className="space-y-12">
                {[1, 2, 3].map(i => <div key={i} className="h-16 w-full animate-pulse bg-slate-50" />)}
              </motion.div>
            ) : (
              <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={onSave} className="space-y-12">
                
                {/* Thông báo Alert */}
                <div className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-3 bg-rose-50 p-4 text-xs font-bold text-rose-600 border-l-2 border-rose-600">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-3 bg-emerald-50 p-4 text-xs font-bold text-emerald-600 border-l-2 border-emerald-600">
                      <CheckCircle size={14} /> {success}
                    </div>
                  )}
                </div>

                <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
                  <Field icon={User} label="Họ và Tên">
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm({...form, fullName: e.target.value})}
                      className={INPUT}
                      placeholder="Nhập tên của bạn"
                    />
                  </Field>

                  <Field icon={Mail} label="Địa chỉ Email">
                    <input value={form.email} disabled className={INPUT_DISABLED} />
                  </Field>

                  <Field icon={Phone} label="Số điện thoại">
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      className={INPUT}
                      placeholder="+971..."
                    />
                  </Field>

                  <Field icon={ShieldCheck} label="Phân quyền">
                    <div className="pt-3">
                      <span className="font-mono text-[10px] font-bold text-white px-2 py-1" style={{ background: M }}>
                        {form.role?.toUpperCase()}
                      </span>
                    </div>
                  </Field>
                </div>

                {/* Shipping Section */}
                <div className="pt-10">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400 block mb-8">02 — Giao hàng</span>
                  <div className="space-y-10">
                    <Field icon={MapPin} label="Địa chỉ dòng 1">
                      <input
                        value={form.shippingAddress.line1}
                        onChange={(e) => setForm({...form, shippingAddress: {...form.shippingAddress, line1: e.target.value}})}
                        className={INPUT}
                        placeholder="Số nhà, tên đường..."
                      />
                    </Field>

                    <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
                      <Field label="Thành phố">
                        {isUAE ? (
                          <select
                            className={INPUT}
                            value={form.shippingAddress.city}
                            onChange={(e) => setForm({...form, shippingAddress: {...form.shippingAddress, city: e.target.value}})}
                          >
                            <option value="">Chọn thành phố</option>
                            {UAE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <input
                            value={form.shippingAddress.city}
                            onChange={(e) => setForm({...form, shippingAddress: {...form.shippingAddress, city: e.target.value}})}
                            className={INPUT}
                          />
                        )}
                      </Field>

                      <Field label="Mã bưu điện">
                        <input
                          value={form.shippingAddress.postcode}
                          onChange={(e) => setForm({...form, shippingAddress: {...form.shippingAddress, postcode: e.target.value}})}
                          className={INPUT}
                        />
                      </Field>
                    </div>

                    <Field label="Quốc gia">
                      <input value={form.shippingAddress.country} disabled className={INPUT_DISABLED} />
                    </Field>
                  </div>
                </div>

                {/* Nút lưu kiểu Magnet */}
                <div className="pt-6">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={saving}
                    className="flex items-center justify-center gap-4 bg-slate-900 px-12 py-5 text-xs font-extrabold text-white tracking-[0.2em] uppercase transition-all hover:bg-black hover:scale-[1.02] disabled:opacity-50"
                  >
                    {saving ? "Đang xử lý..." : "Cập nhật hồ sơ"}
                    <ArrowRight size={16} style={{ color: C }} />
                  </motion.button>
                </div>

              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer Decoration */}
      <section className="bg-slate-950 py-20 px-10 text-center">
        <p className="font-mono text-[10px] tracking-[0.5em] text-white/20 uppercase">
          Gallery Standard Archive System
        </p>
      </section>
    </div>
  );
}
