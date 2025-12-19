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

export default function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(false);

  // ✅ Poll settings (MVP)
  const POLL_EVERY_MS = 2000; // 2 seconds
  const POLL_MAX_MS = 30000;  // 30 seconds

  const pollTimerRef = useRef(null);
  const pollStartRef = useRef(0);

  const isPaid = useMemo(() => order?.status === "paid" || order?.status === "processing" || order?.status === "shipped" || order?.status === "completed", [order]);

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

  return (
    <Page title={isPaid ? "Order Confirmed" : "Order Status"}>
      <Link to="/products" className="text-sm text-blue-600 hover:underline">
        <button type="button" className="mt-4 inline-block rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99]">&#8592;
          Back to Products
        </button>
      </Link>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
          <b>Error:</b> {error}
        </div>
      )}

      {!order ? (
        <p className="mt-6 text-gray-600">Loading order…</p>
      ) : (
        <>
          {/* Status banner */}
          <div
            className={`mt-6 rounded-2xl border p-4 ${
              order.status === "requires_payment"
                ? "border-yellow-200 bg-yellow-50 text-yellow-900"
                : "border-green-200 bg-green-50 text-green-900"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">
                  Status: {statusLabel(order.status)}
                </div>

                {order.status === "requires_payment" ? (
                  <p className="mt-1 text-sm">
                    We’re waiting for payment confirmation. If you just paid, this may take a few seconds.
                    {polling && <span className="ml-2 font-semibold">Checking…</span>}
                  </p>
                ) : (
                  <p className="mt-1 text-sm">
                    Payment confirmed. Your order will move through processing and shipping next.
                  </p>
                )}
              </div>

              {/* CTA buttons */}
              {order.status === "requires_payment" ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => navigate("/checkout")}
                    className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black active:scale-[0.99]"
                  >
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
                    className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:scale-[0.99]"
                  >
                    Refresh
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col mt-2 text-xs opacity-80">
              <span><b>Order ID:</b> {order._id}</span>
              <span><b>Order Number:</b> #{String(order.orderNumber ?? "").padStart(6, "0")}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr,1fr]">
            {/* LEFT: Items */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Order details</h3>

              <h4 className="mt-4 font-semibold text-gray-900">Items</h4>
              <div className="mt-3 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img
                      src={item.assets?.previewUrl || item.assets?.originalUrl}
                      alt="preview"
                      className="h-12 w-12 rounded-xl border border-gray-200 object-cover"
                    />
                    <div className="flex-1 text-sm text-gray-800">
                      <div className="font-semibold">{item.productSlug?.toUpperCase() || "Custom Print"}</div>
                      <div className="text-xs text-gray-600">
                        {item.config?.size ? `Size: ${item.config.size} • ` : ""}
                        {item.config?.frame ? `Frame: ${item.config.frame} • ` : ""}
                        {item.config?.mat ? `Mat: ${item.config.mat} • ` : ""}
                        {item.config?.material ? `Material: ${item.config.material} • ` : ""}
                        Qty {item.config?.quantity || 1}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {item.price?.total} {item.price?.currency}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Summary */}
            <div className="h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Summary</h3>

              <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {order.totals.subtotal} {order.totals.currency}
                  </span>
                </div>

                {/* ✅ If you added shipping/tax/grandTotal in schema, show them when present */}
                {"shipping" in order.totals && (
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {order.totals.shipping} {order.totals.currency}
                    </span>
                  </div>
                )}

                {"tax" in order.totals && (
                  <div className="flex items-center justify-between">
                    <span>Tax</span>
                    <span className="font-semibold">
                      {order.totals.tax} {order.totals.currency}
                    </span>
                  </div>
                )}

                {"discount" in order.totals && (
                  <div className="flex items-center justify-between">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -{order.totals.discount} {order.totals.currency}
                    </span>
                  </div>
                )}

                {"grandTotal" in order.totals && (
                  <div className="flex items-center justify-between border-t pt-2">
                    <span>Total</span>
                    <span className="font-semibold">
                      {order.totals.grandTotal} {order.totals.currency}
                    </span>
                  </div>
                )}
              </div>

              {order.status === "requires_payment" && (
                <p className="mt-3 text-xs text-gray-600">
                  If you already paid, this page will update automatically when payment is confirmed.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
