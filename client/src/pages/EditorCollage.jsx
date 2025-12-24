/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorCollage.jsx
// ----------------------------------------------------
// Collage Frame Editor (single frame, multiple images)
// - Shows ALL photos inside ONE frame (like your screenshot)
// - Locks upload ratio based on layout:
//   - portrait-* => portrait
//   - landscape-* => landscape
//   - square => square
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import { FRAME_OPTIONS } from "../lib/optionsUi.js";
import FramePreview from "../components/FramePreview.jsx";


// ✅ Theme tokens
import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

// If you have RATIOS available and want to use them, you can import them.
// import { RATIOS } from "../lib/ratios.js";

const PRODUCT_SLUG = "collage-frame";

// ------------------------------
// Helpers: layout from SKU
// ------------------------------
function layoutFromSku() {
  return "square";
}

function prettyLayout(layout) {
  const map = {
    square: "Square",
  };
  return map[layout] || layout;
}


// ----------------------------------------------------
// NEW: Single-frame collage preview (one outer frame)
// ----------------------------------------------------
function CollageFramePreview({
  frame,
  layout,
  imageCount,
  slots,
  onPickSlot,
  onRemoveSlot,
}) {
  const isSquare = true;

  const imageOrientation = useMemo(() => {
    if (layout === "square") return "square";
    const parts = String(layout || "").split("-");
    return parts[1] || parts[0] || "portrait";
  }, [layout]);

  const tileAspect = useMemo(() => {
    if (imageOrientation === "square") return "1 / 1";
    if (imageOrientation === "landscape") return "4 / 3";
    return "3 / 4"; // portrait
  }, [imageOrientation]);

  const grid = useMemo(() => {
    if (isSquare) {
      if (imageCount === 4) return { cols: 2, rows: 2 };
      if (imageCount === 9) return { cols: 3, rows: 3 };
      if (imageCount === 16) return { cols: 4, rows: 4 };
      return { cols: 2, rows: 2 }; // fallback
    }

    // fallback (shouldn't happen)
    return { cols: 1, rows: imageCount };
  }, [isSquare, imageCount]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900">
          Collage Preview
        </div>
      </div>

      {/* Real frame preview */}
      <div className="mt-4 flex justify-center">
        <FramePreview
          frame={frame}
          aspectRatio="1:1"
          maxHeight={720}
        >
          {/* Mat */}
          <div className="h-full w-full bg-white p-3">
            {/* Inner “print area” */}
            <div className="h-full w-full bg-slate-50 p-2 overflow-hidden">
              <div
                className="grid h-full w-full gap-2 overflow-auto"
                style={{
                  gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
                }}
              >
                {slots.map((slot, idx) => {
                  const filled = !!slot?.originalUrl;

                  return (
                    <div
                      key={idx}
                      className="group relative overflow-hidden border border-slate-200 bg-white"
                      style={{ aspectRatio: tileAspect }}
                    >
                      {filled ? (
                        <>
                          <img
                            src={slot.originalUrl}
                            alt={`photo-${idx + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onClick={() => onPickSlot(idx)}
                            style={{ cursor: "pointer" }}
                          />

                          <div className="pointer-events-none absolute inset-0">
                            <div className="absolute left-2 top-2 bg-white/90 px-2 py-1 text-[11px] font-extrabold text-slate-900">
                              #{idx + 1}
                            </div>
                          </div>

                          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => onPickSlot(idx)}
                              className="bg-white px-2 py-1 text-[11px] font-extrabold text-slate-900 shadow-sm border border-slate-200"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveSlot(idx)}
                              className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-700 shadow-sm border border-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPickSlot(idx)}
                          className="flex h-full w-full items-center justify-center border-2 border-dashed border-slate-300 bg-white text-center hover:bg-slate-50 active:scale-[0.99]"
                        >
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">
                              Upload
                            </div>
                            <div className="mt-1 text-[11px] font-semibold text-slate-500">
                              Photo #{idx + 1}
                            </div>
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

      <p className="mt-3 text-xs font-semibold text-slate-500">
        This is a visual preview. Final crop may vary slightly.
      </p>
    </div>
  );
}

export default function EditorCollage() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");

  // Options
  const [frame, setFrame] = useState("Black Wood");

  // Collage settings
  const [imageCount, setImageCount] = useState(4);

  // N image slots
  const [assets, setAssets] = useState([]);

  // quote
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");

  // Upload wizard
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  const allowedCounts = [4, 9, 16];
  

  // ----------------------------------------------------
  // Load product
  // ----------------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const res = await api.get(`/products/${PRODUCT_SLUG}`);
        const p = res.data;
        setProduct(p);

        const firstSq = (p?.variants || []).find((v) => v?.sku?.startsWith("COL_SQ_"));
        if (firstSq?.sku) {
          setVariantSku(firstSq.sku);
        }
        setImageCount(4);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, []);

  function skuForSquareCount(count) {
    if (count === 4) return "COL_SQ_31.5x31.5_4";
    if (count === 9) return "COL_SQ_43x43_9";
    if (count === 16) return "COL_SQ_54.5x54.5_16";
    return "COL_SQ_31.5x31.5_4";
  }

  // ----------------------------------------------------
  // Derived: variants + selected variant
  // ----------------------------------------------------
  const variants = useMemo(() => {
    return (product?.variants || []).filter((v) =>
      v.sku.startsWith("COL_SQ_")
    );
  }, [product]);


  const selectedVariant = useMemo(
    () => variants.find((v) => v.sku === variantSku),
    [variants, variantSku]
  );

  const layout = useMemo(() => layoutFromSku(selectedVariant?.sku || ""), [selectedVariant]);

  const lockedRatioId = "1:1";

  // Required uploads = imageCount
  const requiredUploads = imageCount;

  // Keep assets array length aligned with requiredUploads
  useEffect(() => {
    setAssets((prev) => {
      const next = [...prev];

      while (next.length < requiredUploads) {
        next.push({ originalUrl: "", previewUrl: "", transform: null });
      }

      if (next.length > requiredUploads) {
        next.length = requiredUploads;
      }

      return next;
    });
  }, [requiredUploads]);

  const uploadedCount = useMemo(() => assets.filter((a) => a.originalUrl).length, [assets]);

  const hasAllUploads = useMemo(() => {
    return assets.length === requiredUploads && assets.every((a) => a.originalUrl && a.transform);
  }, [assets, requiredUploads]);

  // ----------------------------------------------------
  // Quote pricing
  // ----------------------------------------------------
  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;

      try {
        setError("");
        const res = await api.post("/pricing/quote", {
          productSlug: PRODUCT_SLUG,
          variantSku,
          options: {
            frame,
          },
          quantity: 1,
        });

        setQuote(res.data);
      } catch (err) {
        setQuote(null);
        setError(err?.response?.data?.message || err.message);
      }
    };

    getQuote();
  }, [variantSku, frame, layout, imageCount]);

  // ----------------------------------------------------
  // Upload slot handlers
  // ----------------------------------------------------
  const openUploadForSlot = (idx) => {
    setActiveSlotIndex(idx);
    setIsUploadWizardOpen(true);
  };

  // ----------------------------------------------------
  // Add to cart
  // ----------------------------------------------------
  const handleAddToCart = async () => {
    try {
      setError("");

      if (!selectedVariant) return setError("Missing variant selection.");
      if (!quote) return setError("Price quote not available.");
      if (!hasAllUploads) return setError(`Please upload ${requiredUploads} photo(s).`);

      const sessionId = getSessionId();

      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: PRODUCT_SLUG,
          variantSku,

          config: {
            orientation: "collage",
            size: selectedVariant.size,
            frame,
            layout,
            imageCount,
            quantity: 1,
          },

          // ✅ Collage assets array
          // NOTE: Your Cart/Order schema MUST support assets.items for this to persist.
          assets: {
            items: assets.map((a) => ({
              originalUrl: a.originalUrl,
              previewUrl: a.previewUrl || "",
              transform: a.transform, // { ratio, ratioW, ratioH }
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

  useEffect(() => {
    setVariantSku(skuForSquareCount(imageCount));
  }, [imageCount]);

  function FrameTiles({ options, value, onChange }) {
    return (
      <div className="mt-3 grid grid-cols-3 gap-3 transition">
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
                    ? "ring-2 ring-blue-500/60 bg-blue-50 border border-blue-200"
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

  function SegmentedCounts({ counts, value, onChange }) {
    return (
      <div className="mt-3 rounded-full bg-slate-100 p-1 flex">
        {counts.map((c) => {
          const active = c === value;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-extrabold transition
                ${active ? "bg-blue-700 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              {c}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Page title="Editor - Collage Frame">
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
        <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* LEFT: Single collage frame preview */}
          <div className="lg:col-span-7">
            <CollageFramePreview
              frame={frame}
              layout={layout}
              imageCount={imageCount}
              slots={assets}
              onPickSlot={(idx) => openUploadForSlot(idx)}
              onRemoveSlot={(idx) => {
                setAssets((prev) => {
                  const next = [...prev];
                  next[idx] = { originalUrl: "", previewUrl: "", transform: null };
                  return next;
                });
              }}
            />
          </div>

          {/* RIGHT: sticky options */}
          <div className="rounded-3xl border border-slate-200 bg-white lg:col-span-5 p-5 shadow-sm lg:sticky lg:top-24 h-fit">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Options</h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Choose collage layout, image count and frame.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-blue-50 px-3 py-2 text-sm font-extrabold text-slate-900">
                {quote ? `${quote.total} ${quote.currency}` : "—"}
              </div>
            </div>

            {/* Image count */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-slate-900">Image Count</label>
                <span className="text-sm font-semibold text-slate-700">
                  {imageCount} photos
                </span>
              </div>

              <SegmentedCounts
                counts={allowedCounts}
                value={imageCount}
                onChange={setImageCount}
              />

              <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500">
                <div>
                  Upload ratio is locked to:{" "}
                  <b className="text-slate-700">{lockedRatioId || "—"}</b>
                </div>
                <div>
                  Size: {" "}
                  <b className="text-slate-700">{selectedVariant.size}</b>
                </div>
              </div>
            </div>

            {/* Frame */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-slate-900">
                  Frame: <span className={`${ACCENT}`}>{frame}</span>
                </label>
              </div>

              <FrameTiles options={FRAME_OPTIONS} value={frame} onChange={setFrame} />
            </div>

            {/* Summary */}
            <div className="mt-6 flex flex-col rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700">
                <b className="text-slate-900">Uploads:</b>{" "}
                {uploadedCount}/{requiredUploads}
              </div>
              <div className="text-sm font-semibold text-slate-700">
                <b className="text-slate-900">Frame:</b>{" "}
                {frame}
              </div>
              <div className="text-sm font-semibold text-slate-700">
                <b className="text-slate-900">Layout:</b>{" "}
                {prettyLayout(layout)}
              </div>
              <div className="text-sm font-semibold text-slate-700">
                <b className="text-slate-900">Photos:</b>{" "}
                {imageCount}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                <b className="text-slate-900">Price:</b>{" "}
                {quote ? `${quote.total} ${quote.currency}` : "—"}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <button
                disabled={!quote || !hasAllUploads}
                onClick={handleAddToCart}
                className={`w-full rounded-2xl px-4 py-3 font-extrabold shadow-sm transition active:scale-[0.99]
                  ${
                    !quote || !hasAllUploads
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
    </Page>
  );
}
