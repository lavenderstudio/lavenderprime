// client/src/pages/AccountPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Account Page — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Mail, Phone, ShieldCheck, MapPin, Package, CheckCircle, AlertCircle } from "lucide-react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

const ACCENT = "#FF633F";

const UAE_CITIES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain", "Khorfakkan",
];

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF633F]/60 focus:bg-white focus:ring-2 focus:ring-[#FF633F]/10";

const INPUT_DISABLED =
  "w-full rounded-xl border border-slate-100 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed";

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "user",
    shippingAddress: {
      line1: "",
      line2: "",
      city: "",
      postcode: "",
      country: "",
    },
  });

  // ── Load profile once ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
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

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddr = (key, value) => {
    setForm((prev) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [key]: value },
    }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      setSaving(true);

      const res = await api.patch("/users/me", {
        fullName: form.fullName,
        phone: form.phone,
        shippingAddress: form.shippingAddress,
      });

      const u = res.data?.user;

      setForm((prev) => ({
        ...prev,
        fullName: u?.fullName || prev.fullName,
        phone: u?.phone || prev.phone,
        shippingAddress: u?.shippingAddress || prev.shippingAddress,
        role: u?.role || prev.role,
        email: u?.email || prev.email,
      }));

      setSuccess("Saved ✅");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const isUAE = useMemo(() => {
    const c = String(form.shippingAddress?.country || "").toLowerCase();
    return (
      c === "united arab emirates" || c === "uae" || c === "u.a.e" || c.includes("emirates")
    );
  }, [form.shippingAddress?.country]);

  // ── Initials avatar ────────────────────────────────────────────────────────
  const initials = form.fullName
    ? form.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Dark hero header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 px-4 py-12">
        <div
          className="pointer-events-none absolute right-1/4 top-0 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #e8472a 100%)` }}
            >
              {loading ? "…" : initials}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                My Account
              </p>
              <h1 className="mt-0.5 text-2xl font-extrabold text-white">
                {loading ? "Loading…" : form.fullName || "Your Profile"}
              </h1>
              <p className="mt-0.5 text-sm text-white/40">
                {form.email || "Manage your profile and shipping address"}
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Package className="h-3.5 w-3.5" /> My Orders
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 py-10">

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
            >
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-3xl border border-slate-100 bg-white" />
            ))}
          </div>
        ) : (
          <form onSubmit={onSave} className="space-y-5">

            {/* ── Profile details ────────────────────────────────── */}
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                  Profile
                </p>
                <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">Personal Details</h2>
                <p className="text-sm text-slate-500">Update your name and phone for faster checkout.</p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <Field icon={User} label="Full Name">
                  <input
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className={INPUT}
                    placeholder="Your name"
                  />
                </Field>

                <Field icon={Mail} label="Email">
                  <input value={form.email} disabled className={INPUT_DISABLED} />
                </Field>

                <Field icon={Phone} label="Phone">
                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={INPUT}
                    placeholder="+971..."
                  />
                </Field>

                <Field icon={ShieldCheck} label="Role">
                  <div className={INPUT_DISABLED}>
                    <span
                      className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-extrabold text-white"
                      style={{ background: form.role === "admin" ? "#0f172a" : ACCENT }}
                    >
                      {form.role.toUpperCase()}
                    </span>
                  </div>
                </Field>
              </div>
            </div>

            {/* ── Shipping address ───────────────────────────────── */}
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                  Shipping
                </p>
                <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">Saved Address</h2>
                <p className="text-sm text-slate-500">Auto-filled at checkout to save you time.</p>
              </div>

              <div className="space-y-4 p-6">
                <Field icon={MapPin} label="Address Line 1">
                  <input
                    value={form.shippingAddress.line1}
                    onChange={(e) => updateAddr("line1", e.target.value)}
                    className={INPUT}
                    placeholder="Address line 1"
                  />
                </Field>

                <Field label="Address Line 2">
                  <input
                    value={form.shippingAddress.line2}
                    onChange={(e) => updateAddr("line2", e.target.value)}
                    className={INPUT}
                    placeholder="Address line 2 (optional)"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City">
                    {isUAE ? (
                      <select
                        className={INPUT}
                        value={form.shippingAddress.city}
                        onChange={(e) => updateAddr("city", e.target.value)}
                        required
                      >
                        <option value="">Select city *</option>
                        {UAE_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={form.shippingAddress.city}
                        onChange={(e) => updateAddr("city", e.target.value)}
                        className={INPUT}
                        placeholder="City"
                        required
                      />
                    )}
                  </Field>

                  <Field label="Postcode">
                    <input
                      value={form.shippingAddress.postcode}
                      onChange={(e) => updateAddr("postcode", e.target.value)}
                      className={INPUT}
                      placeholder="Postcode"
                    />
                  </Field>
                </div>

                <Field label="Country">
                  <input
                    value={form.shippingAddress.country}
                    disabled
                    className={INPUT_DISABLED}
                    placeholder="Country"
                  />
                </Field>
              </div>
            </div>

            {/* ── Save ───────────────────────────────────────────── */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #e8472a 100%)` }}
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : "Save Changes"}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
}
