// client/src/pages/UserOrdersPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern User Orders page — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";

const ACCENT = "#FF633F";

// ─── Status badge ─────────────────────────────────────────────────────────────
function statusUi(statusRaw) {
  const s = String(statusRaw || "").toLowerCase();

  if (["paid", "processing", "shipped", "completed"].includes(s))
    return { label: s.charAt(0).toUpperCase() + s.slice(1), dot: "#22c55e", bg: "#f0fdf4", border: "#86efac", text: "#166534" };

  if (s === "requires_payment" || s === "payment_required")
    return { label: "Payment Required", dot: ACCENT, bg: `${ACCENT}15`, border: `${ACCENT}55`, text: ACCENT };

  if (s === "cancelled" || s === "refunded")
    return { label: s.charAt(0).toUpperCase() + s.slice(1), dot: "#f43f5e", bg: "#fff1f2", border: "#fecdd3", text: "#9f1239" };

  return { label: statusRaw || "Pending", dot: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getItemThumbUrls(it) {
  const items = it?.assets?.items;
  if (Array.isArray(items) && items.length > 0)
    return items.map((x) => x?.previewUrl || x?.originalUrl).filter(Boolean);
  const single = it?.assets?.previewUrl || it?.assets?.originalUrl;
  return single ? [single] : [];
}

function humanSlug(slug) {
  return (slug || "Custom Print")
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isWeddingFrameItem(item) {
  return item?.productSlug === "wedding-frame" || item?.productSlug === "wedding-print";
}

// ─── Stacked thumbnails ───────────────────────────────────────────────────────
function ThumbStack({ urls, alt = "preview" }) {
  const stack = (urls || []).slice(0, 3);

  if (!urls?.length) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[9px] font-bold text-slate-400">
        No img
      </div>
    );
  }

  if (urls.length === 1) {
    return (
      <img
        src={stack[0]}
        alt={alt}
        className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover bg-white"
        loading="lazy"
      />
    );
  }

  return (
    <div className="relative h-14 w-14 shrink-0">
      {stack.map((u, i) => (
        <img
          key={u + i}
          src={u}
          alt={`${alt}-${i}`}
          className="absolute h-14 w-14 rounded-xl border border-slate-200 object-cover bg-white shadow-sm"
          style={{ transform: `translate(${i * 3}px, ${i * 3}px)`, zIndex: 10 - i }}
          loading="lazy"
        />
      ))}
      {urls.length > 3 && (
        <div className="absolute -bottom-1 -right-1 z-20 rounded-full border border-white bg-slate-900 px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow">
          +{urls.length - 3}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function UserOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login", { state: { from: "/orders" }, replace: true });
          return;
        }
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-4xl font-extrabold text-white"
        >
          My Orders
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="mt-2 text-sm text-white/50"
        >
          Track and manage all your Golden Art Frames orders
        </motion.p>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-10">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              <b>Error:</b> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 animate-pulse rounded-3xl border border-slate-100 bg-white" />
            ))}
          </div>

        /* Empty state */
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm"
          >
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
              style={{ background: `${ACCENT}15` }}
            >
              📦
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">No Orders Yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              When you place an order, it will appear here with full status and details.
            </p>
            <motion.div whileTap={{ scale: 0.97 }} className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.03]"
                style={{ background: ACCENT }}
              >
                Start Shopping
              </Link>
            </motion.div>
          </motion.div>

        /* Orders list */
        ) : (
          <div className="space-y-5">
            {orders.map((o, oIdx) => {
              const st = statusUi(o.status);
              const orderNo = String(o.orderNumber ?? "").padStart(6, "0");
              const total = o.totals?.grandTotal ?? o.totals?.subtotal;
              const currency = o.totals?.currency;
              const itemCount = (o.items || []).length;

              return (
                <motion.div
                  key={o._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: oIdx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm
                             transition-shadow duration-300 hover:shadow-md"
                >
                  {/* ── Order header ──────────────────────────────────── */}
                  <div
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}08 0%, transparent 60%)` }}
                  >
                    {/* Left: order number + status + date */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900">
                        Order <span className="font-mono">#{orderNo}</span>
                      </span>

                      {/* Status pill */}
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold"
                        style={{ background: st.bg, borderColor: st.border, color: st.text }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />
                        {st.label}
                      </span>

                      <span className="text-xs text-slate-400">
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Right: total + CTAs */}
                    <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                        <p className="text-base font-extrabold" style={{ color: ACCENT }}>
                          {total} {currency}
                        </p>
                      </div>

                      <Link to={`/order/${o._id}`}>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          className="rounded-2xl px-4 py-2 text-xs font-extrabold text-white shadow-sm
                                     transition-all duration-300 hover:brightness-110"
                          style={{ background: ACCENT }}
                        >
                          View Details
                        </motion.button>
                      </Link>

                      <Link to="/products">
                        <button
                          type="button"
                          className="group rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50"
                        >
                          <span className="relative after:absolute after:left-0 after:-bottom-0.5
                                           after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                                           after:bg-[#FF633F] after:transition-transform after:duration-300
                                           group-hover:after:scale-x-100 group-hover:text-[#FF633F]">
                            Continue Shopping
                          </span>
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* ── Items grid ────────────────────────────────────── */}
                  <div className="px-6 pb-5 pt-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(o.items || []).slice(0, 4).map((it, idx) => {
                        const urls = getItemThumbUrls(it);
                        const isMini = Array.isArray(it?.assets?.items) && it.assets.items.length > 0;
                        const isWedding = isWeddingFrameItem(it);
                        const qty = isMini ? it.assets.items.length : Number(it.config?.quantity || 1);

                        const specs = [
                          it.config?.size && `Size: ${it.config.size}`,
                          it.config?.frame && `Frame: ${it.config.frame}`,
                          isMini && it.config?.mat ? `Type: ${it.config.mat}` : it.config?.mat ? `Mat: ${it.config.mat}` : null,
                          it.config?.material && `Matl: ${it.config.material}`,
                          isWedding && it.personalization?.groomName && it.personalization?.brideName
                            ? `${it.personalization.groomName} & ${it.personalization.brideName}`
                            : null,
                          `Qty: ${qty}`,
                        ].filter(Boolean).join(" · ");

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                          >
                            <ThumbStack urls={urls} alt={it.productSlug || "preview"} />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-extrabold text-slate-900">
                                {humanSlug(it.productSlug)}
                              </p>
                              <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
                                {specs}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(o.items || []).length > 4 && (
                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        +{(o.items || []).length - 4} more item{(o.items || []).length - 4 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}