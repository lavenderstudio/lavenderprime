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

export default function EditorPrintPortrait() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [mount, setMount] = useState("No Mount");
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

  const mountOptions = useMemo(() => {
    return product?.options?.mounts?.map((m) => m.name) || ["No Mount"];
  }, [product]);

  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        const res = await api.post("/api/pricing/quote", {
          productSlug: "print",
          variantSku,
          options: { mount },
          quantity,
        });
        setQuote(res.data);
      } catch (err) {
        setQuote(null);
        setError(err?.response?.data?.message || err.message);
      }
    };
    getQuote();
  }, [variantSku, mount, quantity]);

  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);

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
            mount,
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

  return (
    <Page title="Editor — Print Portrait">
      <div className="mb-3">
        <Link to="/print/portrait" className="text-sm text-blue-600 hover:underline">
          ← Back
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
          <b>Error:</b> {error}
        </div>
      )}

      {!product ? (
        <p className="text-gray-600">Loading product…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
          {/* LEFT: Editor */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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
										You’ll choose a ratio first, then crop in Filestack, then see a framed preview.
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
										<FramePreview imageUrl={originalUrl} />
									</div>
								</>
							)}
						</div>
					</div>


          {/* RIGHT: Options */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Options</h3>

            {/* Size */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-800">Size</label>
              <select
                value={variantSku}
                onChange={(e) => setVariantSku(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
              >
                {portraitVariants.map((v) => (
                  <option key={v.sku} value={v.sku}>
                    {v.size} — {v.basePrice} AED
                  </option>
                ))}
              </select>
            </div>

            {/* Mount */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-800">Mount</label>
              <select
                value={mount}
                onChange={(e) => setMount(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
              >
                {mountOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
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
                {selectedVariant ? `${selectedVariant.size} (${selectedVariant.sku})` : "-"}
              </div>
              <div className="mt-1 text-sm text-gray-800">
                <b>Mount:</b> {mount}
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
    </Page>
  );
}
