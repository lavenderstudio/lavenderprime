/* eslint-disable react-hooks/exhaustive-deps */
// client/src/pages/OrderSuccessPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Order Confirmation / Status page — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { CheckCircle2, AlertTriangle, RefreshCcw, CreditCard, ArrowLeft } from "lucide-react";

const ACCENT = "#FF633F";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusLabel(status) {
  return {
    requires_payment: "Payment Required",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    pending: "Pending",
  }[status] || status || "—";
}

function isPositiveStatus(status) {
  return ["paid", "processing", "shipped", "completed"].includes(status);
}

function isMultiAssets(assets) {
  return !!assets && Array.isArray(assets.items) && assets.items.length > 0;
}

function getThumbUrlFromItem(item) {
  const assets = item?.assets || {};
  if (isMultiAssets(assets)) {
    const first = assets.items.find((x) => x?.previewUrl || x?.originalUrl);
    return first?.previewUrl || first?.originalUrl || "";
  }
  return assets.previewUrl || assets.originalUrl || "";
}

function getMiniFramesCount(item) {
  const assets = item?.assets || {};
  if (!isMultiAssets(assets)) return 0;
  return assets.items.length;
}

function isWeddingFrameItem(item) {
  return item?.productSlug === "wedding-frame" || item?.productSlug === "wedding-print";
}

function humanSlug(slug) {
  return (slug || "Custom Print")
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Status badge colours ─────────────────────────────────────────────────────
function statusColors(status) {
  if (isPositiveStatus(status))
    return { bg: "#dcfce7", border: "#86efac", text: "#166534", icon: "#16a34a" };
  if (status === "requires_payment")
    return { bg: "#fefce8", border: "#fde047", text: "#713f12", icon: "#ca8a04" };
  return { bg: "#f1f5f9", border: "#cbd5e1", text: "#475569", icon: "#64748b" };
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(false);

  const POLL_EVERY_MS = 2000;
  const POLL_MAX_MS   = 30000;
  const pollTimerRef  = useRef(null);
  const pollStartRef  = useRef(0);

  const isPaid = useMemo(
    () => ["paid", "processing", "shipped", "completed"].includes(order?.status),
    [order]
  );

  const loadOrder = async () => {
    const res = await api.get(`/orders/${id}`);
    setOrder(res.data);
    return res.data;
  };

  // ── Polling logic (unchanged) ──────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const startPollingIfNeeded = (freshOrder) => {
      if (freshOrder?.status !== "requires_payment") return;
      if (pollTimerRef.current) return;

      setPolling(true);
      pollStartRef.current = Date.now();

      pollTimerRef.current = setInterval(async () => {
        try {
          const latest = await api.get(`/orders/${id}`);
          if (!isMounted) return;
          setOrder(latest.data);
          if (latest.data?.status && latest.data.status !== "requires_payment") {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setPolling(false);
            return;
          }
          const elapsed = Date.now() - pollStartRef.current;
          if (elapsed >= POLL_MAX_MS) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setPolling(false);
          }
        } catch (e) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
          setPolling(false);
          setError(e?.response?.data?.message || e.message);
        }
      }, POLL_EVERY_MS);
    };

    const init = async () => {
      try {
        setError("");
        const fresh = await loadOrder();
        if (!isMounted) return;
        startPollingIfNeeded(fresh);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [id]);

  const colors = order ? statusColors(order.status) : null;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: isPaid ? "#22c55e" : ACCENT }}
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
          {isPaid ? "Order Confirmed 🎉" : "Order Status"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="mt-2 text-sm text-white/50"
        >
          {isPaid
            ? "Thank you! Your order is on its way."
            : "Check your payment status below"}
        </motion.p>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-5"
        >
          <Link
            to="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-white/40
                       transition-all duration-300 hover:text-white/80"
          >
            <ArrowLeft size={14} />
            <span className="relative after:absolute after:left-0 after:-bottom-0.5
                             after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                             after:bg-white/60 after:transition-transform after:duration-300
                             group-hover:after:scale-x-100">
              Back To Products
            </span>
          </Link>
        </motion.div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10">

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

        {/* Loading */}
        {!order ? (
          <div className="space-y-4">
            <div className="h-36 animate-pulse rounded-3xl border border-slate-100 bg-white" />
            <div className="h-64 animate-pulse rounded-3xl border border-slate-100 bg-white" />
          </div>
        ) : (
          <>
            {/* ── Status banner ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 overflow-hidden rounded-3xl border shadow-sm"
              style={{ borderColor: colors.border, background: colors.bg }}
            >
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">

                {/* Left info */}
                <div className="flex items-start gap-4">
                  <div
                    className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: colors.icon }}
                  >
                    {isPositiveStatus(order.status) ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-white" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-extrabold" style={{ color: colors.text }}>
                        {statusLabel(order.status)}
                      </span>
                      {polling && (
                        <span className="animate-pulse rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                          Checking…
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm font-semibold" style={{ color: colors.text, opacity: 0.75 }}>
                      {order.status === "requires_payment"
                        ? "Waiting for payment confirmation. If you just paid, this may take a few seconds."
                        : "Payment confirmed. Your order will move through processing and shipping next."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold" style={{ color: colors.text, opacity: 0.65 }}>
                      <span>
                        Order #<span className="font-mono font-extrabold">
                          {String(order.orderNumber ?? "").padStart(6, "0")}
                        </span>
                      </span>
                      <span>
                        ID: <span className="font-mono">{order._id}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA buttons (requires_payment only) */}
                {order.status === "requires_payment" && (
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/checkout")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110"
                      style={{ background: ACCENT }}
                    >
                      <CreditCard size={15} />
                      Pay Now / Retry
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={async () => {
                        try { setError(""); await loadOrder(); }
                        catch (e) { setError(e?.response?.data?.message || e.message); }
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50"
                    >
                      <RefreshCcw size={14} />
                      Refresh
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Main grid ──────────────────────────────────────────────── */}
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">

              {/* LEFT: items */}
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

                  <div
                    className="px-6 py-5"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}12 0%, transparent 70%)` }}
                  >
                    <h3 className="text-lg font-extrabold text-slate-900">Order Details</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""} in this order
                    </p>
                  </div>

                  <div className="space-y-3 p-6">
                    {order.items.map((item, idx) => {
                      const cfg = item.config || {};
                      const thumb = getThumbUrlFromItem(item);
                      const isMiniFrames = item.productSlug === "mini-frames";
                      const miniCount = getMiniFramesCount(item);

                      // Build spec string
                      let specs = "";
                      if (isMiniFrames) {
                        specs = [
                          `${miniCount} photos`,
                          cfg.frame && `Frame: ${cfg.frame}`,
                          cfg.mat && `Type: ${cfg.mat}`,
                          cfg.size && `Size: ${cfg.size}`,
                        ].filter(Boolean).join(" · ");
                      } else if (isWeddingFrameItem(item)) {
                        specs = [
                          cfg.size && `Size: ${cfg.size}`,
                          cfg.frame && `Frame: ${cfg.frame}`,
                          cfg.mat && `Mat: ${cfg.mat}`,
                          `Qty ${cfg.quantity || 1}`,
                          item.personalization?.groomName && item.personalization?.brideName &&
                            `${item.personalization.groomName} & ${item.personalization.brideName}`,
                          item.personalization?.location && `📍 ${item.personalization.location}`,
                          item.personalization?.weddingDate && `🗓 ${item.personalization.weddingDate}`,
                        ].filter(Boolean).join(" · ");
                      } else {
                        specs = [
                          cfg.material && `Material: ${cfg.material}`,
                          cfg.frame && `Frame: ${cfg.frame}`,
                          cfg.mat && `Mat: ${cfg.mat}`,
                          cfg.size && `Size: ${cfg.size}`,
                          `Qty ${cfg.quantity || 1}`,
                        ].filter(Boolean).join(" · ");
                      }

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"
                        >
                          {/* Thumb */}
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            {thumb ? (
                              <img src={thumb} alt="preview" className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-slate-400">
                                No img
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold text-slate-900">{humanSlug(item.productSlug)}</p>
                            <p className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-400">{specs}</p>
                            {/* Wedding personalisation message */}
                            {isWeddingFrameItem(item) && item.personalization?.message && (
                              <p className="mt-1 text-[11px] italic text-slate-500">
                                "{item.personalization.message}"
                              </p>
                            )}
                          </div>

                          {/* Price */}
                          <div className="sm:ml-auto sm:text-right shrink-0">
                            <p className="text-sm font-extrabold" style={{ color: ACCENT }}>
                              {item.price?.total} {item.price?.currency}
                            </p>
                            {item.variantSku && (
                              <p className="mt-0.5 text-[10px] text-slate-400 font-mono">
                                {item.variantSku}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Trust footer inside card */}
                  <div className="px-6 pb-6">
                    <div className="flex flex-wrap gap-2">
                      {["📦 Premium packaging", "🚚 Doorstep delivery", "💬 Support available"].map(t => (
                        <span
                          key={t}
                          className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Summary (sticky) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

                  <div
                    className="px-6 py-5"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, transparent 70%)` }}
                  >
                    <h3 className="text-lg font-extrabold text-slate-900">Summary</h3>
                  </div>

                  <div className="px-6 pb-6 pt-4">
                    <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-extrabold text-slate-900">
                          {order.totals.subtotal} {order.totals.currency}
                        </span>
                      </div>

                      {"shipping" in order.totals && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Shipping</span>
                          <span className="font-extrabold text-slate-900">
                            {order.totals.shipping} {order.totals.currency}
                          </span>
                        </div>
                      )}

                      {"tax" in order.totals && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Tax</span>
                          <span className="font-extrabold text-slate-900">
                            {order.totals.tax} {order.totals.currency}
                          </span>
                        </div>
                      )}

                      {"discount" in order.totals && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Discount</span>
                          <span className="font-extrabold text-emerald-600">
                            −{order.totals.discount} {order.totals.currency}
                          </span>
                        </div>
                      )}

                      {"grandTotal" in order.totals && (
                        <>
                          <div className="h-px bg-slate-200" />
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">Total</span>
                            <span className="text-lg font-extrabold" style={{ color: ACCENT }}>
                              {order.totals.grandTotal} {order.totals.currency}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Context note */}
                    <p className="mt-4 text-xs text-slate-400 text-center">
                      {order.status === "requires_payment"
                        ? "Page auto-updates when payment is confirmed."
                        : `Thank you for shopping with Golden Art Frames!`}
                    </p>

                    {/* Contact CTA */}
                    <motion.div whileTap={{ scale: 0.97 }} className="mt-4">
                      <Link
                        to="/contact"
                        className="flex w-full items-center justify-center rounded-2xl py-3 text-sm font-extrabold text-white
                                   transition-all duration-300 hover:brightness-110"
                        style={{ background: ACCENT }}
                      >
                        Need Help? Contact Us
                      </Link>
                    </motion.div>

                    {/* View all orders */}
                    <Link
                      to="/orders"
                      className="group mt-3 flex w-full items-center justify-center text-sm font-semibold text-slate-400
                                 transition-all duration-300 hover:text-slate-700"
                    >
                      <span className="relative after:absolute after:left-0 after:-bottom-0.5
                                       after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                                       after:bg-[#FF633F] after:transition-transform after:duration-300
                                       group-hover:after:scale-x-100 group-hover:text-[#FF633F]">
                        View All Orders →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
