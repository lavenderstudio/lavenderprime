/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorMultiplePrints.jsx

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import MultiUploadWizardModal from "../components/MultiUploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";

import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

const PRODUCT_SLUG = "multiple-prints";

function parseCmSize(sizeStr) {
  if (!sizeStr) return null;
  const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
  const [w, h] = cleaned.split("x").map((n) => Number(n));
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { w, h };
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

function MaterialTiles({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = opt.name === value;
        return (
          <button key={opt.name} type="button" onClick={() => onChange(opt.name)}
            className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 active:scale-95
              ${active ? "ring-2 ring-[#FF633F] bg-[#FF633F]/8 border border-[#FF633F]/30" : "border border-slate-200 bg-white hover:bg-slate-50"}`}>
            <span className={`text-sm font-bold ${active ? "text-[#FF633F]" : "text-slate-700"}`}>{opt.name}</span>
            {opt.price > 0 && <span className="mt-0.5 text-[10px] font-semibold text-slate-400">+{opt.price}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function EditorMultiplePrints() {
  const navigate = useNavigate();
  const [product, setProduct]   = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [material, setMaterial] = useState("Matte");
  const [assets, setAssets]     = useState([]);
  const quantity                = Math.max(1, assets.length);
  const [quote, setQuote]       = useState(null);
  const [error, setError]       = useState("");
  const [isMultiWizardOpen, setIsMultiWizardOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/products/${PRODUCT_SLUG}`);
        setProduct(res.data);
        const firstPortrait = res.data.variants?.find((v) => v.orientation === "portrait");
        if (firstPortrait) setVariantSku(firstPortrait.sku);
        const firstMaterial = res.data.options?.materials?.[0];
        if (firstMaterial) setMaterial(firstMaterial.name);
      } catch (err) { setError(err?.response?.data?.message || err.message); }
    };
    load();
  }, []);

  const materialOptions  = useMemo(() => product?.options?.materials || [], [product]);
  const portraitVariants = useMemo(() => (product?.variants || []).filter((v) => v.orientation === "portrait"), [product]);
  const selectedVariant  = portraitVariants.find((v) => v.sku === variantSku);
  const parsedPrint      = parseCmSize(selectedVariant?.size);

  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        const res = await api.post("/pricing/quote", { productSlug: PRODUCT_SLUG, variantSku, options: { material }, quantity });
        setQuote(res.data);
      } catch (err) { setQuote(null); setError(err?.response?.data?.message || err.message); }
    };
    getQuote();
  }, [variantSku, material, quantity]);

  const handleBulkComplete = (newFiles) => setAssets((prev) => [...prev, ...newFiles]);
  const removeAsset        = (idx) => setAssets((prev) => prev.filter((_, i) => i !== idx));
  const canOrder           = assets.length > 0 && !!quote;

  const handleAddToCart = async () => {
    try {
      setError("");
      if (!selectedVariant || !quote) return setError("Missing info.");
      if (assets.length === 0) return setError("Please upload at least one photo.");
      const sessionId = getSessionId();
      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: PRODUCT_SLUG, variantSku,
          config: { orientation: "portrait", size: selectedVariant.size, material },
          quantity: assets.length,
          assets: { items: assets.map((a) => ({ originalUrl: a.originalUrl, previewUrl: a.previewUrl || "", transform: a.transform })) },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  return (
    <Page title="Editor — Multiple Prints">
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Multiple Prints</h1>
          <p className="mt-0.5 text-sm text-slate-500">Upload Multiple Photos, All Printed In The Same Size.</p>
        </div>

        {!product ? (
          <div className="mx-4 mt-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200 mb-3" /><div className="h-48 w-full rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:px-4 lg:pb-8">

            {/* LEFT: Photo Grid */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-none lg:rounded-3xl border-0 border-b border-slate-200 lg:border bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF633F] shadow-sm shadow-[#FF633F]/50" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Photos</span>
                    {assets.length > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{assets.length} Selected</span>}
                  </div>
                  <button type="button" onClick={() => setIsMultiWizardOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#FF633F]/30 bg-[#FF633F]/8 px-3 py-1.5 text-xs font-bold text-[#FF633F] hover:bg-[#FF633F]/15 transition-all active:scale-95">
                    + Add Photos
                  </button>
                </div>

                <div className="px-5 pb-5">
                  {assets.length === 0 ? (
                    <button onClick={() => setIsMultiWizardOpen(true)}
                      className="group flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition-all duration-200 hover:border-[#FF633F]/50 hover:bg-[#FF633F]/5 active:scale-[0.99]">
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg group-hover:scale-105 transition-transform">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FF633F]/30 animate-spin [animation-duration:8s]" />
                        <svg className="h-8 w-8 text-[#FF633F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-slate-900">Upload Your Photos</p>
                        <p className="mt-1 text-sm text-slate-500">Select Multiple Images To Start</p>
                      </div>
                      <span className="rounded-full bg-[#FF633F] px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#FF633F]/30 group-hover:scale-105 transition-transform">Choose Photos</span>
                    </button>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {assets.map((slot, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm group hover:shadow-md transition">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-extrabold text-slate-900">Image #{idx + 1}</span>
                            <button onClick={() => removeAsset(idx)} className="text-xs font-bold text-red-400 hover:text-red-600 hover:underline">Remove</button>
                          </div>
                          <PrintPreview imageUrl={slot.originalUrl} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Options */}
            <div className="lg:col-span-5">
              <div className="flex flex-col gap-0">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:rounded-t-3xl lg:border lg:border-b-0">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Customise</h2>
                    <p className="text-xs text-slate-500">Pick Size &amp; Material</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${quote ? "text-slate-900" : "text-slate-300"}`}>{quote ? `${quote.total}` : "—"}</div>
                    {quote && <div className="text-xs font-semibold text-slate-400">{quote.currency} · {assets.length || 1} Print{assets.length !== 1 ? "s" : ""}</div>}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-t-0 border-slate-200 bg-white lg:rounded-b-3xl overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Print Size</SectionLabel>
                      {parsedPrint && <span className="text-xs font-semibold text-slate-400">{parsedPrint.w}×{parsedPrint.h}cm</span>}
                    </div>
                    <SizePills variants={portraitVariants} value={variantSku} onChange={setVariantSku} />
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Paper Material</SectionLabel>
                      <span className={`text-xs font-bold ${ACCENT}`}>{material}</span>
                    </div>
                    <MaterialTiles options={materialOptions} value={material} onChange={setMaterial} />
                  </div>

                  <div className="bg-slate-50 px-5 py-4">
                    <SectionLabel>Order Summary</SectionLabel>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      {[
                        ["Size", selectedVariant?.size || "—"],
                        ["Material", material],
                        ["Photos", assets.length || "0"],
                        ["Total", quote ? `${quote.total} ${quote.currency}` : "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex items-baseline justify-between col-span-2 sm:col-span-1">
                          <span className="font-semibold text-slate-400">{label}</span>
                          <span className="font-bold text-slate-700">{val}</span>
                        </div>
                      ))}
                    </div>
                    {assets.length === 0 && <p className="mt-2 text-[10px] font-semibold text-amber-600">⚠ Add Photos To See Final Price</p>}
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-5 py-4 lg:static lg:bg-transparent lg:border-0 lg:px-0 lg:pb-0 lg:pt-4">
                  {assets.length === 0 && (
                    <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Upload At Least One Photo To Continue
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

        <MultiUploadWizardModal
          isOpen={isMultiWizardOpen}
          onClose={() => setIsMultiWizardOpen(false)}
          onComplete={handleBulkComplete}
        />
      </Container>
    </Page>
  );
}
