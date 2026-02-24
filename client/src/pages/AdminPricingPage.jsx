// client/src/pages/AdminPricingPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Admin Pricing Manager — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";

const ACCENT = "#FF633F";

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputBase =
  "rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#FF633F]/60 focus:ring-2 focus:ring-[#FF633F]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

// ─── Editable price cell ──────────────────────────────────────────────────────
function PriceInput({ value, onChange, disabled }) {
  return (
    <input
      type="number"
      min="0"
      step="1"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className={`w-24 ${inputBase}`}
    />
  );
}

function TextInput({ value, onChange, className = "w-32", disabled }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${className} ${inputBase}`}
    />
  );
}

// ─── Product pricing card ─────────────────────────────────────────────────────
function ProductCard({ product: initial, isAdmin }) {
  const [product, setProduct] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: "ok"|"err", msg }

  const updateVariant = (idx, field, value) => {
    setProduct((p) => ({
      ...p,
      variants: p.variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    }));
  };

  const updateOptionPrice = (key, name, price) => {
    setProduct((p) => ({
      ...p,
      options: {
        ...p.options,
        [key]: p.options[key].map((o) => (o.name === name ? { ...o, price } : o)),
      },
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setToast(null);
      await api.patch(`/admin/products/${product.slug}`, {
        variants: product.variants.map(({ sku, size, orientation, basePrice }) => ({
          sku,
          size,
          orientation,
          basePrice,
        })),
        options: {
          mounts: product.options.mounts,
          frames: product.options.frames,
          mats: product.options.mats,
          materials: product.options.materials || [],
        },
      });
      setToast({ type: "ok", msg: "Saved!" });
    } catch (err) {
      setToast({ type: "err", msg: err?.response?.data?.message || err.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const OPTION_KEYS = ["mounts", "frames", "mats", "materials"];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">

      {/* ── Card header ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #e8472a 100%)` }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{product.type}</p>
          <h2 className="mt-0.5 text-lg font-extrabold text-white">{product.name}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                  toast.type === "ok"
                    ? "bg-white/20 text-white"
                    : "bg-red-600/80 text-white"
                }`}
              >
                {toast.type === "ok" ? "✓ " : "✕ "}{toast.msg}
              </motion.span>
            )}
          </AnimatePresence>

          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold shadow transition hover:bg-white/90 disabled:opacity-60"
              style={{ color: ACCENT }}
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FF633F]/30 border-t-[#FF633F]" />
                  Saving…
                </span>
              ) : "Save"}
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Card body ───────────────────────────────────────────────── */}
      <div className="space-y-6 p-6">

        {/* Variants table */}
        {product.variants.length > 0 && (
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Variants · Size Pricing
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    {["SKU", "Size", "Orientation", "Base Price (AED)"].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v, i) => (
                    <tr
                      key={i}
                      className={`border-b border-slate-100 last:border-0 transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <TextInput value={v.sku} onChange={(val) => updateVariant(i, "sku", val)}
                          className="w-40" disabled={!isAdmin} />
                      </td>
                      <td className="px-4 py-2.5">
                        <TextInput value={v.size} onChange={(val) => updateVariant(i, "size", val)}
                          className="w-24" disabled={!isAdmin} />
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={v.orientation}
                          onChange={(e) => updateVariant(i, "orientation", e.target.value)}
                          disabled={!isAdmin}
                          className={`${inputBase}`}
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                          <option value="square">Square</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <PriceInput value={v.basePrice}
                          onChange={(price) => updateVariant(i, "basePrice", price)}
                          disabled={!isAdmin} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Options grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPTION_KEYS.map((key) => {
            const opts = product.options?.[key];
            if (!Array.isArray(opts) || opts.length === 0) return null;
            return (
              <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {key}
                </p>
                <div className="space-y-2">
                  {opts.map((o) => (
                    <div key={o.name} className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-700">{o.name}</span>
                      <PriceInput
                        value={o.price}
                        onChange={(price) => updateOptionPrice(key, o.name, price)}
                        disabled={!isAdmin}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPricingPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await api.get("/auth/me");
        const user = me.data?.user;
        if (!user || !["admin", "manager"].includes(user.role)) {
          navigate("/login", { replace: true });
          return;
        }
        if (alive) setIsAdmin(user.role === "admin");

        const res = await api.get("/admin/products");
        if (alive) setProducts(res.data?.products || []);
      } catch {
        if (alive) setError("Failed to load products. Make sure you are logged in as admin.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Dark header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 px-4 py-10">
        <div
          className="pointer-events-none absolute right-1/4 top-0 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Admin Panel
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-white">Pricing Manager</h1>
              <p className="mt-1 text-sm text-white/40">
                Edit variant and option prices for all products. Click{" "}
                <span className="font-bold text-white/70">Save</span> per product to apply.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/admin")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              ← Back to Orders
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map(n => (
              <div key={n} className="h-64 animate-pulse rounded-3xl border border-slate-100 bg-white" />
            ))}
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <p className="text-sm text-slate-400">No products found in the database.</p>
          </div>
        )}

        {/* Product cards */}
        <div className="space-y-6">
          {products.map((p, idx) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={p} isAdmin={isAdmin} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
