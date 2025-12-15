// client/src/pages/CheckoutPage.jsx
// ----------------------------------------------------
// Checkout Page (Guest)
// - Loads cart
// - Collects customer + address
// - Calls POST /api/orders/checkout
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import Page from "../components/Page.jsx";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/cart/${sessionId}`);
        setCart(res.data);

        if (!res.data?.items?.length) {
          setError("Your cart is empty.");
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, [sessionId]);

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price?.total || 0), 0) || 0;
  const currency = cart?.items?.[0]?.price?.currency || "AED";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/orders/checkout", {
        sessionId,
        customer,
        shippingAddress,
      });

      navigate(`/order/${res.data._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <Page title="Checkout">
      <div className="flex items-center justify-between">
        <Link to="/cart">
          <button className="mt-4 w-full rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99]">
            Back to cart
          </button>
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
          <b>Error:</b> {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr,1fr]">
        {/* Form */}
        <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Customer details</h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              className="w-full rounded-xl border border-gray-300 p-3 text-sm"
              placeholder="Full name *"
              value={customer.fullName}
              onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
              required
            />
            <input
              className="w-full rounded-xl border border-gray-300 p-3 text-sm"
              placeholder="Email *"
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              required
            />
            <input
              className="w-full rounded-xl border border-gray-300 p-3 text-sm sm:col-span-2"
              placeholder="Phone (optional)"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
          </div>

          <h3 className="mt-6 text-lg font-semibold text-gray-900">Shipping address</h3>

          <div className="mt-3 grid gap-3">
            <input
              className="w-full rounded-xl border border-gray-300 p-3 text-sm"
              placeholder="Address line 1 *"
              value={shippingAddress.line1}
              onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
              required
            />
            <input
              className="w-full rounded-xl border border-gray-300 p-3 text-sm"
              placeholder="Address line 2 (optional)"
              value={shippingAddress.line2}
              onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                placeholder="City *"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                required
              />
              <input
                className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                placeholder="Postcode *"
                value={shippingAddress.postcode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value })}
                required
              />
            </div>

            <input
              className="w-full rounded-xl border border-gray-300 p-3 text-sm"
              placeholder="Country *"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!cart?.items?.length}
            className={`mt-6 w-full rounded-2xl border px-4 py-3 font-semibold shadow-sm transition active:scale-[0.99]
              ${
                !cart?.items?.length
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                  : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              }`}
          >
            Place Order (MVP)
          </button>

          <p className="mt-3 text-xs text-gray-600">
            MVP checkout: this creates an order snapshot and clears the cart (payments later).
          </p>
        </form>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Order summary</h3>

          <div className="mt-3 space-y-3">
            {(cart?.items || []).map((item) => {
              const cfg = item.config || {};

              // Detect which fields exist (so we don’t show empty labels)
              const material =
                typeof cfg.material === "string" && cfg.material.length ? cfg.material : null;

              const frame =
                typeof cfg.frame === "string" && cfg.frame.length ? cfg.frame : null;

              const mat =
                typeof cfg.mat === "string" && cfg.mat.length ? cfg.mat : null;

              const size =
                typeof cfg.size === "string" && cfg.size.length ? cfg.size : "—";

              const qty = Number(cfg.quantity || 1);

              // Use previewUrl if you have it, else originalUrl
              const thumb = item.assets?.previewUrl || item.assets?.originalUrl || "";

              return (
                <div key={item._id} className="flex items-center gap-3">
                  <img
                    src={thumb}
                    alt="preview"
                    className="h-12 w-12 rounded-xl border border-gray-200 object-cover"
                  />

                  <div className="flex-1 text-sm text-gray-800">
                    <div className="font-semibold">{item.productSlug?.toUpperCase()}</div>

                    {/* Only show the options that apply */}
                    <div className="text-xs text-gray-600">
                      {material && (
                        <>
                          Material: {material}
                          {" | "}
                        </>
                      )}

                      {frame && (
                        <>
                          Frame: {frame}
                          {" | "}
                        </>
                      )}

                      {mat && (
                        <>
                          Mat: {mat}
                          {" | "}
                        </>
                      )}

                      Size: {size}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-gray-900">
                    {item.price?.total} {item.price?.currency}
                    <div className="text-xs font-normal text-gray-600 text-end">
                      Qty: {qty}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-800">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">
                {subtotal} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
