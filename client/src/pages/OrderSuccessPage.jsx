/* eslint-disable react-hooks/exhaustive-deps */
// client/src/pages/OrderSuccessPage.jsx
// ----------------------------------------------------
// Order confirmation / status page
// - Fetches order by ID
// - Polls for a short time because Stripe webhook updates can be slightly delayed
// - Shows clear UI for "requires_payment" vs "paid" vs fulfilment statuses
// ----------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import Page from "../components/Page.jsx";

// ✅ Theme tokens (ACCENT colors) from your home ui
import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

// Optional icons (feel free to remove)
import { CheckCircle2, AlertTriangle, RefreshCcw, CreditCard, ArrowLeft } from "lucide-react";

// Small helper to make status look nicer
function statusLabel(status) {
  const map = {
    requires_payment: "Payment required",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    pending: "Pending",
  };
  return map[status] || status || "—";
}

// Helps decide banner styling
function isPositiveStatus(status) {
  return ["paid", "processing", "shipped", "completed"].includes(status);
}

export default function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(false);

  // ✅ Poll settings (MVP)
  const POLL_EVERY_MS = 2000; // 2 seconds
  const POLL_MAX_MS = 30000; // 30 seconds

  const pollTimerRef = useRef(null);
  const pollStartRef = useRef(0);

  const isPaid = useMemo(
    () =>
      order?.status === "paid" ||
      order?.status === "processing" ||
      order?.status === "shipped" ||
      order?.status === "completed",
    [order]
  );

  const loadOrder = async () => {
    const res = await api.get(`/orders/${id}`);
    setOrder(res.data);
    return res.data;
  };

  useEffect(() => {
    let isMounted = true;

    const startPollingIfNeeded = (freshOrder) => {
      // Only poll if payment is still required
      if (freshOrder?.status !== "requires_payment") return;

      // Avoid multiple poll loops
      if (pollTimerRef.current) return;

      setPolling(true);
      pollStartRef.current = Date.now();

      pollTimerRef.current = setInterval(async () => {
        try {
          const latest = await api.get(`/orders/${id}`);
          if (!isMounted) return;

          setOrder(latest.data);

          // Stop polling once paid (or progressed)
          if (latest.data?.status && latest.data.status !== "requires_payment") {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setPolling(false);
            return;
          }

          // Stop polling after max time (avoid infinite polling)
          const elapsed = Date.now() - pollStartRef.current;
          if (elapsed >= POLL_MAX_MS) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setPolling(false);
          }
        } catch (e) {
          // If polling fails, stop and show error
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
          setPolling(false);
          setError(e?.response?.data?.message || e.message);
        }
      }, POLL_EVERY_MS);
    };

    const init = async () => {
      try {
        setError("");
        const fresh = await loadOrder();
        if (!isMounted) return;
        startPollingIfNeeded(fresh);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [id]);

  const badgeCls = (status) => {
    // Uses your ACCENT for the positive state
    if (isPositiveStatus(status)) {
      return `border-slate-200 bg-gradient-to-b from-blue-50 via-white to-white text-slate-900`;
    }
    if (status === "requires_payment") {
      return "border-yellow-200 bg-yellow-50 text-yellow-950";
    }
    return "border-slate-200 bg-white text-slate-900";
  };

  return (
    <Page title={isPaid ? "Order Confirmed" : "Order Status"}>
      {/* Use Container to match your theme widths */}
      <Container className="px-0">
        {/* Top actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/products" className="w-full sm:w-auto">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99] sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </button>
          </Link>

          <div className="text-xs font-semibold text-slate-500">
            {order?._id ? (
              <>
                Order ID: <span className="font-mono text-slate-700">{order._id}</span>
              </>
            ) : null}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <b>Error:</b> {error}
          </div>
        )}

        {!order ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Loading order…</p>
          </div>
        ) : (
          <>
            {/* Status banner */}
            <div className={`mt-6 rounded-3xl border p-5 shadow-sm ${badgeCls(order.status)}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                      isPositiveStatus(order.status)
                        ? `${ACCENT_BG} text-white`
                        : order.status === "requires_payment"
                        ? "bg-yellow-500 text-white"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {isPositiveStatus(order.status) ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : order.status === "requires_payment" ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-extrabold">
                      Status: <span className={`${ACCENT}`}>{statusLabel(order.status)}</span>
                    </div>

                    {order.status === "requires_payment" ? (
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        We’re waiting for payment confirmation. If you just paid, this may take a few seconds.
                        {polling && <span className="ml-2 font-extrabold">Checking…</span>}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Payment confirmed. Your order will move through processing and shipping next.
                      </p>
                    )}

                    <div className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-600">
                      <span>
                        <b>Order Number:</b> #{String(order.orderNumber ?? "").padStart(6, "0")}
                      </span>
                      <span>
                        <b>Order ID:</b> <span className="font-mono">{order._id}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                {order.status === "requires_payment" ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      onClick={() => navigate("/checkout")}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl ${ACCENT_BG} ${ACCENT_HOVER} px-4 py-2.5 text-sm font-extrabold text-white shadow-sm active:scale-[0.99]`}
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay now / Retry
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          setError("");
                          await loadOrder(); // manual refresh
                        } catch (e) {
                          setError(e?.response?.data?.message || e.message);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Main layout */}
            <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
              {/* LEFT: Items */}
              <div className="lg:col-span-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Order details</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        Your Golden Art Frames order items are listed below.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {order.items.map((item, idx) => {
                      const thumb = item.assets?.previewUrl || item.assets?.originalUrl || "";

                      return (
                        <div
                          key={idx}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt="preview"
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                                  No image
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="text-sm font-extrabold text-slate-900">
                                {item.productSlug?.toUpperCase() || "CUSTOM PRINT"}
                              </div>
                              <div className="mt-1 text-xs font-semibold text-slate-600">
                                {item.config?.size ? `Size: ${item.config.size} • ` : ""}
                                {item.config?.frame ? `Frame: ${item.config.frame} • ` : ""}
                                {item.config?.mat ? `Mat: ${item.config.mat} • ` : ""}
                                {item.config?.material ? `Material: ${item.config.material} • ` : ""}
                                Qty {item.config?.quantity || 1}
                              </div>
                            </div>
                          </div>

                          <div className="sm:ml-auto sm:text-right">
                            <div className="text-sm font-extrabold text-slate-900">
                              {item.price?.total} {item.price?.currency}
                            </div>
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              {item.variantSku ? `SKU: ${item.variantSku}` : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600">
                      Premium packaging • Doorstep delivery • Support available via Contact page
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT: Summary (sticky) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                <div className="rounded-3xl border border-slate-200 bg-linear-to-b from-blue-50 via-white to-white p-5 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-900">Summary</h3>

                  <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Subtotal</span>
                      <span className="font-extrabold text-slate-900">
                        {order.totals.subtotal} {order.totals.currency}
                      </span>
                    </div>

                    {"shipping" in order.totals && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Shipping</span>
                        <span className="font-extrabold text-slate-900">
                          {order.totals.shipping} {order.totals.currency}
                        </span>
                      </div>
                    )}

                    {"tax" in order.totals && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Tax</span>
                        <span className="font-extrabold text-slate-900">
                          {order.totals.tax} {order.totals.currency}
                        </span>
                      </div>
                    )}

                    {"discount" in order.totals && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Discount</span>
                        <span className="font-extrabold text-slate-900">
                          -{order.totals.discount} {order.totals.currency}
                        </span>
                      </div>
                    )}

                    {"grandTotal" in order.totals && (
                      <>
                        <div className="my-2 h-px bg-slate-200" />
                        <div className="flex items-center justify-between text-base">
                          <span className="font-extrabold text-slate-900">Total</span>
                          <span className="font-extrabold text-slate-900">
                            {order.totals.grandTotal} {order.totals.currency}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {order.status === "requires_payment" ? (
                    <p className="mt-3 text-xs font-semibold text-slate-600">
                      If you already paid, this page will update automatically when payment is confirmed.
                    </p>
                  ) : (
                    <p className="mt-3 text-xs font-semibold text-slate-600">
                      Thank you for shopping with <span className="font-extrabold">Golden Art Frames</span>.
                    </p>
                  )}

                  <div className="mt-4">
                    <Link to="/contact">
                      <button
                        type="button"
                        className={`w-full rounded-2xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-extrabold text-white shadow-sm active:scale-[0.99]`}
                      >
                        Need help? Contact us
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Container>
    </Page>
  );
}
