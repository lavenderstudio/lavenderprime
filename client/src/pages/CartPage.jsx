 
// client/src/pages/Cart.jsx
// ----------------------------------------------------
// THEME UPDATE ONLY (Golden Art Frames look)
// ✅ NO logic changes
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { MAT_CM } from "../lib/matSizes.js";
import { getSessionId } from "../lib/session.js";
import Page from "../components/Page.jsx";
import FramePreview from "../components/FramePreview.jsx";
import Canvas3DPreview from "../components/CanvasStretchedPreview.jsx";
import CollagePreview from "../components/CollagePreview.jsx";
import WeddingFramePreview from "../components/WeddingFramePreview.jsx";

// Parse "63x93" or "63x93cm"
function parseCmSize(sizeStr) {
  if (!sizeStr) return null;

  const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
  const [w, h] = cleaned.split("x").map(Number);

  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { w, h };
}

function totalWithMat(w, h, matCm) {
  return { w: w + matCm * 2, h: h + matCm * 2 };
}

function isMultiAssets(assets) {
  return !!assets && Array.isArray(assets.items) && assets.items.length > 0;
}

function getPreviewFromCartItem(it) {
  const assets = it?.assets || {};

  // ✅ Multi-image (mini-frames)
  if (isMultiAssets(assets)) {
    const first = assets.items.find((x) => x?.originalUrl || x?.previewUrl);
    return first?.originalUrl || first?.previewUrl || "";
  }

  // ✅ Single-image (prints/canvas/print&frame)
  if (assets.originalUrl || assets.previewUrl) {
    return assets.originalUrl || assets.previewUrl || "";
  }

  // ✅ Ultra-legacy fallback (if you ever stored at root)
  if (it?.originalUrl || it?.previewUrl) {
    return it.originalUrl || it.previewUrl || "";
  }

  return "";
}


export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sessionId = useMemo(() => getSessionId(), []);

  const handleProceedToCheckout = async () => {
    try {
      // ✅ Check if user is logged in
      await api.get("/auth/me");

      // ✅ Logged in → go to checkout
      navigate("/checkout");
    } catch (err) {
      if (err.response?.status === 401) {
        // ❌ Not logged in → redirect to login
        navigate("/login", {
          state: { from: "/checkout" },
        });
      } else {
        setError(err.message);
      }
    }
  };

  const loadCart = async () => {
    try {
      setError("");
      const res = await api.get(`/cart/${sessionId}`);
      setCart(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const items = cart?.items || [];
    const subtotal = items.reduce((sum, it) => sum + (it?.price?.total || 0), 0);
    const currency = items[0]?.price?.currency || "AED";
    return { subtotal, currency };
  }, [cart]);

  const handleRemove = async (itemId) => {
    try {
      setError("");
      const res = await api.delete(`/cart/${sessionId}/items/${itemId}`);
      setCart(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  function isCollageItem(it) {
    return it?.productSlug === "collage-frame" || it?.config?.orientation === "collage";
  }

  function isWeddingFrameItem(it) {
    return it?.productSlug === "wedding-frame" || it?.productSlug === "wedding-print";
  }

  return (
    <Page title="Cart">
      {error && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm">
          <b>Error:</b> {error}
        </div>
      )}

      {!cart ? (
        <p className="text-slate-600">Loading cart…</p>
      ) : (cart.items || []).length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-linear-to-b from-[#FF633F]/5 via-white to-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Start creating premium prints and frames with Golden Art Frames.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#FF633F] px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[#FF633F]/90 transition-all duration-300 hover:scale-105 active:scale-[0.99]"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* LEFT: Items */}
          <div className="space-y-4 lg:col-span-8">
            {(cart.items || []).map((it) => {
              const cfg = it.config || {};
              const assets = it.assets || {};
              const previewImg = getPreviewFromCartItem(it);
              const isMiniFrames = it.productSlug === "mini-frames";

              const print = parseCmSize(cfg.size);
              const hasFrame = typeof cfg.frame === "string" && cfg.frame.length > 0;
              const hasMat = typeof cfg.mat === "string" && cfg.mat.length > 0;
              const hasMaterial = typeof cfg.material === "string" && cfg.material.length > 0;

              const frame = hasFrame ? cfg.frame : null;
              const mat = hasMat ? cfg.mat : null;
              const matCm = mat ? (MAT_CM[mat] ?? 0) : 0;

              const total = print && mat ? totalWithMat(print.w, print.h, matCm) : null;

              return (
                <div
                  key={it._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-5 sm:grid-cols-[260px,1fr]">
                    {/* Preview */}
                    <div className="rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-3">
                      {/* ✅ COLLAGE-FRAME: render CollagePreview (NO logic change to others) */}
                      {isCollageItem(it) && isMultiAssets(assets) ? (
                        <CollagePreview
                          frame={frame || "Black Wood"}
                          mat={mat || "None"}
                          layout={cfg.layout || "square"} // will fallback safely if missing
                          imageCount={cfg.imageCount || assets.items.length} // fallback to items length
                          assets={assets.items}
                          maxWidthClass="max-w-[300px]"
                        />
                      ) : isMiniFrames && isMultiAssets(assets) ? (
                        /* ✅ MINI-FRAMES: render grid of N previews */
                        <div className="grid grid-cols-2 gap-3">
                          {assets.items.map((a, idx) => {
                            const url = a?.originalUrl || a?.previewUrl || "";
                            return (
                              <div
                                key={idx}
                                className="rounded-2xl border border-slate-200 bg-white p-2"
                              >
                                {url ? (
                                  <FramePreview
                                    imageUrl={url}
                                    frame={frame || "Black Wood"}
                                    mat={mat || "None"}
                                  />
                                ) : (
                                  <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
                                    No image
                                  </div>
                                )}
                                <div className="mt-2 text-center text-[11px] font-extrabold text-slate-700">
                                  #{idx + 1}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* ✅ ALL OTHER PRODUCTS: single preview */
                        <>
                          {previewImg ? (
                            <>
                              {isWeddingFrameItem(it) ? (
                                <WeddingFramePreview
                                  imageUrl={previewImg}
                                  frame={frame || "White Wood"}
                                  groomName={it.personalization?.groomName}
                                  brideName={it.personalization?.brideName}
                                  locationText={it.personalization?.location}
                                  weddingDateText={it.personalization?.weddingDate}
                                  message={it.personalization?.message}
                                  maxWidthClass="max-w-[410px]"
                                />
                              ) : frame === "Stretched" ? (
                                <Canvas3DPreview imageUrl={previewImg} />
                              ) : (
                                <FramePreview
                                  imageUrl={previewImg}
                                  frame={frame || "White Wood"}
                                  mat={mat || "None"}
                                />
                              )}
                            </>
                          ) : (
                            <div className="flex aspect-4/3 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600">
                              No image
                            </div>
                          )}
                        </>
                      )}
                    </div>



                    {/* Details */}
                    <div className="flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {it.productSlug?.toUpperCase() || "ITEM"}
                            </h3>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              SKU: {it.variantSku}
                            </span>
                          </div>

                          {/* Specs */}
                          <div className="mt-4 flex w-full flex-col gap-4 lg:flex-row lg:items-start">
                            {/* LEFT: Specs (single line) */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700 lg:flex-nowrap">
                              {hasMaterial && (
                                <div className="whitespace-nowrap">
                                  <span className="font-extrabold text-slate-900">Material:</span>{" "}
                                  {cfg.material}
                                </div>
                              )}

                              {frame && (
                                <div className="whitespace-nowrap">
                                  <span className="font-extrabold text-slate-900">Frame:</span>{" "}
                                  {frame}
                                </div>
                              )}

                              {mat && (
                                <div className="whitespace-nowrap">
                                  <span className="font-extrabold text-slate-900">
                                    {isMiniFrames ? "Frame Type:" : "Mat:"}
                                  </span>{" "}
                                  {mat}
                                  {!isMiniFrames && ` (${matCm}cm)`}
                                </div>
                              )}

                              <div className="whitespace-nowrap">
                                <span className="font-extrabold text-slate-900">Print Size:</span>{" "}
                                {print ? `${print.w}x${print.h}cm` : cfg.size || "—"}
                              </div>

                              {mat && (
                                <div className="whitespace-nowrap">
                                  <span className="font-extrabold text-slate-900">Total Size:</span>{" "}
                                  {total ? `${total.w}x${total.h}cm` : "—"}
                                </div>
                              )}
                            </div>

                            {/* RIGHT: Personalisation (fixed column, full width inside) */}
                            {isWeddingFrameItem(it) && it.personalization && (
                              <div className="w-full lg:max-w-md lg:ml-auto">
                                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                  <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                                    Personalisation
                                  </div>

                                  {it.personalization.groomName && it.personalization.brideName && (
                                    <div>
                                      <span className="font-extrabold text-slate-900">Names:</span>{" "}
                                      {it.personalization.groomName} & {it.personalization.brideName}
                                    </div>
                                  )}

                                  {it.personalization.location && (
                                    <div>
                                      <span className="font-extrabold text-slate-900">Location:</span>{" "}
                                      {it.personalization.location}
                                    </div>
                                  )}

                                  {it.personalization.weddingDate && (
                                    <div>
                                      <span className="font-extrabold text-slate-900">Date:</span>{" "}
                                      {it.personalization.weddingDate}
                                    </div>
                                  )}

                                  {it.personalization.message && (
                                    <div className="italic text-slate-600">
                                      “{it.personalization.message}”
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(it._id)}
                          className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 transition active:scale-[0.98]"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Qty + Price */}
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm text-slate-700">
                            Unit:{" "}
                            <b className="text-slate-900">
                              {it.price?.unit ?? "—"} {it.price?.currency || "AED"}
                            </b>
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            Total: {it.price?.total ?? "—"} {it.price?.currency || "AED"}
                          </div>
                        </div>
                      </div>

                      {/* Tiny note row (optional but classy) */}
                      <div className="mt-3 text-xs font-semibold text-slate-500">
                        Preview is for reference only. Final output may vary slightly due to screen calibration.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl border border-slate-200 bg-linear-to-b from-[#FF633F]/5 via-white to-white p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900">Order Summary</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span className="font-semibold">Subtotal</span>
                  <b className="text-slate-900">
                    {totals.subtotal} {totals.currency}
                  </b>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span className="font-semibold">Delivery</span>
                  <span className="text-slate-500">Calculated at checkout</span>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex items-center justify-between text-base">
                  <span className="font-extrabold text-slate-900">Total</span>
                  <span className="font-extrabold text-slate-900">
                    {totals.subtotal} {totals.currency}
                  </span>
                </div>
              </div>

              {/* Keep your existing proceed logic (auth check + navigate) */}
              <Link to="/checkout">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={!cart?.items?.length}
                  className="mt-5 w-full rounded-2xl bg-[#FF633F] px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[#FF633F]/90 active:scale-[0.99] disabled:opacity-60 transition-all duration-300 hover:scale-105"
                >
                  Proceed to Checkout
                </button>
              </Link>

              <p className="mt-3 text-xs font-semibold text-slate-600">
                Secure checkout • Premium packaging • Doorstep delivery
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Preview is for reference only.
              </p>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
