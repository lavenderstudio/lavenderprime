/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorMultiplePrints.jsx
// ----------------------------------------------------
// Multiple Prints Editor (Batch Upload)
// - Quantity is derived from number of uploaded images
// - Uses MultiUploadWizardModal for bulk selection
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import MultiUploadWizardModal from "../components/MultiUploadWizardModal.jsx"; // For batch add
import PrintPreview from "../components/PrintPreview.jsx";

const PRODUCT_SLUG = "multiple-prints";

export default function EditorMultiplePrints() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [material, setMaterial] = useState("Matte");
  
  // State
  // assets: [{ originalUrl, previewUrl, transform }]
  const [assets, setAssets] = useState([]); 
  
  // quantity is derived from assets, but separate state for Quote if empty
  const quantity = Math.max(1, assets.length);

  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");

  const [isMultiWizardOpen, setIsMultiWizardOpen] = useState(false);
  const [isSingleWizardOpen, setIsSingleWizardOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);

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

        const firstMaterial = res.data.options?.materials?.[0];
        if (firstMaterial) setMaterial(firstMaterial.name);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, []);

  const materialOptions = useMemo(() => {
    return product?.options?.materials || [];
  }, [product]);

  const portraitVariants = useMemo(() => {
    return (product?.variants || []).filter((v) => v.orientation === "portrait");
  }, [product]);

  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);

  // ----------------------------------------------------
  // Quote
  // ----------------------------------------------------
  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        const res = await api.post("/pricing/quote", {
          productSlug: PRODUCT_SLUG,
          variantSku,
          options: { material },
          quantity,
        });
        setQuote(res.data);
      } catch (err) {
        setQuote(null);
        setError(err?.response?.data?.message || err.message);
      }
    };
    getQuote();
  }, [variantSku, material, quantity]);

  const parsedPrint = parseCmSize(selectedVariant?.size);

  function parseCmSize(sizeStr) {
    if (!sizeStr) return null;
    const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
    const [w, h] = cleaned.split("x").map((n) => Number(n));
    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { w, h };
  }

  // ----------------------------------------------------
  // Actions
  // ----------------------------------------------------
  const handleBulkComplete = (newFiles) => {
      // newFiles: [{ originalUrl, fileMeta, transform }]
      setAssets(prev => [...prev, ...newFiles]);
  };

  const removeAsset = (idx) => {
      setAssets(prev => prev.filter((_, i) => i !== idx));
  };

  // ----------------------------------------------------
  // Add to Cart
  // ----------------------------------------------------
  const handleAddToCart = async () => {
    try {
      setError("");
      if (!selectedVariant || !quote) return setError("Missing info.");
      if (assets.length === 0) {
        return setError(`Please upload at least one photo.`);
      }

      const sessionId = getSessionId();

      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: PRODUCT_SLUG,
          variantSku,
          config: {
            orientation: "portrait",
            size: selectedVariant.size,
            material,
          },
          quantity: assets.length, // Explicitly set to uploaded count
          assets: {
            items: assets.map((a) => ({
              originalUrl: a.originalUrl,
              previewUrl: a.previewUrl || "",
              transform: a.transform,
            })),
          },
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
  // UI Helpers
  // ----------------------------------------------------
  function SizePills({ variants, value, onChange }) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = v.sku === value;
          return (
            <button
              key={v.sku}
              type="button"
              onClick={() => onChange(v.sku)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition active:scale-[0.99]
                ${
                  active
                    ? "bg-[#FF633F] text-white shadow-sm"
                    : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm"
                }`}
            >
              {v.size}
            </button>
          );
        })}
      </div>
    );
  }

  function MaterialTiles({ options, value, onChange }) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-3 transition">
        {options.map((opt) => {
          const active = opt.name === value;
          return (
            <button
              key={opt.name}
              type="button"
              onClick={() => onChange(opt.name)}
              className={`rounded-2xl p-4 text-center transition active:scale-[0.99]
                ${
                  active
                    ? "ring-2 ring-[#FF633F]/30 bg-[#FF633F]/10 border border-[#FF633F]/20 shadow-sm"
                    : "border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
                }`}
            >
              <div className="text-sm font-bold text-slate-900">{opt.name}</div>
              {opt.price > 0 && (
                <div className="mt-1 text-xs font-semibold text-slate-500">+{opt.price}</div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------
  return (
    <Page title="Editor — Multiple Prints">
       {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm">
          <b>Error:</b> {error}
        </div>
      )}

      {!product ? (
        <p className="text-slate-600">Loading product…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: Grid of Prints */}
          <div className="relative overflow-hidden rounded-3xl lg:col-span-7 border border-slate-200 bg-linear-to-b from-[#FF633F]/5 via-white to-slate-50 shadow-sm">
            <div className="p-6">
                
              {/* Header inside the box */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">
                    Photos Selected: <b className="text-slate-900">{assets.length}</b>
                </div>
                
                {/* Bulk Add Button */}
                <button
									type="button"
									onClick={() => setIsMultiWizardOpen(true)}
									className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-[#FF633F] hover:bg-slate-50 active:scale-[0.99] shadow-sm"
                >
									<span className="text-lg">+</span> Add Photos
                </button>
              </div>

              {/* Empty State */}
              {assets.length === 0 && (
								<div className="py-10 text-center">
									<button
										onClick={() => setIsMultiWizardOpen(true)}
										className="group w-full max-w-sm mx-auto rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 p-8 hover:bg-white hover:border-[#FF633F] transition-all duration-300"
									>
										<div className="h-16 w-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#FF633F] group-hover:bg-[#FF633F]/10 transition">
											<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
										</div>
										<h3 className="mt-4 text-lg font-bold text-slate-900">Upload Photos</h3>
										<p className="mt-1 text-sm text-slate-500">Select Multiple Images To Start</p>
									</button>
								</div>
              )}

              {/* Grid */}
              {assets.length > 0 && (
								<div className="grid gap-5 sm:grid-cols-2">
									{assets.map((slot, idx) => (
										<div key={idx} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm group hover:shadow-md transition">
											<div className="mb-3 flex items-center justify-between">
												<div className="text-sm font-extrabold text-slate-900">Image #{idx + 1}</div>
												<div className="flex gap-2">
													<button 
														onClick={() => removeAsset(idx)}
														className="text-xs font-bold text-red-400 hover:text-red-600 hover:underline"
													>
														Remove
													</button>
												</div>
											</div>
											
											<div className="mt-5">
												<PrintPreview imageUrl={slot.originalUrl} />
											</div>
										</div>
									))}
								</div>
              )}
            </div>
          </div>

          {/* RIGHT: Options */}
          <div className="rounded-3xl border border-slate-200 bg-white lg:col-span-5 p-6 shadow-sm h-fit sticky top-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-extrabold text-slate-900">Options</h3>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                Multiple Prints
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-extrabold text-slate-900">
                  Print Size (CM)
                </span>
                <span className="text-sm text-slate-700">
                  <b>
                    {parsedPrint
                      ? `${parsedPrint.w}x${parsedPrint.h}cm`
                      : selectedVariant?.size || "-"}
                  </b>
                </span>
              </div>
              <SizePills variants={portraitVariants} value={variantSku} onChange={setVariantSku} />
            </div>

            {/* Material */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <label className="text-sm font-extrabold text-slate-900">Material</label>
              <MaterialTiles options={materialOptions} value={material} onChange={setMaterial} />
            </div>

            {/* Summary */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-800">
                <b>Total Price:</b> {quote ? `${quote.total} ${quote.currency}` : "—"}
              </div>
              <div className="mt-1 text-sm text-slate-800">
                <b>Count:</b> {assets.length} prints
              </div>
              {assets.length === 0 && (
								<div className="mt-2 text-xs text-orange-600 font-semibold">
									⚠ Add photos to see final price
								</div>
              )}
            </div>

            <button
              disabled={assets.length === 0 || !quote}
              onClick={handleAddToCart}
              className={`mt-5 w-full rounded-2xl px-4 py-3 font-bold shadow-sm transition active:scale-[0.99]
                ${assets.length === 0 || !quote
                  ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                  : "border border-[#FF633F] bg-[#FF633F] text-white hover:bg-[#FF4C1A]/70 transition hover:scale-105 duration-300"
                }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Batch Upload Modal */}
      <MultiUploadWizardModal
        isOpen={isMultiWizardOpen}
        onClose={() => setIsMultiWizardOpen(false)}
        onComplete={handleBulkComplete}
      />


      <div className="mb-3">
        <Link to="/products" className="text-sm hover:underline">
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50 transition active:scale-[0.99]"
          >
            &#8592; Back to Products
          </button>
        </Link>
      </div>
    </Page>
  );
}
