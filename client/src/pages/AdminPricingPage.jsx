// client/src/pages/AdminPricingPage.jsx
// ----------------------------------------------------
// Admin-only page to view and edit all product pricing.
// Variants (size/basePrice) and options (mounts, frames,
// mats, materials) can all be edited inline and saved per product.
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { Container, ACCENT_BG, ACCENT_HOVER, ACCENT } from "../components/home/ui.jsx";

// ─── Editable price cell ────────────────────────────────────────────────────
function PriceInput({ value, onChange, disabled }) {
  return (
    <input
      type="number"
      min="0"
      step="1"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-[#FF633F] focus:ring-1 focus:ring-[#FF633F]/20 disabled:bg-slate-100 disabled:text-slate-400"
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
      className={`${className} rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-[#FF633F] focus:ring-1 focus:ring-[#FF633F]/20 disabled:bg-slate-100 disabled:text-slate-400`}
    />
  );
}

// ─── Product pricing card ────────────────────────────────────────────────────
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
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Product header */}
      <div className={`flex items-center justify-between px-6 py-4 ${ACCENT_BG} text-white`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{product.type}</p>
          <h2 className="text-lg font-extrabold">{product.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          {toast && (
            <span
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                toast.type === "ok" ? "bg-white/20 text-white" : "bg-red-500/80 text-white"
              }`}
            >
              {toast.msg}
            </span>
          )}
          {isAdmin && (
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-[#FF633F] shadow hover:bg-white/90 disabled:opacity-60 transition"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Variants ── */}
        {product.variants.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              Variants (Size Pricing)
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-4 py-2.5 font-bold text-slate-600">SKU</th>
                    <th className="px-4 py-2.5 font-bold text-slate-600">Size</th>
                    <th className="px-4 py-2.5 font-bold text-slate-600">Orientation</th>
                    <th className="px-4 py-2.5 font-bold text-slate-600">Base Price (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v, i) => (
                    <tr
                      key={i}
                      className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                    >
                      <td className="px-4 py-2.5">
                        <TextInput
                          value={v.sku}
                          onChange={(val) => updateVariant(i, "sku", val)}
                          className="w-40"
                          disabled={!isAdmin}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <TextInput
                          value={v.size}
                          onChange={(val) => updateVariant(i, "size", val)}
                          className="w-24"
                          disabled={!isAdmin}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={v.orientation}
                          onChange={(e) => updateVariant(i, "orientation", e.target.value)}
                          disabled={!isAdmin}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-[#FF633F] disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                          <option value="square">Square</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <PriceInput
                          value={v.basePrice}
                          onChange={(price) => updateVariant(i, "basePrice", price)}
                          disabled={!isAdmin}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Options ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPTION_KEYS.map((key) => {
            const opts = product.options?.[key];
            if (!Array.isArray(opts) || opts.length === 0) return null;
            return (
              <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  {key}
                </p>
                <div className="space-y-2">
                  {opts.map((o) => (
                    <div key={o.name} className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-700 truncate">{o.name}</span>
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

// ─── Page ────────────────────────────────────────────────────────────────────
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
        // Auth check
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
    <Page title="Pricing Manager">
      <Container className="py-10">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Pricing Manager</h1>
            <p className="mt-1 text-sm text-slate-500">
              Edit variant and option prices for all products. Click <strong>Save</strong> per product to apply.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            ← Back to Orders
          </button>
        </div>

        {loading && (
          <div className="text-sm text-slate-500">Loading products…</div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-sm text-slate-500">No products found in the database.</div>
        )}

        <div className="space-y-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} isAdmin={isAdmin} />
          ))}
        </div>
      </Container>
    </Page>
  );
}
