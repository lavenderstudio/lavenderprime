/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorWeddingFrame.jsx

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import WeddingFramePreview from "../components/WeddingFramePreview.jsx";
import PersonalisationForm from "../components/PersonalisationForm.jsx";
import { FRAME_OPTIONS } from "../lib/optionsUi.js";

import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

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

function FrameTiles({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

function UploadPlaceholder({ onUpload }) {
  return (
    <button type="button" onClick={onUpload} aria-label="Upload photo"
      className="group relative flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition-all duration-200 hover:border-[#FF633F]/50 hover:bg-[#FF633F]/5 active:scale-[0.99]">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 group-hover:scale-105">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FF633F]/30 animate-spin [animation-duration:8s]" />
        <svg className="h-8 w-8 text-[#FF633F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <div>
        <p className="text-base font-extrabold text-slate-900">Upload Your Wedding Photo</p>
        <p className="mt-1 text-sm text-slate-500">Portrait Ratio → Crop → Preview</p>
      </div>
      <span className="rounded-full bg-[#FF633F] px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#FF633F]/30 transition-transform group-hover:scale-105">Choose Photo</span>
    </button>
  );
}

export default function EditorWeddingFrame() {
  const navigate = useNavigate();
  const [product, setProduct]   = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame]       = useState("Black Wood");
  const [quantity]              = useState(1);
  const [originalUrl, setOriginalUrl] = useState("");
  const [quote, setQuote]       = useState(null);
  const [error, setError]       = useState("");
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null);
  const [personalization, setPersonalization] = useState({});
  const lockedRatioId = "2:3";

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const res = await api.get("/products/wedding-frame");
        setProduct(res.data);
        const firstPortrait = res.data.variants.find((v) => v.orientation === "portrait");
        if (firstPortrait) setVariantSku(firstPortrait.sku);
        const fields = res.data?.personalizationConfig?.fields || [];
        if (fields.length) {
          const initial = {};
          fields.forEach((f) => { initial[f.key] = ""; });
          setPersonalization(initial);
        }
      } catch (err) { setError(err?.response?.data?.message || err.message); }
    };
    load();
  }, []);

  const portraitVariants = useMemo(() => (product?.variants || []).filter((v) => v.orientation === "portrait"), [product]);
  const selectedVariant  = portraitVariants.find((v) => v.sku === variantSku);
  const parsedPrint      = parseCmSize(selectedVariant?.size);
  const personalizationEnabled = !!product?.personalizationConfig?.enabled;
  const personalizationFields  = useMemo(() => {
    const fields = product?.personalizationConfig?.fields || [];
    return [...fields].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [product]);

  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        setError("");
        const res = await api.post("/pricing/quote", { productSlug: "wedding-frame", variantSku, options: { frame }, quantity });
        setQuote(res.data);
      } catch (err) { setQuote(null); setError(err?.response?.data?.message || err.message); }
    };
    getQuote();
  }, [variantSku, frame, quantity]);

  function validatePersonalization() {
    if (!personalizationEnabled) return { ok: true };
    for (const f of personalizationFields) {
      const val = String(personalization?.[f.key] ?? "").trim();
      if (f.required && !val) return { ok: false, message: `Please fill: ${f.label}` };
      if (val) {
        const minL = Number(f.minLength ?? 0); const maxL = Number(f.maxLength ?? 9999);
        if (minL && val.length < minL) return { ok: false, message: `${f.label} must be at least ${minL} characters.` };
        if (maxL && val.length > maxL) return { ok: false, message: `${f.label} must be under ${maxL} characters.` };
      }
      if (val && f.pattern) {
        try { const re = new RegExp(f.pattern); if (!re.test(val)) return { ok: false, message: `${f.label} format is invalid.` }; }
        catch { /* skip bad regex */ }
      }
    }
    return { ok: true };
  }

  const canOrder = !!(originalUrl && quote && selectedRatio);

  const handleAddToCart = async () => {
    try {
      setError("");
      if (!originalUrl || !quote || !selectedVariant || !selectedRatio)
        return setError("Missing image, ratio selection, or price.");
      const pv = validatePersonalization();
      if (!pv.ok) return setError(pv.message);
      const sessionId = getSessionId();
      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: "wedding-frame", variantSku,
          config: { orientation: "portrait", size: selectedVariant.size, frame, quantity, transform: { ratio: selectedRatio.id, ratioW: selectedRatio.w, ratioH: selectedRatio.h } },
          personalization: personalizationEnabled ? personalization : undefined,
          assets: { originalUrl, previewUrl: "" },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  return (
    <Page title="Editor — Wedding Frame">
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Wedding Frame</h1>
          <p className="mt-0.5 text-sm text-slate-500">Personalised Wedding Portrait Frame — Beautifully Framed &amp; Delivered.</p>
        </div>

        {!product ? (
          <div className="mx-4 mt-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200 mb-3" /><div className="h-48 w-full rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:px-4 lg:pb-8">
            <div className="lg:col-span-7">
              <div className="sticky top-20 overflow-hidden rounded-none lg:rounded-3xl border-0 border-b border-slate-200 lg:border bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF633F] shadow-sm shadow-[#FF633F]/50" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Preview</span>
                  </div>
                  {originalUrl && (
                    <button onClick={() => setIsUploadWizardOpen(true)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all active:scale-95">↺ Change Photo</button>
                  )}
                </div>
                <div className="px-5 pb-5">
                  {!originalUrl ? (
                    <div className="rounded-2xl bg-slate-50 p-4"><UploadPlaceholder onUpload={() => setIsUploadWizardOpen(true)} /></div>
                  ) : (
                    <WeddingFramePreview
                      imageUrl={originalUrl} frame={frame}
                      groomName={personalization.groomName} brideName={personalization.brideName}
                      locationText={personalization.location} weddingDateText={personalization.weddingDate}
                      message={personalization.message}
                    />
                  )}
                </div>
                {originalUrl && (
                  <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3 flex-wrap">
                    {selectedRatio && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Ratio: {selectedRatio.id}</span>}
                    {parsedPrint && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Print: {parsedPrint.w}×{parsedPrint.h}cm</span>}
                    <span className="rounded-full bg-[#FF633F]/10 px-3 py-1 text-xs font-bold text-[#FF633F] capitalize">{frame}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-col gap-0">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:rounded-t-3xl lg:border lg:border-b-0">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Customise</h2>
                    <p className="text-xs text-slate-500">Size, Frame &amp; Personalisation</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${quote ? "text-slate-900" : "text-slate-300"}`}>{quote ? `${quote.total}` : "—"}</div>
                    {quote && <div className="text-xs font-semibold text-slate-400">{quote.currency} · Per Piece</div>}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-t-0 border-slate-200 bg-white lg:rounded-b-3xl overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Frame Size</SectionLabel>
                      {parsedPrint && <span className="text-xs font-semibold text-slate-400">{parsedPrint.w}×{parsedPrint.h}cm</span>}
                    </div>
                    <SizePills variants={portraitVariants} value={variantSku} onChange={setVariantSku} />
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <SectionLabel>Frame Style</SectionLabel>
                      <span className={`text-xs font-bold ${ACCENT}`}>{frame}</span>
                    </div>
                    <FrameTiles options={FRAME_OPTIONS} value={frame} onChange={setFrame} />
                  </div>

                  {personalizationEnabled && (
                    <div className="px-5 py-4">
                      <SectionLabel>{product?.personalizationConfig?.title || "Personalisation"}</SectionLabel>
                      <PersonalisationForm
                        enabled={personalizationEnabled}
                        title={product?.personalizationConfig?.title}
                        fields={product?.personalizationConfig?.fields || []}
                        values={personalization}
                        onChange={(key, value) => setPersonalization((prev) => ({ ...prev, [key]: value }))}
                      />
                    </div>
                  )}

                  <div className="bg-slate-50 px-5 py-4">
                    <SectionLabel>Order Summary</SectionLabel>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      {[["Size", selectedVariant?.size || "—"], ["Frame", frame], ["Total", quote ? `${quote.total} ${quote.currency}` : "—"]].map(([label, val]) => (
                        <div key={label} className="flex items-baseline justify-between col-span-2 sm:col-span-1">
                          <span className="font-semibold text-slate-400">{label}</span>
                          <span className="font-bold text-slate-700">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-5 py-4 lg:static lg:bg-transparent lg:border-0 lg:px-0 lg:pb-0 lg:pt-4">
                  {!originalUrl && (
                    <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Upload A Portrait Photo Above To Continue
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
            if (ratio && Number(ratio.h) <= Number(ratio.w)) {
              setError("Please choose a portrait ratio for Wedding Frame."); return;
            }
            setSelectedRatio(ratio); setOriginalUrl(imageUrl);
          }}
        />
      </Container>
    </Page>
  );
}
