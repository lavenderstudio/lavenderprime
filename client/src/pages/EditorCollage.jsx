/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorCollage.jsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import { FRAME_OPTIONS } from "../lib/optionsUi.js";
import FramePreview from "../components/FramePreview.jsx";

import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

const PRODUCT_SLUG = "collage-frame";

function layoutFromSku() { return "square"; }
function prettyLayout(layout) { return { square: "Square" }[layout] || layout; }

function SectionLabel({ children }) {
  return <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{children}</p>;
}

function FrameTiles({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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

function SegmentedCounts({ counts, value, onChange }) {
  return (
    <div className="rounded-full bg-slate-100 p-1 flex">
      {counts.map((c) => {
        const active = c === value;
        return (
          <button key={c} type="button" onClick={() => onChange(c)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-extrabold transition ${active ? "bg-[#FF633F] text-white shadow" : "text-slate-600 hover:text-slate-900"}`}>
            {c}
          </button>
        );
      })}
    </div>
  );
}

function CollageFramePreview({ frame, layout, imageCount, slots, onPickSlot, onRemoveSlot }) {
  const imageOrientation = useMemo(() => {
    if (layout === "square") return "square";
    const parts = String(layout || "").split("-");
    return parts[1] || parts[0] || "portrait";
  }, [layout]);

  const tileAspect = useMemo(() => {
    if (imageOrientation === "square") return "1 / 1";
    if (imageOrientation === "landscape") return "4 / 3";
    return "3 / 4";
  }, [imageOrientation]);

  const grid = useMemo(() => {
    if (imageCount === 4) return { cols: 2, rows: 2 };
    if (imageCount === 9) return { cols: 3, rows: 3 };
    if (imageCount === 16) return { cols: 4, rows: 4 };
    return { cols: 2, rows: 2 };
  }, [imageCount]);

  return (
    <div className="overflow-hidden rounded-none lg:rounded-3xl border-0 border-b border-slate-200 lg:border bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF633F] shadow-sm shadow-[#FF633F]/50" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Collage Preview</span>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{imageCount} Photos</span>
      </div>

      <div className="px-5 pb-5">
        <FramePreview frame={frame} aspectRatio="1:1" maxWidthClass="max-w-full">
          <div className="h-full w-full bg-white p-3">
            <div className="h-full w-full bg-slate-50 p-2 overflow-hidden">
              <div className="grid h-full w-full gap-2 overflow-auto" style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}>
                {slots.map((slot, idx) => {
                  const filled = !!slot?.originalUrl;
                  return (
                    <div key={idx} className="group relative overflow-hidden border border-slate-200 bg-white" style={{ aspectRatio: tileAspect }}>
                      {filled ? (
                        <>
                          <img src={slot.originalUrl} alt={`photo-${idx + 1}`} className="h-full w-full object-cover cursor-pointer" loading="lazy" onClick={() => onPickSlot(idx)} />
                          <div className="pointer-events-none absolute inset-0">
                            <div className="absolute left-2 top-2 bg-white/90 px-2 py-1 text-[11px] font-extrabold text-slate-900">#{idx + 1}</div>
                          </div>
                          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                            <button type="button" onClick={() => onPickSlot(idx)} className="bg-white px-2 py-1 text-[11px] font-extrabold text-slate-900 shadow-sm border border-slate-200">Change</button>
                            <button type="button" onClick={() => onRemoveSlot(idx)} className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-700 shadow-sm border border-red-200">Remove</button>
                          </div>
                        </>
                      ) : (
                        <button type="button" onClick={() => onPickSlot(idx)} className="flex h-full w-full items-center justify-center border-2 border-dashed border-slate-300 bg-white text-center hover:bg-slate-50 active:scale-[0.99]">
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">Upload</div>
                            <div className="mt-1 text-[11px] font-semibold text-slate-500">Photo #{idx + 1}</div>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FramePreview>
      </div>
      <p className="px-5 pb-4 text-xs font-semibold text-slate-400">Visual preview only — final crop may vary slightly.</p>
    </div>
  );
}

export default function EditorCollage() {
  const navigate = useNavigate();
  const [product, setProduct]       = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame]           = useState("Black Wood");
  const [imageCount, setImageCount] = useState(4);
  const [assets, setAssets]         = useState([]);
  const [quote, setQuote]           = useState(null);
  const [error, setError]           = useState("");
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex]       = useState(0);
  const allowedCounts = [4, 9, 16];

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const res = await api.get(`/products/${PRODUCT_SLUG}`);
        const p = res.data;
        setProduct(p);
        const firstSq = (p?.variants || []).find((v) => v?.sku?.startsWith("COL_SQ_"));
        if (firstSq?.sku) setVariantSku(firstSq.sku);
        setImageCount(4);
      } catch (err) { setError(err?.response?.data?.message || err.message); }
    };
    load();
  }, []);

  function skuForSquareCount(count) {
    if (count === 4) return "COL_SQ_31.5x31.5_4";
    if (count === 9) return "COL_SQ_43x43_9";
    if (count === 16) return "COL_SQ_54.5x54.5_16";
    return "COL_SQ_31.5x31.5_4";
  }

  const variants = useMemo(() => (product?.variants || []).filter((v) => v.sku.startsWith("COL_SQ_")), [product]);
  const selectedVariant = useMemo(() => variants.find((v) => v.sku === variantSku), [variants, variantSku]);
  const layout = useMemo(() => layoutFromSku(selectedVariant?.sku || ""), [selectedVariant]);
  const lockedRatioId = "1:1";
  const requiredUploads = imageCount;

  useEffect(() => {
    setAssets((prev) => {
      const next = [...prev];
      while (next.length < requiredUploads) next.push({ originalUrl: "", previewUrl: "", transform: null });
      if (next.length > requiredUploads) next.length = requiredUploads;
      return next;
    });
  }, [requiredUploads]);

  const uploadedCount = useMemo(() => assets.filter((a) => a.originalUrl).length, [assets]);
  const hasAllUploads = useMemo(() => assets.length === requiredUploads && assets.every((a) => a.originalUrl && a.transform), [assets, requiredUploads]);

  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        setError("");
        const res = await api.post("/pricing/quote", { productSlug: PRODUCT_SLUG, variantSku, options: { frame }, quantity: 1 });
        setQuote(res.data);
      } catch (err) { setQuote(null); setError(err?.response?.data?.message || err.message); }
    };
    getQuote();
  }, [variantSku, frame, layout, imageCount]);

  useEffect(() => { setVariantSku(skuForSquareCount(imageCount)); }, [imageCount]);

  const openUploadForSlot = (idx) => { setActiveSlotIndex(idx); setIsUploadWizardOpen(true); };

  const handleAddToCart = async () => {
    try {
      setError("");
      if (!selectedVariant) return setError("Missing variant selection.");
      if (!quote) return setError("Price quote not available.");
      if (!hasAllUploads) return setError(`Please Upload ${requiredUploads} Photo(s).`);
      const sessionId = getSessionId();
      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: PRODUCT_SLUG, variantSku,
          config: { orientation: "collage", size: selectedVariant.size, frame, layout, imageCount, quantity: 1 },
          assets: { items: assets.map((a) => ({ originalUrl: a.originalUrl, previewUrl: a.previewUrl || "", transform: a.transform })) },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  const canOrder = !!(quote && hasAllUploads);

  return (
    <Page title="Editor — Collage Frame">
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Collage Frame</h1>
          <p className="mt-0.5 text-sm text-slate-500">Upload Multiple Photos Into One Beautiful Frame.</p>
        </div>

        {!product ? (
          <div className="mx-4 mt-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200 mb-3" /><div className="h-48 w-full rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:px-4 lg:pb-8">
            <div className="lg:col-span-7">
              <div className="sticky top-20">
                <CollageFramePreview
                  frame={frame} layout={layout} imageCount={imageCount} slots={assets}
                  onPickSlot={(idx) => openUploadForSlot(idx)}
                  onRemoveSlot={(idx) => setAssets((prev) => { const next = [...prev]; next[idx] = { originalUrl: "", previewUrl: "", transform: null }; return next; })}
                />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-col gap-0">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:rounded-t-3xl lg:border lg:border-b-0">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Customise</h2>
                    <p className="text-xs text-slate-500">Photos, Layout &amp; Frame</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${quote ? "text-slate-900" : "text-slate-300"}`}>{quote ? `${quote.total}` : "—"}</div>
                    {quote && <div className="text-xs font-semibold text-slate-400">{quote.currency} · Per Frame</div>}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-t-0 border-slate-200 bg-white lg:rounded-b-3xl overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Photo Count</SectionLabel>
                      <span className="text-xs font-semibold text-slate-400">{uploadedCount} / {imageCount} Uploaded</span>
                    </div>
                    <SegmentedCounts counts={allowedCounts} value={imageCount} onChange={setImageCount} />
                    {selectedVariant && (
                      <p className="mt-2 text-xs text-slate-400">
                        Frame Size: <b className="text-slate-600">{selectedVariant.size}</b> &nbsp;·&nbsp; Ratio Locked To <b className="text-slate-600">{lockedRatioId}</b>
                      </p>
                    )}
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Frame Style</SectionLabel>
                      <span className={`text-xs font-bold ${ACCENT}`}>{frame}</span>
                    </div>
                    <FrameTiles options={FRAME_OPTIONS} value={frame} onChange={setFrame} />
                  </div>

                  <div className="bg-slate-50 px-5 py-4">
                    <SectionLabel>Order Summary</SectionLabel>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      {[
                        ["Layout", prettyLayout(layout)],
                        ["Photos", imageCount],
                        ["Frame", frame],
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
                  {!hasAllUploads && (
                    <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Upload All {imageCount} Photos To Continue ({uploadedCount}/{imageCount} Done)
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
