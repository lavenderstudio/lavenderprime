// client/src/pages/CartPage.jsx
// Tailwind version: responsive cart UI

import { useEffect, useState } from "react";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import { Link } from "react-router-dom";
import Page from "../components/Page.jsx";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  const sessionId = getSessionId();

  const refreshCart = async () => {
    try {
      const res = await api.get(`/api/cart/${sessionId}`);
      setCart(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const cartTotal = cart?.items?.reduce((sum, item) => sum + (item.price?.total || 0), 0) || 0;

  return (
    <Page title="Your Cart">
      <div className="flex items-center justify-between">
        <Link to="/print/portrait" className="text-sm text-blue-600 hover:underline">
          ← Continue shopping
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
          <b>Error:</b> {error}
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <p className="mt-6 text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr,1fr]">
          {/* Items */}
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="grid gap-4 sm:grid-cols-[120px,1fr]">
                  <img
                    src={item.assets?.previewUrl || item.assets?.originalUrl}
                    alt="Preview"
                    className="h-30 w-30 rounded-xl border border-gray-200 object-cover"
                  />

                  <div className="space-y-1 text-sm text-gray-800">
                    <div>
                      <b>Product:</b> {item.productSlug}
                    </div>
                    <div>
                      <b>Size:</b> {item.config?.size}
                    </div>
                    <div>
                      <b>Mount:</b> {item.config?.mount}
                    </div>
                    <div>
                      <b>Quantity:</b> {item.config?.quantity}
                    </div>

                    <div className="pt-2 text-base font-semibold text-gray-900">
                      {item.price?.total} {item.price?.currency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>

            <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-800">
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold">{cartTotal} AED</span>
              </div>
            </div>

            <button
              className="mt-4 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 shadow-sm hover:bg-gray-50 active:scale-[0.99]"
              onClick={() => (window.location.href = "/checkout")}
            >
              Proceed to Checkout
            </button>

            <p className="mt-3 text-xs text-gray-600">
              Next we’ll add remove/update quantity and then checkout + order snapshot.
            </p>
          </div>
        </div>
      )}
    </Page>
  );
}
