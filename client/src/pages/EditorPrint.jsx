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
import PrintPreview from "../components/PrintPreview.jsx";

export default function EditorPrint() {
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
        const res = await api.get("/api/products/print");
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
        const res = await api.post("/api/pricing/quote", {
          productSlug: "print",
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

      await api.post("/api/cart/items", {
        sessionId,
        item: {
          productSlug: "print",
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
              className={`rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.99]
                ${
                  active
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
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
			<div className="mt-3 grid grid-cols-2 gap-3 transition">
				{options.map((opt) => {
					const active = opt.name === value;

					return (
						<button
							key={opt.name}
							type="button"
							onClick={() => onChange(opt.name)}
							className={`rounded-2xl  p-3 text-center transition active:scale-[1.05]
								${
									active
										? "ring-2 ring-emerald-400 bg-emerald-50"
										: "border border-gray-200 bg-white hover:bg-gray-50"
								}`}
						>
							<div className="text-sm font-semibold text-gray-900">
								{opt.name}
							</div>

							{opt.price > 0 && (
								<div className="mt-1 text-xs text-gray-500">
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
    // Accepts "12x18" or "12x18cm" or "12×18"
    if (!sizeStr) return null;

    const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
    const [w, h] = cleaned.split("x").map((n) => Number(n));

    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { w, h };
  }



  return (
    <Page title="Editor — Print & Frame">
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
          <b>Error:</b> {error}
        </div>
      )}

      {!product ? (
        <p className="text-gray-600">Loading product…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* LEFT: Editor */}
          <div className="relative overflow-hidden rounded-2xl lg:col-span-7 border border-gray-200 bg-[#F3F4F6] shadow-sm">
						<div className="p-5">
							{!originalUrl ? (
								<>
									<p className="text-gray-700">Upload a photo to start editing.</p>

									<button
										onClick={() => setIsUploadWizardOpen(true)}
										className="mt-4 w-full rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99]"
									>
										Upload Image
									</button>

									<p className="mt-3 text-xs text-gray-600">
										You’ll choose a ratio first, then crop it, then see a framed preview.
									</p>
								</>
							) : (
								<>
									<div className="flex items-center justify-between">
										<div className="text-sm text-gray-700">
											<b>Ratio:</b> {selectedRatio?.id || "-"}
										</div>

										<button
											onClick={() => setIsUploadWizardOpen(true)}
											className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
										>
											Change Image
										</button>
									</div>

									<div className="mt-4">
										<PrintPreview
                      imageUrl={originalUrl}
                    />
									</div>
								</>
							)}
						</div>
					</div>


          {/* RIGHT: Options */}
          <div className="rounded-2xl border border-gray-200 bg-white lg:col-span-5 p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Options</h3>

            {/* Sizes */}
            <div className="mt-6 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Total Frame Sizes (CM)
                </span>

                <span className="text-sm text-gray-700">
                  Print Size:{" "}
                  <b>
                    {parsedPrint
                      ? `${parsedPrint.w}x${parsedPrint.h}cm`
                      : selectedVariant?.size || "-"}
                  </b>
                </span>
              </div>

              <div className="mt-2">   
                <SizePills
                  variants={portraitVariants}
                  value={variantSku}
                  onChange={setVariantSku}
                />
              </div>
            </div>

            {/* Mount */}
            <div className="mt-4">
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">Material: {material}</label>

                  <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-900">
                    Price: {quote ? `${quote.total} ${quote.currency}` : "—"}
                  </div>
                </div>

                <MaterialTiles
									options={materialOptions}
									value={material}
									onChange={setMaterial}
								/>
              </div>
            </div>

            

            

            {/* Quantity */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-800">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
              />
            </div>

            {/* Summary */}
            <div className="mt-4 rounded-2xl bg-gray-50 p-3">
              <div className="text-sm text-gray-800">
                <b>Selected:</b>{" "}
                {selectedVariant ? `${selectedVariant.size}` : "-"}
              </div>
              <div className="mt-1 text-sm text-gray-800">
                <b>SKU:</b>{" "}
                {selectedVariant ? `${selectedVariant.sku}` : "-"}
              </div>
              <div className="mt-1 text-sm text-gray-800">
                <b>Material:</b> {material}
              </div>
              <div className="mt-1 text-sm text-gray-800">
                <b>Price:</b> {quote ? `${quote.total} ${quote.currency}` : "—"}
              </div>
            </div>

            <button
              disabled={!originalUrl || !quote || !selectedRatio}
              onClick={handleAddToCart}
              className={`mt-4 w-full rounded-2xl border px-4 py-3 font-semibold shadow-sm transition active:scale-[0.99]
                ${
                  !originalUrl || !quote
                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                    : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                }`}
            >
              Add to Cart
            </button>

            {/* In-page preview fallback
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">Preview</p>
                <img
                  src={previewUrl}
                  alt="Cropped preview"
                  className="mt-2 w-full rounded-2xl border border-gray-200"
                />
              </div>
            )} */}
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
        <Link to="/products" className="text-sm text-blue-600 hover:underline">
          <button type="button" className="mt-4 inline-block rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99]">&#8592;
            Back to Products
          </button>
        </Link>
      </div>
    </Page>
  );
}
