// client/src/pages/CartPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Cart Page — matches HomePage / ProductsPage theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { MAT_CM } from "../lib/matSizes.js";
import { getSessionId } from "../lib/session.js";
import FramePreview from "../components/FramePreview.jsx";
import Canvas3DPreview from "../components/CanvasStretchedPreview.jsx";
import CollagePreview from "../components/CollagePreview.jsx";
import WeddingFramePreview from "../components/WeddingFramePreview.jsx";

const ACCENT = "#FF633F";

// ─── Helpers (unchanged) ─────────────────────────────────────────────────────
function parseCmSize(sizeStr) {
  if (!sizeStr) return null;
  const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
  const [w, h] = cleaned.split("x").map(Number);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { w, h };
}
function totalWithMat(w, h, matCm) {
  return { w: w + matCm * 2, h: h + matCm * 2 };
}
function isMultiAssets(assets) {
  return !!assets && Array.isArray(assets.items) && assets.items.length > 0;
}
function getPreviewFromCartItem(it) {
  const assets = it?.assets || {};
  if (isMultiAssets(assets)) {
    const first = assets.items.find((x) => x?.originalUrl || x?.previewUrl);
    return first?.originalUrl || first?.previewUrl || "";
  }
  if (assets.originalUrl || assets.previewUrl) return assets.originalUrl || assets.previewUrl || "";
  if (it?.originalUrl || it?.previewUrl) return it.originalUrl || it.previewUrl || "";
  return "";
}

// ─── Spec chip ───────────────────────────────────────────────────────────────
function Chip({ label, value }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <span className="mt-0.5 text-sm font-extrabold text-slate-800">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CART ITEM CARD
// ─────────────────────────────────────────────────────────────────────────────
function CartItemCard({ it, onRemove }) {
  const cfg = it.config || {};
  const assets = it.assets || {};
  const previewImg = getPreviewFromCartItem(it);
  const isMiniFrames = it.productSlug === "mini-frames";

  const print = parseCmSize(cfg.size);
  const hasFrame = typeof cfg.frame === "string" && cfg.frame.length > 0;
  const hasMat = typeof cfg.mat === "string" && cfg.mat.length > 0;
  const hasMaterial = typeof cfg.material === "string" && cfg.material.length > 0;
  const frame = hasFrame ? cfg.frame : null;
  const mat = hasMat ? cfg.mat : null;
  const matCm = mat ? (MAT_CM[mat] ?? 0) : 0;
  const total = print && mat ? totalWithMat(print.w, print.h, matCm) : null;

  function isCollageItem(item) {
    return item?.productSlug === "collage-frame" || item?.config?.orientation === "collage";
  }
  function isWeddingFrameItem(item) {
    return item?.productSlug === "wedding-frame" || item?.productSlug === "wedding-print";
  }

  // Build spec chips
  const chips = [];
  if (hasMaterial) chips.push({ label: "Material", value: cfg.material });
  if (frame) chips.push({ label: "Frame", value: frame });
  if (mat) chips.push({ label: isMiniFrames ? "Frame Type" : "Mat", value: isMiniFrames ? mat : `${mat} (${matCm}cm)` });
  chips.push({ label: "Print Size", value: print ? `${print.w}×${print.h}cm` : cfg.size || "—" });
  if (mat && total) chips.push({ label: "Total Size", value: `${total.w}×${total.h}cm` });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm
                 transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="grid gap-0 sm:grid-cols-[240px,1fr]">

        {/* ── Preview panel ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-center bg-slate-50 p-5">
          {isCollageItem(it) && isMultiAssets(assets) ? (
            <CollagePreview
              frame={frame || "Black Wood"}
              mat={mat || "None"}
              layout={cfg.layout || "square"}
              imageCount={cfg.imageCount || assets.items.length}
              assets={assets.items}
              maxWidthClass="max-w-[240px]"
            />
          ) : isMiniFrames && isMultiAssets(assets) ? (
            <div className="grid grid-cols-2 gap-2 w-full">
              {assets.items.map((a, idx) => {
                const url = a?.originalUrl || a?.previewUrl || "";
                return (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-1.5">
                    {url ? (
                      <FramePreview imageUrl={url} frame={frame || "Black Wood"} mat={mat || "None"} />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-400">
                        No image
                      </div>
                    )}
                    <p className="mt-1 text-center text-[10px] font-extrabold text-slate-500">#{idx + 1}</p>
                  </div>
                );
              })}
            </div>
          ) : it.productSlug === "multiple-prints" && isMultiAssets(assets) ? (
            <div className="relative flex h-52 w-full items-center justify-center isolate">
              {assets.items.slice(0, 3).reverse().map((a, idx, arr) => {
                const reverseIdx = arr.length - 1 - idx;
                const url = a?.originalUrl || a?.previewUrl || "";
                const yOffset = reverseIdx * -5;
                const xOffset = reverseIdx * 5;
                const rotate = reverseIdx % 2 === 0 ? reverseIdx * 3 : reverseIdx * -3;
                const scale = 1 - reverseIdx * 0.05;
                return (
                  <div
                    key={idx}
                    className="absolute w-40 overflow-hidden rounded-sm border-[3px] border-white bg-white shadow-xl transition hover:z-20 hover:scale-105"
                    style={{ transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotate}deg) scale(${scale})`, zIndex: idx }}
                  >
                    <img src={url} alt="" className="block h-auto w-full object-cover" />
                  </div>
                );
              })}
              {assets.items.length > 3 && (
                <div className="absolute bottom-2 right-3 z-20 rounded-full border border-white/20 bg-slate-900/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm shadow-sm">
                  +{assets.items.length - 3} photos
                </div>
              )}
            </div>
          ) : (
            <>
              {previewImg ? (
                <>
                  {isWeddingFrameItem(it) ? (
                    <WeddingFramePreview
                      imageUrl={previewImg}
                      frame={frame || "White Wood"}
                      groomName={it.personalization?.groomName}
                      brideName={it.personalization?.brideName}
                      locationText={it.personalization?.location}
                      weddingDateText={it.personalization?.weddingDate}
                      message={it.personalization?.message}
                      maxWidthClass="max-w-[220px]"
                    />
                  ) : frame === "Stretched" ? (
                    <Canvas3DPreview imageUrl={previewImg} />
                  ) : (
                    <FramePreview imageUrl={previewImg} frame={frame || "White Wood"} mat={mat || "None"} />
                  )}
                </>
              ) : (
                <div className="flex aspect-4/3 w-full items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-400">
                  No image
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Details ───────────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between p-6">

          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {it.productSlug
                    ?.split("-")
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ") || "Item"}
                </h3>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                  {it.variantSku}
                </span>
              </div>

              {/* Spec chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {chips.map(c => <Chip key={c.label} {...c} />)}
              </div>

              {/* Wedding personalisation */}
              {isWeddingFrameItem(it) && it.personalization && (
                <div className="mt-4 rounded-2xl border border-[#FF633F]/20 bg-[#FF633F]/5 p-4 text-sm">
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: ACCENT }}>
                    Personalisation
                  </p>
                  {it.personalization.groomName && it.personalization.brideName && (
                    <p className="text-slate-700"><span className="font-extrabold text-slate-900">Names: </span>{it.personalization.groomName} &amp; {it.personalization.brideName}</p>
                  )}
                  {it.personalization.location && (
                    <p className="text-slate-700"><span className="font-extrabold text-slate-900">Location: </span>{it.personalization.location}</p>
                  )}
                  {it.personalization.weddingDate && (
                    <p className="text-slate-700"><span className="font-extrabold text-slate-900">Date: </span>{it.personalization.weddingDate}</p>
                  )}
                  {it.personalization.message && (
                    <p className="mt-1 italic text-slate-500">"{it.personalization.message}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Remove button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onRemove(it._id)}
              className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold
                         text-slate-500 shadow-sm transition-all duration-300
                         hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              Remove
            </motion.button>
          </div>

          {/* Price bar */}
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-sm text-slate-500">
              Unit price:{" "}
              <span className="font-extrabold text-slate-800">
                {it.price?.unit ?? "—"} {it.price?.currency || "AED"}
              </span>
            </div>
            <div className="text-base font-extrabold" style={{ color: ACCENT }}>
              {it.price?.total ?? "—"} {it.price?.currency || "AED"}
            </div>
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Preview is for reference only. Final output may vary slightly due to screen calibration.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const sessionId = useMemo(() => getSessionId(), []);

  const handleProceedToCheckout = async () => {
    try {
      await api.get("/auth/me");
      navigate("/checkout");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/checkout" } });
      } else {
        setError(err.message);
      }
    }
  };

  const loadCart = async () => {
    try {
      setError("");
      const res = await api.get(`/cart/${sessionId}`);
      setCart(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const items = cart?.items || [];
    const subtotal = items.reduce((sum, it) => sum + (it?.price?.total || 0), 0);
    const currency = items[0]?.price?.currency || "AED";
    return { subtotal, currency };
  }, [cart]);

  const handleRemove = async (itemId) => {
    try {
      setError("");
      const res = await api.delete(`/cart/${sessionId}/items/${itemId}`);
      setCart(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const itemCount = cart?.items?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Hero header ─────────────────────────────────────────────────── */}
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
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-4xl font-extrabold text-white"
        >
          Your Cart
          {itemCount > 0 && (
            <span
              className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-base"
              style={{ background: ACCENT }}
            >
              {itemCount}
            </span>
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-2 text-sm text-white/50"
        >
          Review your items and proceed to checkout
        </motion.p>
      </section>

      {/* ── Body ────────────────────────────────────────────────────────── */}
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
        {!cart ? (
          <div className="space-y-4">
            {[1, 2].map(n => (
              <div key={n} className="h-52 animate-pulse rounded-3xl bg-white border border-slate-100" />
            ))}
          </div>

        /* Empty state */
        ) : itemCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm"
          >
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
              style={{ background: `${ACCENT}15` }}
            >
              🛒
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Your Cart Is Empty</h2>
            <p className="mt-2 text-sm text-slate-500">
              Start creating premium prints and frames with Golden Art Frames.
            </p>
            <motion.div whileTap={{ scale: 0.97 }} className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold
                           text-white shadow-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.03]"
                style={{ background: ACCENT }}
              >
                Browse Products
              </Link>
            </motion.div>
          </motion.div>

        /* Cart with items */
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">

            {/* Left — items */}
            <div className="space-y-5 lg:col-span-8">
              <AnimatePresence mode="popLayout">
                {(cart.items || []).map(it => (
                  <CartItemCard key={it._id} it={it} onRemove={handleRemove} />
                ))}
              </AnimatePresence>

              {/* Continue shopping link */}
              <div className="pt-2">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-400
                             transition-all duration-300 hover:text-slate-700"
                >
                  <span className="text-base">←</span>
                  <span className="relative after:absolute after:left-0 after:-bottom-0.5
                                   after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                                   after:bg-[#FF633F] after:transition-transform after:duration-300
                                   group-hover:after:scale-x-100 group-hover:text-[#FF633F]">
                    Continue Shopping
                  </span>
                </Link>
              </div>
            </div>

            {/* Right — Order summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

                {/* Summary header */}
                <div
                  className="px-6 py-5"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, transparent 70%)` }}
                >
                  <h3 className="text-lg font-extrabold text-slate-900">Order Summary</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                </div>

                <div className="px-6 pb-6">
                  {/* Line items */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-extrabold text-slate-900">
                        {totals.subtotal} {totals.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Delivery</span>
                      <span className="text-slate-400">Calculated at checkout</span>
                    </div>

                    <div className="h-px bg-slate-100 my-1" />

                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">Total</span>
                      <span className="text-lg font-extrabold" style={{ color: ACCENT }}>
                        {totals.subtotal} {totals.currency}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleProceedToCheckout}
                    disabled={!cart?.items?.length}
                    className="mt-5 w-full rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-sm
                               transition-all duration-300 hover:brightness-110 hover:scale-[1.02]
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ background: ACCENT }}
                  >
                    Proceed To Checkout
                  </motion.button>

                  {/* Trust pills */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["🔒 Secure checkout", "📦 Premium packaging", "🚚 UAE delivery"].map(t => (
                      <span
                        key={t}
                        className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-center text-xs text-slate-400">
                    Preview is for reference only.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
