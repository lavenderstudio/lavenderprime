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

export default function EditorPrintPortrait() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [mount, setMount] = useState("No Mount");
  const [frame, setFrame] = useState("Black Wood");
  const [mat, setMat] = useState("None");
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
          options: { 
            mount, 
            frame, 
            mat 
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
  }, [variantSku, mount, frame, mat, quantity]);

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
              className={`rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.99]
                ${active ? "bg-gray-900 text-white" : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"}`}
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
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`group rounded-2xl p-2 text-center transition active:scale-[0.99]
                ${active ? "ring-2 ring-emerald-400 bg-emerald-50" : "border border-gray-200 bg-white hover:bg-gray-50"}`}
            >
              <div className="mx-auto h-14 w-14 overflow-hidden rounded-full bg-gray-100">
                <img
                  src={opt.img}
                  alt={opt.id}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
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
      <div className="mt-3 grid grid-cols-4 gap-3">
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
                    ? "ring-2 ring-emerald-400 bg-emerald-50"
                    : "border border-gray-200 bg-white hover:bg-gray-50"
                }`}
            >
              <div className="mx-auto h-14 w-14">
                <Icon />
              </div>

              <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                {opt.id}
              </div>
            </button>
          );
        })}
      </div>
    );
  }




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
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#F3F4F6] shadow-sm">
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
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-900">
                  Total Frame Sizes (CM)
                </label>

                <SizePills
                  variants={portraitVariants}
                  value={variantSku}
                  onChange={setVariantSku}
                />

                <div className="mt-2 text-xs text-gray-600">
                  Print Size: <span className="font-semibold">{selectedVariant?.size || "-"}</span>
                </div>
              </div>
            </div>

            {/* Mount */}
            <div className="mt-4">
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">Frames: {frame}</label>

                  <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-900">
                    Price: {quote ? `${quote.total} ${quote.currency}` : "—"}
                  </div>
                </div>

                <FrameTiles options={FRAME_OPTIONS} value={frame} onChange={setFrame} />
              </div>
            </div>

            {/* MatTiles */}
            <div className="mt-4">
              <div className="mt-6">
                <label className="text-sm font-semibold text-gray-900">Mat Width: 0.0cm</label>
                <MatTiles options={MAT_OPTIONS} value={mat} onChange={setMat} />

                <button
                  type="button"
                  className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
                  onClick={() => alert("Mat = mount spacing around the image (like a border).")}
                >
                  What is Mat?
                </button>
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
                <b>Frame:</b> {frame}
              </div>
              <div className="mt-1 text-sm text-gray-800">
                <b>Mat:</b> {mat}
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
