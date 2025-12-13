// client/src/pages/Cart.jsx
// ----------------------------------------------------
// Updated Cart UI for your new editor changes:
// - Reads config.frame, config.mat, config.transform.ratio
// - Uses assets.originalUrl as preview (Filestack cropped image)
// - Uses your actual backend routes:
//    GET    /api/cart/:sessionId
//    DELETE /api/cart/:sessionId/items/:itemId
//    PATCH  /api/cart/:sessionId/items/:itemId
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import FramePreview from "../components/FramePreview.jsx";
import { MAT_CM } from "../lib/matSizes.js";
import { Link } from "react-router-dom";

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

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  const sessionId = useMemo(() => getSessionId(), []);

  const loadCart = async () => {
    try {
      setError("");
      const res = await api.get(`/api/cart/${sessionId}`);
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
      const res = await api.delete(`/api/cart/${sessionId}/items/${itemId}`);
      setCart(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const handleUpdateQty = async (itemId, nextQty) => {
    try {
      setError("");
      const qty = Math.max(1, Number(nextQty) || 1);

      const res = await api.patch(`/api/cart/${sessionId}/items/${itemId}`, {
        quantity: qty,
      });

      setCart(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <Page title="Cart">
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          <b>Error:</b> {error}
        </div>
      )}

      {!cart ? (
        <p className="text-gray-600">Loading cart…</p>
      ) : (cart.items || []).length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          {/* LEFT: Items */}
          <div className="space-y-4">
            {(cart.items || []).map((it) => {
              const cfg = it.config || {};
              const assets = it.assets || {};

              // ✅ Filestack cropped result is your preview image
              const previewImg = assets.originalUrl || assets.previewUrl || "";

              const frame = cfg.frame || "Black Wood";
              const mat = cfg.mat || "None";
              const matCm = MAT_CM[mat] ?? 0;

              const print = parseCmSize(cfg.size);
              const total = print ? totalWithMat(print.w, print.h, matCm) : null;

              return (
                <div
                  key={it._id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="grid gap-4 sm:grid-cols-[240px,1fr]">
                    {/* Preview */}
                    <div>
                      {previewImg ? (
                        <FramePreview imageUrl={previewImg} frame={frame} mat={mat} />
                      ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-600">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {it.productSlug?.toUpperCase() || "ITEM"} —{" "}
                            {cfg.orientation || "portrait"}
                          </h3>

                          <div className="mt-2 space-y-1 text-sm text-gray-700">
                            <div>
                              <b>Variant SKU:</b> {it.variantSku}
                            </div>

                            <div>
                              <b>Frame:</b> {frame}
                            </div>

                            <div>
                              <b>Mat:</b> {mat} ({matCm}cm)
                            </div>

                            <div>
                              <b>Print Size:</b>{" "}
                              {print ? `${print.w}x${print.h}cm` : cfg.size || "—"}
                            </div>

                            <div>
                              <b>Total Size:</b>{" "}
                              {total ? `${total.w}x${total.h}cm` : "—"}
                            </div>

                            <div>
                              <b>Ratio:</b> {cfg.transform?.ratio || "—"}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(it._id)}
                          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Qty + Price */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">Qty</span>
                          <input
                            type="number"
                            min="1"
                            value={cfg.quantity || 1}
                            onChange={(e) => handleUpdateQty(it._id, e.target.value)}
                            className="w-20 rounded-xl border border-gray-300 p-2 text-sm"
                          />
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-700">
                            Unit:{" "}
                            <b>
                              {it.price?.unit ?? "—"} {it.price?.currency || "AED"}
                            </b>
                          </div>
                          <div className="text-base font-semibold text-gray-900">
                            Total: {it.price?.total ?? "—"}{" "}
                            {it.price?.currency || "AED"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
              <span>Subtotal</span>
              <b>
                {totals.subtotal} {totals.currency}
              </b>
            </div>
            <button className="mt-4 w-full rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99]">
              <Link to="/checkout">
                Proceed to Checkout
              </Link>
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Preview is for reference only.
            </p>
          </div>
        </div>
      )}
    </Page>
  );
}
