/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorPrintPortrait.jsx
// Theme update only (Golden Art Frames look)
// ✅ NO logic changes, only Tailwind classes

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";

export default function EditorFineArtPrint() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [material, setMaterial] = useState("Matte");
  const [quantity, setQuantity] = useState(1);
  const [originalUrl, setOriginalUrl] = useState("");
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");

  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null); // {id,w,h,label}

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products/fine-art-print");
        setProduct(res.data);

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

  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        const res = await api.post("/pricing/quote", {
          productSlug: "fine-art-print",
          variantSku,
          options: {
            material,
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
  }, [variantSku, material, quantity]);

  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);
  const parsedPrint = parseCmSize(selectedVariant?.size);

  const handleAddToCart = async () => {
    try {
      setError("");

      if (!originalUrl || !quote || !selectedVariant || !selectedRatio) {
        return setError("Missing image, ratio selection, or price.");
      }

      const sessionId = getSessionId();

      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: "fine-art-print",
          variantSku,
          config: {
            orientation: "portrait",
            size: selectedVariant.size,
            material,
            quantity,
            transform: {
              ratio: selectedRatio.id,
              ratioW: selectedRatio.w,
              ratioH: selectedRatio.h,
            },
          },
          assets: {
            originalUrl,
            previewUrl: "",
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
                    ? "bg-blue-700 text-white shadow-sm"
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
                    ? "ring-2 ring-blue-600/30 bg-blue-50 border border-blue-100 shadow-sm"
                    : "border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
                }`}
            >
              <div className="text-sm font-bold text-slate-900">
                {opt.name}
              </div>

              {opt.price > 0 && (
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  +{opt.price}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  function parseCmSize(sizeStr) {
    if (!sizeStr) return null;
    const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
    const [w, h] = cleaned.split("x").map((n) => Number(n));
    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { w, h };
  }

  return (
    <Page title="Editor — Fine Art Print">
      {/* Softer, themed error */}
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm">
          <b>Error:</b> {error}
        </div>
      )}

      {!product ? (
        <p className="text-slate-600">Loading product…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: Editor */}
          <div className="relative overflow-hidden rounded-3xl lg:col-span-7 border border-slate-200 bg-linear-to-b from-blue-50 via-white to-slate-50 shadow-sm">
            <div className="p-6">
              {!originalUrl ? (
                <div className="flex flex-col items-center justify-center">
                  {/* Upload card */}
                  <button
                    type="button"
                    onClick={() => setIsUploadWizardOpen(true)}
                    className="group relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition active:scale-[0.99] hover:shadow-md"
                    aria-label="Upload image"
                  >
                    {/* Inner mount area */}
                    <div className="relative rounded-2xl bg-linear-to-b from-slate-50 to-white p-4">
                      <div className="rounded-2xl border-2 border-slate-200 bg-white">
                        <div className="flex aspect-square items-center justify-center">
                          <div className="text-center">
                            <svg
                              className="mx-auto h-10 w-10 text-slate-700 transition group-hover:scale-[1.03]"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M12 3v10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M8 7l4-4 4 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4 14v4a3 3 0 003 3h10a3 3 0 003-3v-4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>

                            <div className="mt-3 text-sm font-extrabold text-slate-900">
                              Tap to upload your photo
                            </div>

                            <div className="mt-2 text-xs font-semibold text-slate-500">
                              Choose ratio → crop → preview
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Accent status dot */}
                      <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-blue-700 shadow" />
                    </div>
                  </button>

                  <p className="mt-4 text-xs font-semibold text-slate-600 text-center max-w-md">
                    You’ll choose a ratio first, then crop it, then see a preview.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-700">
                      <b>Ratio:</b> {selectedRatio?.id || "-"}
                    </div>

                    <button
                      onClick={() => setIsUploadWizardOpen(true)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50 transition active:scale-[0.99]"
                    >
                      Change Image
                    </button>
                  </div>

                  <div className="mt-5">
                    <PrintPreview imageUrl={originalUrl} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Options */}
          <div className="rounded-3xl border border-slate-200 bg-white lg:col-span-5 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-extrabold text-slate-900">Options</h3>

              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                Golden Art Frames
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-extrabold text-slate-900">
                  Total Frame Sizes (CM)
                </span>

                <span className="text-sm text-slate-700">
                  Print Size:{" "}
                  <b>
                    {parsedPrint
                      ? `${parsedPrint.w}x${parsedPrint.h}cm`
                      : selectedVariant?.size || "-"}
                  </b>
                </span>
              </div>

              <div className="mt-2">
                <SizePills variants={portraitVariants} value={variantSku} onChange={setVariantSku} />
              </div>
            </div>

            {/* Material */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-slate-900">
                  Material: <span className="text-blue-700 font-bold">{material}</span>
                </label>

                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-bold text-slate-900">
                  {quote ? `${quote.total} ${quote.currency}` : "—"}
                </div>
              </div>

              <MaterialTiles options={materialOptions} value={material} onChange={setMaterial} />
            </div>


            {/* Summary */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-800">
                <b>Selected:</b> {selectedVariant ? `${selectedVariant.size}` : "-"}
              </div>
              <div className="mt-1 text-sm text-slate-800">
                <b>SKU:</b> {selectedVariant ? `${selectedVariant.sku}` : "-"}
              </div>
              <div className="mt-1 text-sm text-slate-800">
                <b>Material:</b> {material}
              </div>
              <div className="mt-1 text-sm text-slate-800">
                <b>Price:</b> {quote ? `${quote.total} ${quote.currency}` : "—"}
              </div>
            </div>

            <button
              disabled={!originalUrl || !quote || !selectedRatio}
              onClick={handleAddToCart}
              className={`mt-5 w-full rounded-2xl px-4 py-3 font-bold shadow-sm transition active:scale-[0.99]
                ${
                  !originalUrl || !quote || !selectedRatio
                    ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                    : "border border-blue-900 bg-blue-700 text-white hover:bg-blue-900"
                }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        onComplete={({ ratio, imageUrl }) => {
          setSelectedRatio(ratio);
          setOriginalUrl(imageUrl);
        }}
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
