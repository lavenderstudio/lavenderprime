/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorMiniFrame.jsx
// ----------------------------------------------------
// Mini-Frames Editor (quantity + N uploads)
// - Reads product.purchaseConfig to enforce quantity rules
// - Requires 1 upload per unit (perUnit uploads)
// - Sends correct productSlug/options/assets to backend
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import MiniFramePreview from "../components/MiniFramePreview.jsx";
import { MINI_FRAME_MAT as MINI_FRAME_MAT_CM } from "../lib/matSizes.js";
import { MINI_FRAME_MAT as MINI_FRAME_TYPE_OPTIONS, MINIFRAME_FRAME_OPTIONS } from "../lib/optionsUi.js";

// ✅ Theme tokens
import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

const PRODUCT_SLUG = "mini-frames";

export default function EditorMiniFrame() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");

  // UI options
  const [frame, setFrame] = useState("Black Wood"); // better default for mini-frames (match your seed names)
  const [mat, setMat] = useState("Classic");

  // Quantity + uploads
  const [quantity, setQuantity] = useState(3);
  // Each slot has its own image + ratio/crop data
  const [assets, setAssets] = useState([]); // [{ originalUrl, previewUrl, transform: { ratio, ratioW, ratioH } }]

  // quote
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");

  // Upload wizard
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // ----------------------------------------------------
  // Load product
  // ----------------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/products/${PRODUCT_SLUG}`);
        setProduct(res.data);

        const firstPortrait = res.data.variants?.find((v) => v.orientation === "portrait");
        if (firstPortrait) setVariantSku(firstPortrait.sku);

        // Initialize quantity from backend purchaseConfig if present
        const pc = res.data.purchaseConfig || {};
        const defaultQty = pc?.quantity?.enabled ? (pc.quantity.default || 1) : 1;
        setQuantity(defaultQty);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, []);

  // ----------------------------------------------------
  // Derived: variants
  // ----------------------------------------------------
  const portraitVariants = useMemo(() => {
    return (product?.variants || []).filter((v) => v.orientation === "portrait");
  }, [product]);

  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);

  // ----------------------------------------------------
  // Derived: purchase config rules
  // ----------------------------------------------------
  const purchaseConfig = product?.purchaseConfig || {};

  const qtyRules = purchaseConfig.quantity || {};
  const qtyEnabled = !!qtyRules.enabled;

  const qtyMin = Number.isFinite(qtyRules.min) ? qtyRules.min : 1;
  const qtyMax = Number.isFinite(qtyRules.max) ? qtyRules.max : 50;
  const qtyStep = Number.isFinite(qtyRules.step) ? qtyRules.step : 1;
  const allowedQuantities = Array.isArray(qtyRules.allowedQuantities) ? qtyRules.allowedQuantities : [];

  const uploadsRules = purchaseConfig.uploads || {};
  const uploadsEnabled = !!uploadsRules.enabled;
  const uploadsPerUnit = !!uploadsRules.perUnit;

  // How many uploads are required for this product + quantity?
  const requiredUploads = useMemo(() => {
    if (!uploadsEnabled) return 0;
    if (uploadsPerUnit) return Math.max(0, quantity);
    return Math.max(0, uploadsRules.fixedCount || 0);
  }, [uploadsEnabled, uploadsPerUnit, uploadsRules.fixedCount, quantity]);

  // ----------------------------------------------------
  // Keep assets array length aligned with requiredUploads
  // ----------------------------------------------------
  useEffect(() => {
    setAssets((prev) => {
      const next = [...prev];

      // Grow
      while (next.length < requiredUploads) {
        next.push({
          originalUrl: "",
          previewUrl: "",
          transform: null, // { ratio, ratioW, ratioH }
        });
      }

      // Shrink
      if (next.length > requiredUploads) {
        next.length = requiredUploads;
      }

      return next;
    });
  }, [requiredUploads]);

  // ----------------------------------------------------
  // Quantity setter that respects backend rules
  // ----------------------------------------------------
  const setQuantitySafe = (nextQty) => {
    // If backend restricts to allowedQuantities (e.g., [3,6,9]) enforce that
    if (allowedQuantities.length > 0) {
      // Pick closest allowed quantity
      let closest = allowedQuantities[0];
      for (const q of allowedQuantities) {
        if (Math.abs(q - nextQty) < Math.abs(closest - nextQty)) closest = q;
      }
      setQuantity(closest);
      return;
    }

    // Otherwise enforce min/max/step
    const clamped = Math.min(qtyMax, Math.max(qtyMin, nextQty));

    // Snap to step (relative to min)
    const snapped =
      qtyStep > 1 ? qtyMin + Math.round((clamped - qtyMin) / qtyStep) * qtyStep : clamped;

    setQuantity(snapped);
  };

  // ----------------------------------------------------
  // Quote pricing (now uses mini-frames slug + includes frame + mat)
  // ----------------------------------------------------
  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;

      try {
        const res = await api.post("/pricing/quote", {
          productSlug: PRODUCT_SLUG, // ✅ correct
          variantSku,
          options: {
            frame, // ✅ send frame if backend prices it (even if 0)
            mat,   // ✅ send mat
          },
          quantity,
        });

        setQuote(res.data);
      } catch (err) {
        setQuote(null);
        setError(err?.response?.data?.message || err.message);
      }
    };

    getQuote();
  }, [variantSku, frame, mat, quantity]);

  // ----------------------------------------------------
  // Mat math (your existing calc)
  // ----------------------------------------------------
  const matCm = MINI_FRAME_MAT_CM[mat] ?? 0;

  function parseCmSize(sizeStr) {
    // Accepts "12x18" or "12x18cm" or "12×18"
    if (!sizeStr) return null;

    const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
    const [w, h] = cleaned.split("x").map((n) => Number(n));

    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { w, h };
  }

  function totalWithMat(printW, printH, matCm2) {
    return {
      w: printW + matCm2 * 2,
      h: printH + matCm2 * 2,
    };
  }

  const parsedPrint = parseCmSize(selectedVariant?.size);
  const totalSize = parsedPrint ? totalWithMat(parsedPrint.w, parsedPrint.h, matCm) : null;

  // ----------------------------------------------------
  // Upload slot handlers
  // ----------------------------------------------------
  const openUploadForSlot = (idx) => {
    setActiveSlotIndex(idx);
    setIsUploadWizardOpen(true);
  };

  const hasAllUploads = useMemo(() => {
    // all slots must have an originalUrl + transform
    return assets.length === requiredUploads && assets.every((a) => a.originalUrl && a.transform);
  }, [assets, requiredUploads]);

  // ----------------------------------------------------
  // Add to cart (now sends correct slug + multi assets)
  // ----------------------------------------------------
  const handleAddToCart = async () => {
    try {
      setError("");

      if (!selectedVariant) return setError("Missing variant selection.");
      if (!quote) return setError("Price quote not available.");
      if (requiredUploads > 0 && !hasAllUploads) {
        return setError(`Please upload ${requiredUploads} photo(s) (one per frame).`);
      }

      const sessionId = getSessionId();

      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: PRODUCT_SLUG, // ✅ correct
          variantSku,

          // Keep config focused on selections (NOT price/assets)
          config: {
            orientation: "portrait",
            size: selectedVariant.size,
            frame,
            mat,
          },

          // Put quantity at item level (cleaner than inside config)
          quantity,

          // ✅ Multi assets
          assets: {
            items: assets.map((a) => ({
              originalUrl: a.originalUrl,
              previewUrl: a.previewUrl || "",
              transform: a.transform, // { ratio, ratioW, ratioH }
            })),
          },

          // Price snapshot from quote
          price: {
            unit: quote.unit,
            total: quote.total,
            currency: quote.currency,
          },
        },
      });

      navigate("/cart");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  // ----------------------------------------------------
  // UI components (your same tiles/pills)
  // ----------------------------------------------------
  function SizePills({ variants, value, onChange }) {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = v.sku === value;

          return (
            <button
              key={v.sku}
              type="button"
              onClick={() => onChange(v.sku)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition active:scale-[0.99]
                ${active ? `${ACCENT_BG} text-white` : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"}`}
            >
              {v.size}
            </button>
          );
        })}
      </div>
    );
  }

  function FrameTiles({ options, value, onChange }) {
    return (
      <div className="mt-3 grid grid-cols-2 xl:grid-cols-4 gap-3 transition">
        {options.map((opt) => {
          const active = opt.id === value;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`group rounded-2xl p-2 text-center transition active:scale-[0.99]
                ${
                  active
                    ? "ring-2 ring-[#FF633F]/60 bg-[#FF633F]/10 border border-[#FF633F]/20"
                    : "border border-slate-200 bg-white hover:bg-slate-50"
                }`}
            >
              <div className="mx-auto h-14 w-14 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                <img src={opt.img} alt={opt.id} className="h-full w-full object-cover" loading="lazy" />
              </div>

              <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                {opt.id}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function Segmented({ options, value, onChange }) {
    return (
      <div className="mt-3 rounded-full bg-slate-100 p-1 flex">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-extrabold transition
                ${active ? "bg-[#FF633F] text-white shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              {opt.name || opt.id}
            </button>
          );
        })}
      </div>
    );
  }

  const lockedRatioId = "1:1";

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------
  return (
    <Page title="Editor — Mini-Frames">
      <Container className="px-0">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-red-700 border border-red-200">
            <b>Error:</b> {error}
          </div>
        )}

        {!product ? (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Loading product…</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-12">
            {/* LEFT */}
            <div className="relative overflow-hidden rounded-3xl lg:col-span-7 border border-slate-200 bg-linear-to-b from-[#FF633F]/5 via-white to-white shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">
                    Frames: <b className="text-slate-900">{requiredUploads}</b> • Uploaded:{" "}
                    <b className="text-slate-900">{assets.filter((a) => a.originalUrl).length}</b>
                    /{requiredUploads}
                  </div>

                  {/* optional: bulk upload first empty */}
                  <button
                    type="button"
                    onClick={() => {
                      const firstEmpty = assets.findIndex((a) => !a.originalUrl);
                      openUploadForSlot(firstEmpty === -1 ? 0 : firstEmpty);
                    }}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-50 active:scale-[0.99]"
                  >
                    Upload next
                  </button>
                </div>

                {/* ✅ N frames grid */}
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
                  {assets.map((slot, idx) => {
                    const filled = !!slot.originalUrl;

                    return (
                      <div
                        key={idx}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        {/* Header */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-sm font-extrabold text-slate-900">
                            Frame #{idx + 1}
                          </div>

                          {filled ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openUploadForSlot(idx)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-50"
                              >
                                Change
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAssets((prev) => {
                                    const next = [...prev];
                                    next[idx] = { originalUrl: "", previewUrl: "", transform: null };
                                    return next;
                                  });
                                }}
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100"
                              >
                                Remove
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {/* Frame area */}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                          {filled ? (
                            <MiniFramePreview imageUrl={slot.originalUrl} frame={frame} mat={mat} />
                          ) : (
                            <button
                              type="button"
                              onClick={() => openUploadForSlot(idx)}
                              className="group flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center hover:bg-slate-50 active:scale-[0.99]"
                            >
                              <div className="text-sm font-extrabold text-slate-900">
                                Upload
                              </div>
                              <div className="mt-1 text-xs font-semibold text-slate-500">
                                Tap to upload photo for Frame #{idx + 1}
                              </div>

                              {/* little dot like your earlier UI */}
                              <span className="mt-4 h-3 w-3 rounded-full bg-[#FF633F] shadow" />
                            </button>
                          )}
                        </div>

                        {/* Footer status */}
                        <div className="mt-3 text-xs font-semibold text-slate-600">
                          {filled ? (
                            <span className="text-emerald-700">✅ Photo added</span>
                          ) : (
                            <span className="text-slate-500">No photo yet</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs font-semibold text-slate-500">
                  Preview only — final product may vary slightly.
                </p>
              </div>

            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5">
              <div
                className="
                  rounded-3xl border border-slate-200 bg-white p-5 shadow-sm
                  lg:sticky lg:top-17
                  lg:max-h
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Options</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Choose size, frame, mat and quantity.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#FF633F]/10 px-3 py-2 text-sm font-extrabold text-slate-900">
                    {quote ? `${quote.total} ${quote.currency}` : "—"}
                  </div>
                </div>

                {/* Sizes */}
                <div className="mt-6 pt-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-extrabold text-slate-900">Total Frame Sizes (CM)</span>

                    <span className="text-sm font-semibold text-slate-700">
                      Print Size:{" "}
                      <b className="text-slate-900">
                        {parsedPrint ? `${parsedPrint.w}x${parsedPrint.h}cm` : selectedVariant?.size || "-"}
                      </b>
                    </span>
                  </div>

                  <div className="mt-2">
                    <SizePills variants={portraitVariants} value={variantSku} onChange={setVariantSku} />
                  </div>

                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    Total Size: <b className="text-slate-900">{totalSize ? `${totalSize.w}x${totalSize.h}cm` : "—"}</b>
                  </div>
                </div>

                {/* Frame */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-extrabold text-slate-900">
                      Frame: <span className={`${ACCENT}`}>{frame}</span>
                    </label>
                  </div>

                  <FrameTiles options={MINIFRAME_FRAME_OPTIONS} value={frame} onChange={setFrame} />
                </div>

                {/* Mat */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-extrabold text-slate-900">
                      Frame Type
                    </label>

                    <span className="text-sm font-semibold text-slate-700">
                      {mat === "Modern" ? "No Border" : "With Border"}
                    </span>
                  </div>

                  <Segmented
                    options={MINI_FRAME_TYPE_OPTIONS}
                    value={mat}
                    onChange={setMat}
                  />
                </div>


                {/* Quantity (now respects backend rules) */}
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-extrabold text-slate-900">
                    {qtyRules.label || "Quantity"}
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantitySafe(quantity - qtyStep)}
                      className="h-11 w-11 rounded-2xl border border-slate-200 bg-white font-extrabold text-slate-900 hover:bg-slate-50"
                      disabled={!qtyEnabled && quantity <= 1}
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min={qtyMin}
                      max={qtyMax}
                      step={qtyStep}
                      value={quantity}
                      onChange={(e) => setQuantitySafe(Number(e.target.value))}
                      className="w-full rounded-2xl border text-center border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF633F]/50"
                    />

                    <button
                      type="button"
                      onClick={() => setQuantitySafe(quantity + qtyStep)}
                      className="h-11 w-11 rounded-2xl border border-slate-200 bg-white font-extrabold text-slate-900 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>

                  {allowedQuantities.length > 0 && (
                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      Allowed quantities: <b>{allowedQuantities.join(", ")}</b>
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-700">
                    <b className="text-slate-900">Selected:</b>{" "}
                    {selectedVariant ? `${selectedVariant.size}` : "-"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    <b className="text-slate-900">Frame Style:</b> {mat} ({matCm}cm)
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    <b className="text-slate-900">Quantity:</b> {quantity}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    <b className="text-slate-900">Uploads:</b>{" "}
                    {assets.filter(a => a.originalUrl).length}/{requiredUploads}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    <b className="text-slate-900">Price:</b> {quote ? `${quote.total} ${quote.currency}` : "—"}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 lg:sticky lg:top-24">
                  <button
                    disabled={!quote || (requiredUploads > 0 && !hasAllUploads)}
                    onClick={handleAddToCart}
                    className={`w-full rounded-2xl px-4 py-3 font-extrabold shadow-sm transition active:scale-[0.99]
                      ${
                        !quote || (requiredUploads > 0 && !hasAllUploads)
                          ? "cursor-not-allowed bg-slate-100 text-slate-500 border border-slate-200"
                          : `${ACCENT_BG} ${ACCENT_HOVER} text-white transition-all hover:scale-105 duration-300`
                      }`}
                  >
                    Add to Cart
                  </button>

                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Secure checkout • Premium packaging • Doorstep delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload wizard */}
        <UploadWizardModal
          isOpen={isUploadWizardOpen}
          onClose={() => setIsUploadWizardOpen(false)}
          lockedRatioId={lockedRatioId}
          onComplete={({ ratio, imageUrl }) => {
            setAssets((prev) => {
              const next = [...prev];
              next[activeSlotIndex] = {
                ...next[activeSlotIndex],
                originalUrl: imageUrl,
                transform: {
                  ratio: ratio.id,
                  ratioW: ratio.w,
                  ratioH: ratio.h,
                },
              };
              return next;
            });
          }}
        />

        <div className="mb-3">
          <Link to="/products" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
            >
              &#8592; Back to Products
            </button>
          </Link>
        </div>
      </Container>
    </Page>
  );
}
