/* eslint-disable no-unused-vars */
// client/src/pages/CheckoutPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Checkout — matches HomePage / CartPage theme.
// ALL logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";

// ✅ Stripe
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

const ACCENT = "#FF633F";

const UAE_CITIES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain", "Khorfakkan",
];

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─── Shared input style ───────────────────────────────────────────────────────
const INPUT_BASE =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none " +
  "transition-all duration-200 focus:border-[#FF633F]/60 focus:ring-2 focus:ring-[#FF633F]/15 " +
  "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed placeholder:text-slate-400";

// ─── Labeled input field ──────────────────────────────────────────────────────
function Field({ label, required: req, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}{req && <span style={{ color: ACCENT }}> *</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ step, title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4"
        style={{ background: `linear-gradient(135deg, ${ACCENT}10 0%, transparent 70%)` }}>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
          style={{ background: ACCENT }}
        >
          {step}
        </span>
        <div>
          <p className="text-sm font-extrabold text-slate-900">{title}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT STEP
// ─────────────────────────────────────────────────────────────────────────────
function PaymentStep({ orderId, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMsg(error.message || "Payment failed.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onPaid?.();
    } else {
      setMsg("Payment submitted. Please wait while we confirm it...");
    }
    setLoading(false);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div
        className="flex items-center gap-3 border-b border-slate-100 px-6 py-4"
        style={{ background: `linear-gradient(135deg, ${ACCENT}10 0%, transparent 70%)` }}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
          style={{ background: ACCENT }}
        >
          3
        </span>
        <div>
          <p className="text-sm font-extrabold text-slate-900">Payment</p>
          <p className="text-xs text-slate-400">Secured by Stripe — card details never touch our servers</p>
        </div>
        {/* Lock icon */}
        <svg className="ml-auto h-4 w-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>

      <form onSubmit={handlePay} className="p-6">
        <PaymentElement />

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={!stripe || !elements || loading}
          className="mt-5 w-full rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-sm
                     transition-all duration-300 hover:brightness-110 hover:scale-[1.02]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: "#059669" }}
        >
          {loading ? "Processing Payment…" : "Pay Now 🔒"}
        </motion.button>

        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800"
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-3 text-center text-xs text-slate-400">
          Order ID: <span className="font-mono">{orderId}</span>
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const sessionId = useMemo(() => getSessionId(), []);

  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [creating, setCreating] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [orderTotals, setOrderTotals] = useState(null);
  const [emailLocked, setEmailLocked] = useState(false);
  const [countryLocked, setCountryLocked] = useState(false);

  const [customer, setCustomer] = useState({ fullName: "", email: "", phone: "" });
  const [shippingAddress, setShippingAddress] = useState({
    line1: "", line2: "", city: "", postcode: "", country: "United Arab Emirates",
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  function isMultiAssets(assets) {
    return !!assets && Array.isArray(assets.items) && assets.items.length > 0;
  }
  function getThumbUrlFromItem(item) {
    const assets = item?.assets || {};
    if (isMultiAssets(assets)) {
      const first = assets.items.find((x) => x?.previewUrl || x?.originalUrl);
      return first?.previewUrl || first?.originalUrl || "";
    }
    return assets.previewUrl || assets.originalUrl || "";
  }
  function getMiniFramesCount(item) {
    const assets = item?.assets || {};
    if (!isMultiAssets(assets)) return 0;
    return assets.items.length;
  }

  // ── Load user profile ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/users/me");
        const u = res.data?.user;
        if (u?.fullName) setCustomer((prev) => ({ ...prev, fullName: u.fullName }));
        if (u?.email) { setCustomer((prev) => ({ ...prev, email: u.email })); setEmailLocked(true); }
        if (u?.phone) setCustomer((prev) => ({ ...prev, phone: u.phone }));
        const profileCountry = u?.shippingAddress?.country;
        if (profileCountry) {
          setShippingAddress((prev) => ({ ...prev, ...u.shippingAddress, country: profileCountry }));
          setCountryLocked(true);
        } else if (u?.shippingAddress) {
          setShippingAddress((prev) => ({ ...prev, ...u.shippingAddress, country: prev.country }));
        }
        if (u?.shippingAddress) {
          setShippingAddress((prev) => ({
            ...prev, ...u.shippingAddress,
            country: u.shippingAddress.country || prev.country,
          }));
        }
      } catch { /* silently ignored: not logged in */ }
    };
    loadProfile();
  }, []);

  // ── Load cart ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/cart/${sessionId}`);
        setCart(res.data);
        if (!res.data?.items?.length) setError("Your cart is empty.");
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, [sessionId]);

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price?.total || 0), 0) || 0;
  const currency = cart?.items?.[0]?.price?.currency || "AED";

  // ── Submit form → create order + PaymentIntent ─────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (creating) return;
    try {
      setCreating(true);
      if (saveAddress) {
        await api.patch("/users/me", { fullName: customer.fullName, phone: customer.phone, shippingAddress });
      }
      const orderRes = await api.post("/orders/checkout", { sessionId, customer, shippingAddress });
      const createdOrderId = orderRes.data._id;
      setOrderId(createdOrderId);
      setOrderTotals(orderRes.data.totals);
      const piRes = await api.post("/payments/create-intent", { orderId: createdOrderId });
      setClientSecret(piRes.data.clientSecret);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  const displayTotals = orderTotals || { subtotal, shipping: 0, grandTotal: subtotal, currency };

  const estimatedDelivery = useMemo(() => {
    const hasFreeShipping = cart?.items?.some(
      (it) => it.productSlug === "print-and-frame" || it.productSlug === "wedding-frame"
    );
    if (hasFreeShipping) return 0;
    const c = String(shippingAddress?.country || "").trim().toLowerCase();
    const isUAE = c === "united arab emirates" || c === "uae" || c === "u.a.e";
    return isUAE ? 35 : 100;
  }, [shippingAddress?.country, cart?.items]);

  const deliveryToShow =
    typeof displayTotals?.shipping === "number" && orderTotals
      ? displayTotals.shipping
      : estimatedDelivery;

  const totalToShow = orderTotals ? displayTotals.grandTotal : subtotal + estimatedDelivery;

  const isUAE = useMemo(() => {
    const c = String(shippingAddress.country || "").toLowerCase();
    return c === "united arab emirates" || c === "uae" || c === "u.a.e" || c.includes("emirates");
  }, [shippingAddress.country]);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: ACCENT }}
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: ACCENT }}
        >
          Golden Art Frames
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-4xl font-extrabold text-white"
        >
          Checkout
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-2 text-sm text-white/50"
        >
          Complete your order securely
        </motion.p>

        {/* Back to cart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-5"
        >
          <Link
            to="/cart"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-white/40
                       transition-all duration-300 hover:text-white/80"
          >
            <span>←</span>
            <span className="relative after:absolute after:left-0 after:-bottom-0.5
                             after:h-[1.5px] after:w-full after:origin-left after:scale-x-0
                             after:bg-white/60 after:transition-transform after:duration-300
                             group-hover:after:scale-x-100">
              Back To Cart
            </span>
          </Link>
        </motion.div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              <b>Error:</b> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">

          {/* ── LEFT: Form + Payment ──────────────────────────────────────── */}
          <div className="space-y-5 lg:col-span-8">

            <form onSubmit={onSubmit} className="space-y-5">

              {/* Step 1 — Customer details */}
              <Section
                step="1"
                title="Customer Details"
                subtitle="We'll use this to send order updates"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <input
                      className={INPUT_BASE}
                      placeholder="e.g. Ahmed Al Zaabi"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      required
                      disabled={!!clientSecret}
                    />
                  </Field>
                  <Field label="Email Address" required>
                    <input
                      className={INPUT_BASE}
                      placeholder="your@email.com"
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      required
                      disabled={emailLocked || !!clientSecret}
                    />
                  </Field>
                  <Field label="Phone Number" required>
                    <input
                      className={`${INPUT_BASE} sm:col-span-2`}
                      placeholder="+971 50 000 0000"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      required
                      disabled={!!clientSecret}
                    />
                  </Field>
                </div>
              </Section>

              {/* Step 2 — Shipping address */}
              <Section
                step="2"
                title="Shipping Address"
                subtitle="We package securely and deliver to your door"
              >
                <div className="grid gap-4">
                  <Field label="Address Line 1" required>
                    <input
                      className={INPUT_BASE}
                      placeholder="Building name, street"
                      value={shippingAddress.line1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                      required
                      disabled={!!clientSecret}
                    />
                  </Field>
                  <Field label="Address Line 2">
                    <input
                      className={INPUT_BASE}
                      placeholder="Apartment, suite, unit (optional)"
                      value={shippingAddress.line2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                      disabled={!!clientSecret}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="City" required>
                      {isUAE ? (
                        <select
                          className={INPUT_BASE}
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          required
                          disabled={!!clientSecret}
                        >
                          <option value="">Select city…</option>
                          {UAE_CITIES.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className={INPUT_BASE}
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          required
                          disabled={!!clientSecret}
                        />
                      )}
                    </Field>
                    <Field label="Postcode">
                      <input
                        className={INPUT_BASE}
                        placeholder="Optional"
                        value={shippingAddress.postcode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value })}
                        disabled={!!clientSecret}
                      />
                    </Field>
                  </div>

                  <Field label="Country" required>
                    <input
                      className={INPUT_BASE}
                      placeholder="Country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      required
                      disabled={countryLocked || !!clientSecret}
                    />
                  </Field>

                  {/* Save address toggle */}
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-[#FF633F]/30">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      disabled={!!clientSecret}
                      className="h-4 w-4 rounded border-slate-300 accent-[#FF633F]"
                    />
                    <span className="text-sm font-semibold text-slate-700">Save this address for next time</span>
                  </label>
                </div>

                {/* Continue CTA */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  disabled={!cart?.items?.length || creating || !!clientSecret}
                  className="mt-5 w-full rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-sm
                             transition-all duration-300 hover:brightness-110 hover:scale-[1.02]
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: !cart?.items?.length || creating || !!clientSecret
                      ? "#94a3b8"
                      : ACCENT
                  }}
                >
                  {creating
                    ? "Creating Secure Checkout…"
                    : clientSecret
                    ? "Details Saved ✅"
                    : "Continue To Payment →"}
                </motion.button>
                <p className="mt-2 text-center text-xs text-slate-400">
                  We'll create your order first, then take payment securely via Stripe.
                </p>
              </Section>
            </form>

            {/* Step 3 — Payment (only after clientSecret) */}
            <AnimatePresence>
              {clientSecret && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentStep orderId={orderId} onPaid={() => navigate(`/order/${orderId}`)} />
                  </Elements>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Order summary ──────────────────────────────────────── */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

              {/* Header */}
              <div
                className="px-6 py-5"
                style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, transparent 70%)` }}
              >
                <h3 className="text-lg font-extrabold text-slate-900">Order Summary</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {cart?.items?.length ?? 0} item{cart?.items?.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-3 px-6 pt-4">
                {(cart?.items || []).map((item) => {
                  const cfg = item.config || {};
                  const material = typeof cfg.material === "string" && cfg.material.length ? cfg.material : null;
                  const frame = typeof cfg.frame === "string" && cfg.frame.length ? cfg.frame : null;
                  const mat = typeof cfg.mat === "string" && cfg.mat.length ? cfg.mat : null;
                  const size = typeof cfg.size === "string" && cfg.size.length ? cfg.size : "—";
                  const qty = Number(item.quantity || cfg.quantity || 1);
                  const thumb = getThumbUrlFromItem(item);
                  const isMiniFrames = item.productSlug === "mini-frames";
                  const miniCount = getMiniFramesCount(item);

                  return (
                    <div
                      key={item._id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                    >
                      {/* Thumb */}
                      {thumb ? (
                        <img
                          src={thumb}
                          alt="preview"
                          className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-[9px] font-bold text-slate-400">
                          No img
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-900">
                          {item.productSlug
                            ?.split("-")
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ") || "Item"}
                        </p>
                        <p className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-400">
                          {isMiniFrames
                            ? `${miniCount} photos · ${frame || "—"} · ${size}`
                            : [material && `Mat: ${material}`, frame && `Frame: ${frame}`, mat && `Mat: ${mat}`, `Size: ${size}`]
                                .filter(Boolean).join(" · ")}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-slate-900">
                          {item.price?.total} {item.price?.currency}
                        </p>
                        <p className="text-[10px] text-slate-400">Qty: {qty}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="px-6 pb-6 pt-4">
                <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-extrabold text-slate-900">
                      {displayTotals.subtotal} {displayTotals.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {orderTotals ? "Delivery" : "Est. Delivery"}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {deliveryToShow} {currency}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">Total</span>
                    <span className="text-lg font-extrabold" style={{ color: ACCENT }}>
                      {totalToShow} {currency}
                    </span>
                  </div>
                </div>

                {/* Trust pills */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {["🔒 Secure checkout", "📦 Premium packaging", "🚚 UAE delivery"].map(t => (
                    <span
                      key={t}
                      className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-slate-400">
                  Preview is for reference only.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
