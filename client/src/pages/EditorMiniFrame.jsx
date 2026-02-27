/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorMiniFrame.jsx

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import MiniFramePreview from "../components/MiniFramePreview.jsx";
import { MINI_FRAME_MAT as MINI_FRAME_MAT_CM } from "../lib/matSizes.js";
import { MINI_FRAME_MAT as MINI_FRAME_TYPE_OPTIONS, MINIFRAME_FRAME_OPTIONS } from "../lib/optionsUi.js";

import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

const PRODUCT_SLUG = "mini-frames";

function parseCmSize(sizeStr) {
  if (!sizeStr) return null;
  const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
  const [w, h] = cleaned.split("x").map((n) => Number(n));
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { w, h };
}

function totalWithMat(printW, printH, matCm) {
  return { w: printW + matCm * 2, h: printH + matCm * 2 };
}

function SectionLabel({ children }) {
  return <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{children}</p>;
}

function SizePills({ variants, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const active = v.sku === value;
        return (
          <button key={v.sku} type="button" onClick={() => onChange(v.sku)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95
              ${active ? `${ACCENT_BG} text-white shadow-md shadow-[#FF633F]/25` : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            {v.size}
          </button>
        );
      })}
    </div>
  );
}

function FrameTiles({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button key={opt.id} type="button" onClick={() => onChange(opt.id)}
            className={`group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all duration-200 active:scale-95
              ${active ? "ring-2 ring-[#FF633F] bg-[#FF633F]/8 border border-[#FF633F]/30" : "border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 shadow-sm">
              <img src={opt.img} alt={opt.id} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <span className={`text-[9px] font-bold uppercase leading-tight tracking-wide text-center ${active ? "text-[#FF633F]" : "text-slate-500"}`}>
              {opt.id.replace(" Wood", "").replace(" Metal", "")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex rounded-full bg-slate-100 p-1">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button key={opt.id} type="button" onClick={() => onChange(opt.id)}
            className={`flex-1 rounded-full px-4 py-2 text-xs font-extrabold transition
              ${active ? "bg-[#FF633F] text-white shadow" : "text-slate-600 hover:text-slate-900"}`}>
            {opt.name || opt.id}
          </button>
        );
      })}
    </div>
  );
}

export default function EditorMiniFrame() {
  const navigate = useNavigate();
  const [product, setProduct]   = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame]       = useState("Black Wood");
  const [mat, setMat]           = useState("Classic");
  const [quantity, setQuantity] = useState(3);
  const [assets, setAssets]     = useState([]);
  const [quote, setQuote]       = useState(null);
  const [error, setError]       = useState("");
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex]       = useState(0);
  const lockedRatioId = "1:1";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/products/${PRODUCT_SLUG}`);
        setProduct(res.data);
        const firstPortrait = res.data.variants?.find((v) => v.orientation === "portrait");
        if (firstPortrait) setVariantSku(firstPortrait.sku);
        const pc = res.data.purchaseConfig || {};
        const defaultQty = pc?.quantity?.enabled ? (pc.quantity.default || 1) : 1;
        setQuantity(defaultQty);
      } catch (err) { setError(err?.response?.data?.message || err.message); }
    };
    load();
  }, []);

  const portraitVariants = useMemo(() => (product?.variants || []).filter((v) => v.orientation === "portrait"), [product]);
  const selectedVariant  = portraitVariants.find((v) => v.sku === variantSku);
  const purchaseConfig   = product?.purchaseConfig || {};
  const qtyRules         = purchaseConfig.quantity || {};
  const qtyEnabled       = !!qtyRules.enabled;
  const qtyMin           = Number.isFinite(qtyRules.min) ? qtyRules.min : 1;
  const qtyMax           = Number.isFinite(qtyRules.max) ? qtyRules.max : 50;
  const qtyStep          = Number.isFinite(qtyRules.step) ? qtyRules.step : 1;
  const allowedQuantities = Array.isArray(qtyRules.allowedQuantities) ? qtyRules.allowedQuantities : [];
  const uploadsRules     = purchaseConfig.uploads || {};
  const uploadsEnabled   = !!uploadsRules.enabled;
  const uploadsPerUnit   = !!uploadsRules.perUnit;
  const matCm            = MINI_FRAME_MAT_CM[mat] ?? 0;
  const parsedPrint      = parseCmSize(selectedVariant?.size);
  const totalSize        = parsedPrint ? totalWithMat(parsedPrint.w, parsedPrint.h, matCm) : null;

  const requiredUploads = useMemo(() => {
    if (!uploadsEnabled) return 0;
    if (uploadsPerUnit) return Math.max(0, quantity);
    return Math.max(0, uploadsRules.fixedCount || 0);
  }, [uploadsEnabled, uploadsPerUnit, uploadsRules.fixedCount, quantity]);

  useEffect(() => {
    setAssets((prev) => {
      const next = [...prev];
      while (next.length < requiredUploads) next.push({ originalUrl: "", previewUrl: "", transform: null });
      if (next.length > requiredUploads) next.length = requiredUploads;
      return next;
    });
  }, [requiredUploads]);

  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        const res = await api.post("/pricing/quote", { productSlug: PRODUCT_SLUG, variantSku, options: { frame, mat }, quantity });
        setQuote(res.data);
      } catch (err) { setQuote(null); setError(err?.response?.data?.message || err.message); }
    };
    getQuote();
  }, [variantSku, frame, mat, quantity]);

  const setQuantitySafe = (nextQty) => {
    if (allowedQuantities.length > 0) {
      let closest = allowedQuantities[0];
      for (const q of allowedQuantities) { if (Math.abs(q - nextQty) < Math.abs(closest - nextQty)) closest = q; }
      setQuantity(closest); return;
    }
    const clamped = Math.min(qtyMax, Math.max(qtyMin, nextQty));
    const snapped = qtyStep > 1 ? qtyMin + Math.round((clamped - qtyMin) / qtyStep) * qtyStep : clamped;
    setQuantity(snapped);
  };

  const hasAllUploads  = useMemo(() => assets.length === requiredUploads && assets.every((a) => a.originalUrl && a.transform), [assets, requiredUploads]);
  const uploadedCount  = useMemo(() => assets.filter((a) => a.originalUrl).length, [assets]);
  const openUploadForSlot = (idx) => { setActiveSlotIndex(idx); setIsUploadWizardOpen(true); };
  const canOrder = !!(quote && (requiredUploads === 0 || hasAllUploads));

  const handleAddToCart = async () => {
    try {
      setError("");
      if (!selectedVariant) return setError("Missing variant selection.");
      if (!quote) return setError("Price quote not available.");
      if (requiredUploads > 0 && !hasAllUploads) return setError(`Please upload ${requiredUploads} photo(s) (one per frame).`);
      const sessionId = getSessionId();
      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: PRODUCT_SLUG, variantSku,
          config: { orientation: "portrait", size: selectedVariant.size, frame, mat },
          quantity,
          assets: { items: assets.map((a) => ({ originalUrl: a.originalUrl, previewUrl: a.previewUrl || "", transform: a.transform })) },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  return (
    <Page title="Editor — Mini Frames">
      <Container className="px-0">
        <div className="px-4 pt-4">
          <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Products
          </Link>
        </div>

        {error && (
          <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}

        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Mini Frames</h1>
          <p className="mt-0.5 text-sm text-slate-500">A Set Of Small Square Frames, Each With Its Own Photo.</p>
        </div>

        {!product ? (
          <div className="mx-4 mt-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200 mb-3" /><div className="h-48 w-full rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:px-4 lg:pb-8">

            {/* LEFT: Frame slots grid */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-none lg:rounded-3xl border-0 border-b border-slate-200 lg:border bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF633F] shadow-sm shadow-[#FF633F]/50" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Frames</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{uploadedCount}/{requiredUploads}</span>
                  </div>
                  <button type="button"
                    onClick={() => { const firstEmpty = assets.findIndex((a) => !a.originalUrl); openUploadForSlot(firstEmpty === -1 ? 0 : firstEmpty); }}
                    className="flex items-center gap-1.5 rounded-xl border border-[#FF633F]/30 bg-[#FF633F]/8 px-3 py-1.5 text-xs font-bold text-[#FF633F] hover:bg-[#FF633F]/15 transition-all active:scale-95">
                    + Upload Next
                  </button>
                </div>

                <div className="px-5 pb-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {assets.map((slot, idx) => {
                      const filled = !!slot.originalUrl;
                      return (
                        <div key={idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 bg-slate-50">
                            <span className="text-xs font-extrabold text-slate-700">Frame #{idx + 1}</span>
                            {filled && (
                              <div className="flex gap-2">
                                <button type="button" onClick={() => openUploadForSlot(idx)} className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline">Change</button>
                                <button type="button"
                                  onClick={() => setAssets((prev) => { const next = [...prev]; next[idx] = { originalUrl: "", previewUrl: "", transform: null }; return next; })}
                                  className="text-xs font-bold text-red-400 hover:text-red-600 hover:underline">Remove</button>
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-slate-50">
                            {filled ? (
                              <MiniFramePreview imageUrl={slot.originalUrl} frame={frame} mat={mat} />
                            ) : (
                              <button type="button" onClick={() => openUploadForSlot(idx)}
                                className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white py-10 text-center hover:border-[#FF633F]/40 hover:bg-[#FF633F]/5 transition active:scale-[0.99]">
                                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md group-hover:scale-105 transition-transform">
                                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FF633F]/30 animate-spin [animation-duration:8s]" />
                                  <svg className="h-6 w-6 text-[#FF633F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-extrabold text-slate-900">Upload Photo</p>
                                  <p className="mt-0.5 text-xs text-slate-500">For Frame #{idx + 1}</p>
                                </div>
                              </button>
                            )}
                          </div>
                          <div className="px-4 py-2 text-[10px] font-semibold">
                            {filled
                              ? <span className="text-emerald-600">✓ Photo Added</span>
                              : <span className="text-slate-400">No Photo Yet</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-400">Preview only — final product may vary slightly.</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Options */}
            <div className="lg:col-span-5">
              <div className="flex flex-col gap-0">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:rounded-t-3xl lg:border lg:border-b-0">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Customise</h2>
                    <p className="text-xs text-slate-500">Size, Frame &amp; Quantity</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${quote ? "text-slate-900" : "text-slate-300"}`}>{quote ? `${quote.total}` : "—"}</div>
                    {quote && <div className="text-xs font-semibold text-slate-400">{quote.currency} · Set Of {quantity}</div>}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-t-0 border-slate-200 bg-white lg:rounded-b-3xl overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Frame Size</SectionLabel>
                      {parsedPrint && <span className="text-xs font-semibold text-slate-400">{parsedPrint.w}×{parsedPrint.h}cm print</span>}
                    </div>
                    <SizePills variants={portraitVariants} value={variantSku} onChange={setVariantSku} />
                    {totalSize && (
                      <p className="mt-2 text-[10px] font-semibold text-slate-400">
                        Total With Border: <b className="text-slate-600">{totalSize.w}×{totalSize.h}cm</b>
                      </p>
                    )}
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Frame Style</SectionLabel>
                      <span className={`text-xs font-bold ${ACCENT}`}>{frame}</span>
                    </div>
                    <FrameTiles options={MINIFRAME_FRAME_OPTIONS} value={frame} onChange={setFrame} />
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Border Type</SectionLabel>
                      <span className="text-xs font-semibold text-slate-400">{mat === "Modern" ? "No Border" : `${matCm}cm Border`}</span>
                    </div>
                    <Segmented options={MINI_FRAME_TYPE_OPTIONS} value={mat} onChange={setMat} />
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>{qtyRules.label || "Quantity"}</SectionLabel>
                      {allowedQuantities.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">Options: {allowedQuantities.join(", ")}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setQuantitySafe(quantity - qtyStep)} disabled={!qtyEnabled && quantity <= 1}
                        className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-lg font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40">−</button>
                      <input type="number" min={qtyMin} max={qtyMax} step={qtyStep} value={quantity}
                        onChange={(e) => setQuantitySafe(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-center text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF633F]/50" />
                      <button type="button" onClick={() => setQuantitySafe(quantity + qtyStep)}
                        className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-lg font-extrabold text-slate-700 hover:bg-slate-50">+</button>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-4">
                    <SectionLabel>Order Summary</SectionLabel>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      {[
                        ["Size", selectedVariant?.size || "—"],
                        ["Frame", frame],
                        ["Border", mat === "Modern" ? "None" : `${matCm}cm`],
                        ["Qty", quantity],
                        ["Uploaded", `${uploadedCount}/${requiredUploads}`],
                        ["Total", quote ? `${quote.total} ${quote.currency}` : "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex items-baseline justify-between col-span-2 sm:col-span-1">
                          <span className="font-semibold text-slate-400">{label}</span>
                          <span className="font-bold text-slate-700">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-5 py-4 lg:static lg:bg-transparent lg:border-0 lg:px-0 lg:pb-0 lg:pt-4">
                  {requiredUploads > 0 && !hasAllUploads && (
                    <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Upload All {requiredUploads} Photos To Continue ({uploadedCount}/{requiredUploads} Done)
                    </p>
                  )}
                  <button disabled={!canOrder} onClick={handleAddToCart}
                    className={`w-full rounded-2xl py-3.5 text-sm font-extrabold tracking-wide shadow-sm transition-all duration-300 active:scale-[0.98]
                      ${canOrder ? `${ACCENT_BG} ${ACCENT_HOVER} text-white shadow-lg shadow-[#FF633F]/30 hover:scale-[1.01]` : "cursor-not-allowed bg-slate-100 text-slate-400"}`}>
                    {canOrder ? `Add To Cart · ${quote?.total ?? ""} ${quote?.currency ?? ""}` : "Add To Cart"}
                  </button>
                  <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">🔒 Secure Checkout &nbsp;·&nbsp; Premium Packaging &nbsp;·&nbsp; Doorstep Delivery</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <UploadWizardModal
          isOpen={isUploadWizardOpen}
          onClose={() => setIsUploadWizardOpen(false)}
          lockedRatioId={lockedRatioId}
          onComplete={({ ratio, imageUrl }) => {
            setAssets((prev) => {
              const next = [...prev];
              next[activeSlotIndex] = { ...next[activeSlotIndex], originalUrl: imageUrl, transform: { ratio: ratio.id, ratioW: ratio.w, ratioH: ratio.h } };
              return next;
            });
          }}
        />
      </Container>
    </Page>
  );
}
