/* eslint-disable no-unused-vars */
// client/src/pages/CheckoutPage.jsx
// ----------------------------------------------------
// Checkout Page (Guest)
// Step 1: Load cart
// Step 2: Collect customer + address
// Step 3: Create Order (/api/orders/checkout)
// Step 4: Create PaymentIntent (/api/payments/create-intent)
// Step 5: Take payment using Stripe PaymentElement
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import Page from "../components/Page.jsx";

// ✅ Stripe
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

const UAE_CITIES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
  "Al Ain",
  "Khorfakkan",
];

// ✅ Publishable key comes from Vite env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Payment form (Stripe PaymentElement)
 * This is separated so it can access useStripe/useElements hooks safely.
 */
function PaymentStep({ orderId, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    setMsg("");

    // Stripe not ready yet
    if (!stripe || !elements) return;

    setLoading(true);

    // ✅ Confirms payment for the PaymentIntent tied to clientSecret in <Elements options>
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMsg(error.message || "Payment failed.");
      setLoading(false);
      return;
    }

    // If confirmPayment didn't redirect, we can still proceed.
    // Final source of truth is your webhook updating order to 'paid'.
    if (paymentIntent?.status === "succeeded") {
      onPaid?.();
    } else {
      setMsg("Payment submitted. Please wait while we confirm it...");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handlePay} className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
      <p className="mt-1 text-sm text-gray-600">
        Secure payment powered by Stripe.
      </p>

      <div className="mt-4">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
      >
        {loading ? "Processing..." : "Pay now"}
      </button>

      {msg && (
        <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {msg}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Order ID: <span className="font-mono">{orderId}</span>
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const sessionId = useMemo(() => getSessionId(), []);

  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  // ✅ Stripe state
  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [creating, setCreating] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [orderTotals, setOrderTotals] = useState(null);
  const [emailLocked, setEmailLocked] = useState(false);
  const [countryLocked, setCountryLocked] = useState(false);

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
    country: "United Arab Emirates",
  });

  // ------------------------------
  // Assets helpers (single + multi)
  // ------------------------------
  function isMultiAssets(assets) {
    return !!assets && Array.isArray(assets.items) && assets.items.length > 0;
  }

  function getThumbUrlFromItem(item) {
    const assets = item?.assets || {};

    // ✅ Mini-frames / multi-image items
    if (isMultiAssets(assets)) {
      const first = assets.items.find((x) => x?.previewUrl || x?.originalUrl);
      return first?.previewUrl || first?.originalUrl || "";
    }

    // ✅ Single-image items
    return assets.previewUrl || assets.originalUrl || "";
  }

  function getMiniFramesCount(item) {
    const assets = item?.assets || {};
    if (!isMultiAssets(assets)) return 0;
    return assets.items.length;
  }



  useEffect(() => {
    const loadProfile = async () => {
      try {
        // ✅ if logged in, this returns saved address/phone/name
        const res = await api.get("/users/me");
        const u = res.data?.user;

        if (u?.fullName) setCustomer((prev) => ({ ...prev, fullName: u.fullName }));

        // ✅ Email from profile → set + lock
        if (u?.email) {
          setCustomer((prev) => ({ ...prev, email: u.email }));
          setEmailLocked(true);
        }

        if (u?.phone) setCustomer((prev) => ({ ...prev, phone: u.phone }));

        // ✅ Country from profile → set + lock
        const profileCountry = u?.shippingAddress?.country;
        if (profileCountry) {
          setShippingAddress((prev) => ({
            ...prev,
            ...u.shippingAddress,
            country: profileCountry,
          }));
          setCountryLocked(true);
        } else if (u?.shippingAddress) {
          // If they have address but no country saved, still merge address
          setShippingAddress((prev) => ({
            ...prev,
            ...u.shippingAddress,
            country: prev.country, // keep default
          }));
        }

        if (u?.shippingAddress) {
          setShippingAddress((prev) => ({
            ...prev,
            ...u.shippingAddress,
            // keep default country if saved one is empty
            country: u.shippingAddress.country || prev.country,
          }));
        }
      } catch (err) {
        // If not logged in, /users/me will 401. But you already protect checkout.
        // We silently ignore here.
      }
    };

    loadProfile();
  }, []);


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
  const shipping = cart?.items?.[0]?.shipping

  /**
   * Step: Create order + payment intent, then show payment form.
   */
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Avoid duplicate clicks
    if (creating) return;

    try {
      setCreating(true);

      if (saveAddress) {
        await api.patch("/users/me", {
          fullName: customer.fullName,
          phone: customer.phone,
          shippingAddress,
        });
      }

      // 1) Create Order
      const orderRes = await api.post("/orders/checkout", {
        sessionId,
        customer,
        shippingAddress,
      });

      const createdOrderId = orderRes.data._id;
      setOrderId(createdOrderId);
      setOrderTotals(orderRes.data.totals);

      // 2) Create PaymentIntent
      const piRes = await api.post("/payments/create-intent", {
        orderId: createdOrderId,
      });

      setClientSecret(piRes.data.clientSecret);

      // ✅ Now the payment UI will appear below
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  const displayTotals = orderTotals || {
    subtotal,
    shipping: 0,
    grandTotal: subtotal,
    currency,
  };

  // ✅ Estimated delivery (frontend only)
  // This is just for display before the order is created.
  // Final delivery comes from backend (orderTotals.shipping).
  const estimatedDelivery = useMemo(() => {
    // ✅ Check for free shipping products
    const hasFreeShipping = cart?.items?.some((it) => 
        it.productSlug === "print-and-frame" || it.productSlug === "wedding-frame"
    );
    if (hasFreeShipping) return 0;

    const c = String(shippingAddress?.country || "").trim().toLowerCase();

    const isUAE =
      c === "united arab emirates" ||
      c === "uae" ||
      c === "u.a.e"

    return isUAE ? 35 : 100;
  }, [shippingAddress?.country, cart?.items]);

  // ✅ Before checkout: show estimate. After checkout: show backend-confirmed delivery.
  const deliveryToShow =
    typeof displayTotals?.shipping === "number" && orderTotals
      ? displayTotals.shipping
      : estimatedDelivery;

  // ✅ Total to show (estimate before checkout, real total after checkout)
  const totalToShow =
    orderTotals ? displayTotals.grandTotal : subtotal + estimatedDelivery;

  const isUAE = useMemo(() => {
    const c = String(shippingAddress.country || "").toLowerCase();
    return (
      c === "united arab emirates" ||
      c === "uae" ||
      c === "u.a.e" ||
      c.includes("emirates")
    );
  }, [shippingAddress.country]);


  return (
    <Page title="Checkout">
      <Link to="/cart">
        <button className="w-full rounded-2xl bg-[#FF633F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#FF633F]/90 active:scale-[0.99] transition-all duration-300 hover:scale-105">
          Back to cart
        </button>
      </Link>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
          <b>Error:</b> {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* LEFT: Form + Payment */}
        <div className="lg:col-span-8">
          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-extrabold text-slate-900">Customer details</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              We’ll use this to send updates about your Golden Art Frames order.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Full name *"
                value={customer.fullName}
                onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                required
                disabled={!!clientSecret}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-600"
                placeholder="Email *"
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                required
                disabled={emailLocked || !!clientSecret}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 sm:col-span-2"
                placeholder="Phone *"
                value={customer.phone}
                required
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                disabled={!!clientSecret}
              />
            </div>

            <h3 className="mt-8 text-lg font-extrabold text-slate-900">Shipping address</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              We package your Golden Art Frames order securely and deliver to your doorstep.
            </p>

            <div className="mt-4 grid gap-3">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Address line 1 *"
                value={shippingAddress.line1}
                onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                required
                disabled={!!clientSecret}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Address line 2 (optional)"
                value={shippingAddress.line2}
                onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                disabled={!!clientSecret}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {isUAE ? (
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    required
                    disabled={!!clientSecret}
                  >
                    <option value="">Select City *</option>
                    {UAE_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    placeholder="City *"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    required
                    disabled={!!clientSecret}
                  />
                )}
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Postcode (optional)"
                  value={shippingAddress.postcode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value })}
                  disabled={!!clientSecret}
                />
              </div>

              <input
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-600"
                placeholder="Country *"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                required
                disabled={countryLocked || !!clientSecret}
              />
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                disabled={!!clientSecret}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Save this address for next time
            </label>

            <button
              type="submit"
              disabled={!cart?.items?.length || creating || !!clientSecret}
              className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-extrabold shadow-sm transition active:scale-[0.99]
                ${
                  !cart?.items?.length || creating || !!clientSecret
                    ? "cursor-not-allowed bg-slate-100 text-slate-500"
                    : "bg-[#FF633F] text-white hover:bg-[#FF633F]/90 transition-all duration-300 hover:scale-105"
                }`}
            >
              {creating
                ? "Creating secure checkout..."
                : clientSecret
                ? "Checkout created ✅"
                : "Continue to payment"}
            </button>

            <p className="mt-3 text-xs font-semibold text-slate-600">
              We’ll create your order first, then take payment securely via Stripe.
            </p>
          </form>

          {/* Payment step (only after clientSecret exists) */}
          {clientSecret && (
            <div className="mt-5">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentStep orderId={orderId} onPaid={() => navigate(`/order/${orderId}`)} />
              </Elements>
            </div>
          )}
        </div>

        {/* RIGHT: Summary (sticky) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-slate-200 bg-linear-to-b from-[#FF633F]/5 via-white to-white p-5 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900">Order Summary</h3>

            <div className="mt-4 space-y-3">
              {(cart?.items || []).map((item) => {
                const cfg = item.config || {};

                const material = typeof cfg.material === "string" && cfg.material.length ? cfg.material : null;
                const frame = typeof cfg.frame === "string" && cfg.frame.length ? cfg.frame : null;
                const mat = typeof cfg.mat === "string" && cfg.mat.length ? cfg.mat : null;
                const size = typeof cfg.size === "string" && cfg.size.length ? cfg.size : "—";

                // ✅ qty support for both new + old carts
                const qty = Number(item.quantity || cfg.quantity || 1);

                // ✅ thumb supports single + multi
                const thumb = getThumbUrlFromItem(item);

                const isMiniFrames = item.productSlug === "mini-frames";
                const miniCount = getMiniFramesCount(item);

                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    {/* Thumbnail */}
                    {thumb ? (
                      <img
                        src={thumb}
                        alt="preview"
                        className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        No image
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-extrabold text-slate-900">
                        {item.productSlug?.toUpperCase()}
                      </div>

                      <div className="mt-0.5 text-xs font-semibold text-slate-600">
                        {/* ✅ Mini-frames: show photo count */}
                        {isMiniFrames ? (
                          <>
                            Photos: {miniCount}
                            {" • "}Frame: {frame || "—"}
                            {" • "}Type: {mat || "—"}
                            {" • "}Size: {size}
                          </>
                        ) : (
                          <>
                            {material && <>Material: {material}{" • "}</>}
                            {frame && <>Frame: {frame}{" • "}</>}
                            {mat && <>Mat: {mat}{" • "}</>}
                            Size: {size}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        {item.price?.total} {item.price?.currency}
                      </div>
                      <div className="text-xs font-semibold text-slate-600">Qty: {qty}</div>
                    </div>
                  </div>
                );
              })}

            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span className="font-semibold">Subtotal</span>
                <span className="font-extrabold text-slate-900">
                  {displayTotals.subtotal} {displayTotals.currency}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
                <span className="font-semibold">
                  {orderTotals ? "Delivery" : "Estimated delivery"}
                </span>
                <span className="font-extrabold text-slate-900">
                  {deliveryToShow} {currency}
                </span>
              </div>

              <div className="my-3 h-px bg-slate-200" />

              <div className="flex items-center justify-between text-base">
                <span className="font-extrabold text-slate-900">Total</span>
                <span className="font-extrabold text-slate-900">
                  {totalToShow} {currency}
                </span>
              </div>

            </div>

            <p className="mt-3 text-xs font-semibold text-slate-600">
              Secure checkout • Premium packaging • Doorstep delivery
            </p>
            <p className="mt-2 text-xs text-slate-500">Preview is for reference only.</p>
          </div>
        </div>
      </div>
    </Page>
  );
}
