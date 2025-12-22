/* eslint-disable react-hooks/static-components */
// client/src/pages/EditorPrintPortrait.jsx
// Tailwind version: responsive editor UI
// - Mobile: stacks editor + options
// - Desktop: 2 columns

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import FramePreview from "../components/FramePreview.jsx";
import { FRAME_OPTIONS, MAT_OPTIONS } from "../lib/optionsUi.js";
import { MAT_CM } from "../lib/matSizes.js";

// ✅ Theme tokens
import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

export default function EditorPrintPortrait() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame] = useState("Black Wood");
  const [mat, setMat] = useState("Classic");
  const [quantity, setQuantity] = useState(1);
  const [originalUrl, setOriginalUrl] = useState("");
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");

  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null); // {id,w,h,label}

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products/printandframe");
        setProduct(res.data);

        const firstPortrait = res.data.variants.find((v) => v.orientation === "portrait");
        if (firstPortrait) setVariantSku(firstPortrait.sku);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, []);

  const portraitVariants = useMemo(() => {
    return (product?.variants || []).filter((v) => v.orientation === "portrait");
  }, [product]);

  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        const res = await api.post("/pricing/quote", {
          productSlug: "printandframe",
          variantSku,
          options: {
            frame,
            mat,
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

  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);

  const matCm = MAT_CM[mat] ?? 0;

  const parsedPrint = parseCmSize(selectedVariant?.size);

  const totalSize = parsedPrint ? totalWithMat(parsedPrint.w, parsedPrint.h, matCm) : null;

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
          productSlug: "print and frame",
          variantSku,
          config: {
            orientation: "portrait",
            size: selectedVariant.size,
            frame,
            mat,
            quantity,
            transform: {
              ratio: selectedRatio.id,
              ratioW: selectedRatio.w,
              ratioH: selectedRatio.h,
            },
          },
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
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition active:scale-[0.99]
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
                    ? "ring-2 ring-amber-500/60 bg-amber-50 border border-amber-200"
                    : "border border-slate-200 bg-white hover:bg-slate-50"
                }`}
            >
              <div className="mx-auto h-14 w-14 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                <img src={opt.img} alt={opt.id} className="h-full w-full object-cover" loading="lazy" />
              </div>

              <div className="mt-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-700">
                {opt.id}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function MatTiles({ options, value, onChange }) {
    return (
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 transition">
        {options.map((opt) => {
          const active = opt.id === value;
          const Icon = opt.Icon;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-2xl p-3 text-center transition active:scale-[0.99]
                ${
                  active
                    ? "ring-2 ring-amber-500/60 bg-amber-50 border border-amber-200"
                    : "border border-slate-200 bg-white hover:bg-slate-50"
                }`}
            >
              <div className="mx-auto h-14 w-14">
                <Icon />
              </div>

              <div className="mt-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-700">
                {opt.id}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function parseCmSize(sizeStr) {
    // Accepts "12x18" or "12x18cm" or "12×18"
    if (!sizeStr) return null;

    const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
    const [w, h] = cleaned.split("x").map((n) => Number(n));

    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { w, h };
  }

  function totalWithMat(printW, printH, matCm) {
    return {
      w: printW + matCm * 2,
      h: printH + matCm * 2,
    };
  }

  return (
    <Page title="Editor — Print & Frame">
      {/* Optional: keep widths consistent with your theme */}
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
            <div className="relative overflow-hidden rounded-3xl lg:col-span-7 border border-slate-200 bg-linear-to-b from-amber-50 via-white to-white shadow-sm">
              <div className="p-5">
                {!originalUrl ? (
                  <div className="flex flex-col items-center justify-center">
                    {/* Frame-style upload card */}
                    <button
                      type="button"
                      onClick={() => setIsUploadWizardOpen(true)}
                      className="group relative w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.10)] border border-slate-200 transition active:scale-[0.99]"
                      aria-label="Upload image"
                    >
                      {/* Inner “paper” area */}
                      <div className="relative rounded-2xl bg-white p-4">
                        {/* Inner border (like a mount) */}
                        <div className="rounded-xl border-2 border-slate-200 bg-white">
                          <div className="flex aspect-square items-center justify-center">
                            <div className="text-center">
                              {/* Upload icon */}
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

                        {/* Small “status dot” */}
                        <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-amber-500 shadow" />
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
                      <FramePreview imageUrl={originalUrl} frame={frame} mat={mat} />
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
                    Choose size, frame, mat and quantity.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-amber-50 px-3 py-2 text-sm font-extrabold text-slate-900">
                  {quote ? `${quote.total} ${quote.currency}` : "—"}
                </div>
              </div>

              {/* Sizes */}
              <div className="mt-6 pt-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-extrabold text-slate-900">
                    Total Frame Sizes (CM)
                  </span>

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
                  Total Size:{" "}
                  <b className="text-slate-900">{totalSize ? `${totalSize.w}x${totalSize.h}cm` : "—"}</b>
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

              {/* Mat */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900">
                    Mat Width: <span className={`${ACCENT}`}>{matCm}cm</span>
                  </label>

                  <button
                    type="button"
                    className="text-xs font-extrabold text-slate-700 hover:text-slate-900 underline underline-offset-4"
                    onClick={() =>
                      alert(
                        "A Mat refers to the card insert placed around your photo within a frame, serving as a surrounding border."
                      )
                    }
                  >
                    What is Mat?
                  </button>
                </div>

                <MatTiles options={MAT_OPTIONS} value={mat} onChange={setMat} />
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-extrabold text-slate-900">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Summary */}
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">Selected:</b> {selectedVariant ? `${selectedVariant.size}` : "-"}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">SKU:</b> {selectedVariant ? `${selectedVariant.sku}` : "-"}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">Frame:</b> {frame}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">Mat:</b> {mat} ({matCm}cm)
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">Price:</b> {quote ? `${quote.total} ${quote.currency}` : "—"}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  <b className="text-slate-900">Total Print Size:</b>{" "}
                  {totalSize ? `${totalSize.w}x${totalSize.h}cm` : "—"}
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

        <UploadWizardModal
          isOpen={isUploadWizardOpen}
          onClose={() => setIsUploadWizardOpen(false)}
          onComplete={({ ratio, imageUrl }) => {
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
