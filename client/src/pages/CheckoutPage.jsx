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
        className="mt-4 w-full rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
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

      // 1) Create Order
      const orderRes = await api.post("/orders/checkout", {
        sessionId,
        customer,
        shippingAddress,
      });

      const createdOrderId = orderRes.data._id;
      setOrderId(createdOrderId);

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
        {/* LEFT: Form + Payment */}
        <div>
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
                disabled={!!clientSecret} // ✅ lock after payment step starts
              />
              <input
                className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                placeholder="Email *"
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                required
                disabled={!!clientSecret}
              />
              <input
                className="w-full rounded-xl border border-gray-300 p-3 text-sm sm:col-span-2"
                placeholder="Phone"
                value={customer.phone}
                required
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                disabled={!!clientSecret}
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
                disabled={!!clientSecret}
              />
              <input
                className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                placeholder="Address line 2 (optional)"
                value={shippingAddress.line2}
                onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                disabled={!!clientSecret}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                  placeholder="City *"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  required
                  disabled={!!clientSecret}
                />
                <input
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                  placeholder="Postcode * (Optional)"
                  value={shippingAddress.postcode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value })}
                  disabled={!!clientSecret}
                />
              </div>

              <input
                className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                placeholder="Country *"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                required
                disabled={!!clientSecret}
              />
            </div>

            <button
              type="submit"
              disabled={!cart?.items?.length || creating || !!clientSecret}
              className={`mt-6 w-full rounded-2xl border px-4 py-3 font-semibold shadow-sm transition active:scale-[0.99]
                ${
                  !cart?.items?.length || creating || !!clientSecret
                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                    : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                }`}
            >
              {creating ? "Creating secure checkout..." : clientSecret ? "Checkout created ✅" : "Continue to payment"}
            </button>

            <p className="mt-3 text-xs text-gray-600">
              We’ll create your order first, then take payment securely via Stripe.
            </p>
          </form>

          {/* Payment step (only after clientSecret exists) */}
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentStep
                orderId={orderId}
                onPaid={() => navigate(`/order/${orderId}`)}
              />
            </Elements>
          )}
        </div>

        {/* RIGHT: Summary (unchanged) */}
        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>

          <div className="mt-3 space-y-3">
            {(cart?.items || []).map((item) => {
              const cfg = item.config || {};
              const material = typeof cfg.material === "string" && cfg.material.length ? cfg.material : null;
              const frame = typeof cfg.frame === "string" && cfg.frame.length ? cfg.frame : null;
              const mat = typeof cfg.mat === "string" && cfg.mat.length ? cfg.mat : null;
              const size = typeof cfg.size === "string" && cfg.size.length ? cfg.size : "—";
              const qty = Number(cfg.quantity || 1);
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
                    <div className="text-xs text-gray-600">
                      {material && <>Material: {material}{" | "}</>}
                      {frame && <>Frame: {frame}{" | "}</>}
                      {mat && <>Mat: {mat}{" | "}</>}
                      Size: {size}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-gray-900">
                    {item.price?.total} {item.price?.currency}
                    <div className="text-xs font-normal text-gray-600 text-end">Qty: {qty}</div>
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
