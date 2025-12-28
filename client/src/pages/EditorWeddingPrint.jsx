/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorWeddingFrame.jsx
// Tailwind version: responsive editor UI
// - Mobile: stacks editor + options
// - Desktop: 2 columns
//
// ✅ Updates made:
// - Loads product: /products/wedding-frame
// - Quotes use productSlug: "wedding-frame"
// - Cart item uses productSlug: "wedding-frame" (NOT "print and frame")
// - Adds personalization form driven by product.personalizationConfig.fields
// - Locks upload ratio to portrait (best-effort + enforced in onComplete)

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import WeddingPrintPreview from "../components/WeddingPrintPreview.jsx";
import PersonalisationForm from "../components/PersonalisationForm.jsx";
import { FRAME_OPTIONS } from "../lib/optionsUi.js";

// ✅ Theme tokens
import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

export default function EditorWeddingPrint() {
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

  // ✅ NEW: holds actual customer inputs (these belong to cart/order, not Product)
  // Example:
  // personalization = { groomName: "Areez", brideName: "Mehmuna", weddingDate: "2025-08-14", ... }
  const [personalization, setPersonalization] = useState({});

  // ------------------------------
  // Load Wedding product
  // ------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        setError("");

        // ✅ Must match your backend route.
        // If your backend route is different, adjust this endpoint accordingly.
        const res = await api.get("/products/wedding-print");
        setProduct(res.data);

        // Default SKU to first portrait variant
        const firstPortrait = res.data.variants.find((v) => v.orientation === "portrait");
        if (firstPortrait) setVariantSku(firstPortrait.sku);

        // Initialize personalization defaults (optional)
        // If the product defines fields, we set empty strings for them.
        const fields = res.data?.personalizationConfig?.fields || [];
        if (fields.length) {
          const initial = {};
          fields.forEach((f) => {
            // Use empty string defaults for form inputs
            initial[f.key] = "";
          });
          setPersonalization(initial);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, []);

  // ------------------------------
  // Variants
  // ------------------------------
  const portraitVariants = useMemo(() => {
    return (product?.variants || []).filter((v) => v.orientation === "portrait");
  }, [product]);

  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);

  const materialOptions = useMemo(() => {
    return product?.options?.materials || [];
  }, [product]);

  // ------------------------------
  // Quote
  // ------------------------------
  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;

      try {
        setError("");

        const res = await api.post("/pricing/quote", {
          // ✅ IMPORTANT: slug should be exact
          productSlug: "wedding-print",
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

  // ------------------------------
  // Mat calculations
  // ------------------------------
  const parsedPrint = parseCmSize(selectedVariant?.size);

  // ------------------------------
  // Personalization config helpers
  // ------------------------------
  const personalizationEnabled = !!product?.personalizationConfig?.enabled;
  const personalizationFields = useMemo(() => {
    const fields = product?.personalizationConfig?.fields || [];
    // Sort by sortOrder so it renders in the right UI order
    return [...fields].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [product]);

  function validatePersonalization() {
    if (!personalizationEnabled) return { ok: true };

    for (const f of personalizationFields) {
      const val = String(personalization?.[f.key] ?? "").trim();

      // Required check
      if (f.required && !val) {
        return { ok: false, message: `Please fill: ${f.label}` };
      }

      // Length checks
      if (val) {
        const minL = Number(f.minLength ?? 0);
        const maxL = Number(f.maxLength ?? 9999);
        if (minL && val.length < minL) {
          return { ok: false, message: `${f.label} must be at least ${minL} characters.` };
        }
        if (maxL && val.length > maxL) {
          return { ok: false, message: `${f.label} must be under ${maxL} characters.` };
        }
      }

      // Regex pattern check (optional)
      if (val && f.pattern) {
        try {
          const re = new RegExp(f.pattern);
          if (!re.test(val)) {
            return { ok: false, message: `${f.label} format is invalid.` };
          }
        } catch {
          // If someone saved a bad regex in DB, we skip validation to avoid blocking checkout.
        }
      }
    }

    return { ok: true };
  }

  // ------------------------------
  // Add to cart
  // ------------------------------
  const handleAddToCart = async () => {
    try {
      setError("");

      if (!originalUrl || !quote || !selectedVariant || !selectedRatio) {
        return setError("Missing image, ratio selection, or price.");
      }

      // ✅ Validate wedding personalization inputs (if enabled)
      const pv = validatePersonalization();
      if (!pv.ok) return setError(pv.message);

      const sessionId = getSessionId();

      await api.post("/cart/items", {
        sessionId,
        item: {
          // ✅ Must be slug, consistent everywhere
          productSlug: "wedding-print",
          variantSku,

          // Product configuration selections
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

          // ✅ NEW: store user-entered values here (belongs to cart/order)
          personalization: personalizationEnabled ? personalization : undefined,

          assets: {
            originalUrl,
            previewUrl: "", // may be blank if popup opened; that’s okay for now
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

  // ------------------------------
  // UI Components
  // ------------------------------
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
                ${
                  active
                    ? `${ACCENT_BG} text-white`
                    : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
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

  // ------------------------------
  // Utils
  // ------------------------------
  function parseCmSize(sizeStr) {
    // Accepts "12x18" or "12x18cm" or "12×18"
    if (!sizeStr) return null;

    const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
    const [w, h] = cleaned.split("x").map((n) => Number(n));

    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { w, h };
  }

  const lockedRatioId = "2:3";

  return (
    <Page title="Editor — Wedding Print & Frame">
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
            {/* LEFT: Editor */}
            <div className="relative overflow-hidden rounded-3xl lg:col-span-7 border border-slate-200 bg-linear-to-b from-blue-50 via-white to-white shadow-sm">
              <div className="p-5">
                {!originalUrl ? (
                  <div className="flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setIsUploadWizardOpen(true)}
                      className="group relative w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.10)] border border-slate-200 transition active:scale-[0.99]"
                      aria-label="Upload image"
                    >
                      <div className="relative rounded-2xl bg-white p-4">
                        <div className="rounded-xl border-2 border-slate-200 bg-white">
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
                                Portrait ratio → crop → preview
                              </div>
                            </div>
                          </div>
                        </div>

                        <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-blue-500 shadow" />
                      </div>
                    </button>

                    <p className="mt-4 text-xs font-semibold text-slate-600 text-center max-w-md">
                      Golden Art Frames prints and frames your photo with premium packaging and doorstep delivery.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-700">
                        <b>Ratio:</b> <span className={`${ACCENT}`}>{selectedRatio?.id || "-"}</span>
                      </div>

                      <button
                        onClick={() => setIsUploadWizardOpen(true)}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-50 active:scale-[0.99]"
                      >
                        Change Image
                      </button>
                    </div>

                    <div className="mt-4">
                      <WeddingPrintPreview
                        imageUrl={originalUrl}
                        groomName={personalization.groomName}
                        brideName={personalization.brideName}
                        locationText={personalization.location}
                        weddingDateText={personalization.weddingDate}
                        message={personalization.message}
                      />

                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Options */}
            <div className="rounded-3xl border border-slate-200 bg-white lg:col-span-5 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Options</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    Choose size, frame, mat, quantity and personalise.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-blue-50 px-3 py-2 text-sm font-extrabold text-slate-900">
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

              {/* ✅ NEW: Wedding personalisation */}
              <PersonalisationForm
                enabled={!!product?.personalizationConfig?.enabled}
                title={product?.personalizationConfig?.title}
                fields={product?.personalizationConfig?.fields || []}
                values={personalization}
                onChange={(key, value) =>
                  setPersonalization((prev) => ({ ...prev, [key]: value }))
                }
              />

              {/* Summary */}
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">Selected:</b> {selectedVariant ? `${selectedVariant.size}` : "-"}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">SKU:</b> {selectedVariant ? `${selectedVariant.sku}` : "-"}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">Material:</b> {material}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">Price:</b> {quote ? `${quote.total} ${quote.currency}` : "—"}
                </div>
              </div>

              {/* Sticky CTA area (desktop) */}
              <div className="mt-6 lg:sticky lg:top-24">
                <button
                  disabled={!originalUrl || !quote || !selectedRatio}
                  onClick={handleAddToCart}
                  className={`w-full rounded-2xl px-4 py-3 font-extrabold shadow-sm transition active:scale-[0.99]
                    ${
                      !originalUrl || !quote || !selectedRatio
                        ? "cursor-not-allowed bg-slate-100 text-slate-500 border border-slate-200"
                        : `${ACCENT_BG} ${ACCENT_HOVER} text-white`
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
        )}

        {/* Upload wizard */}
        <UploadWizardModal
          isOpen={isUploadWizardOpen}
          onClose={() => setIsUploadWizardOpen(false)}
          // ✅ Best-effort: if your UploadWizardModal supports this prop, it will lock to portrait.
          // If it doesn't, no harm done — we still enforce portrait in onComplete below.
          lockedRatioId={lockedRatioId}
          onComplete={({ ratio, imageUrl }) => {
            // ✅ Enforce portrait ratio at the point we receive it.
            // Portrait means height > width (e.g., 4x5, 2x3 etc.)
            if (ratio && Number(ratio.h) <= Number(ratio.w)) {
              setError("Please choose a portrait ratio for Wedding Frame.");
              return;
            }

            setSelectedRatio(ratio);
            setOriginalUrl(imageUrl);
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
