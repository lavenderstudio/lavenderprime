// client/src/pages/UserOrdersPage.jsx
// ----------------------------------------------------
// User Orders page
// - Loads orders for the logged in user
// - Shows order number, date, status, total, and items
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

// ✅ Theme tokens
import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

function statusUi(statusRaw) {
  const s = String(statusRaw || "").toLowerCase();

  // Keep your backend status values, just render nicer UI
  if (s === "paid" || s === "processing" || s === "shipped" || s === "completed") {
    return {
      label: s.toUpperCase(),
      wrap: "border-emerald-200 bg-emerald-50 text-emerald-900",
      dot: "bg-emerald-500",
    };
  }

  if (s === "requires_payment" || s === "payment_required") {
    return {
      label: "PAYMENT REQUIRED",
      wrap: "border-amber-200 bg-amber-50 text-amber-900",
      dot: "bg-amber-500",
    };
  }

  if (s === "cancelled" || s === "refunded") {
    return {
      label: s.toUpperCase(),
      wrap: "border-rose-200 bg-rose-50 text-rose-900",
      dot: "bg-rose-500",
    };
  }

  return {
    label: (statusRaw || "PENDING").toString().toUpperCase(),
    wrap: "border-slate-200 bg-slate-50 text-slate-800",
    dot: "bg-slate-500",
  };
}

export default function UserOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);

        // ✅ backend returns only the logged-in user's orders
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        // If not logged in, redirect to login
        if (err?.response?.status === 401) {
          navigate("/login", { state: { from: "/orders" }, replace: true });
          return;
        }
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  return (
    <Page title="My Orders">
      <Container className="px-0">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <b>Error:</b> {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">No orders yet</h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  When you place an order, it will appear here with status and details.
                </p>
              </div>

              <span className="hidden sm:inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700">
                Account
              </span>
            </div>

            <Link
              to="/"
              className={`mt-5 inline-flex w-full sm:w-auto items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-sm ${ACCENT_BG} ${ACCENT_HOVER} active:scale-[0.99]`}
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const status = statusUi(o.status);
              const orderNo = String(o.orderNumber ?? "").padStart(6, "0");
              const total = o.totals?.grandTotal ?? o.totals?.subtotal;
              const currency = o.totals?.currency;

              return (
                <div
                  key={o._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-extrabold text-slate-900">
                          Order <span className="font-mono">#{orderNo}</span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold ${status.wrap}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-1 text-xs font-semibold text-slate-600">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Total + CTA */}
                    <div className="sm:text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        {total} {currency}
                      </div>

                      <div className="mt-2 flex gap-2 sm:justify-end">
                        <Link
                          to={`/order/${o._id}`}
                          className="inline-flex"
                        >
                          <button
                            type="button"
                            className={`rounded-2xl px-4 py-2 text-xs font-extrabold text-white shadow-sm ${ACCENT_BG} ${ACCENT_HOVER} active:scale-[0.99]`}
                          >
                            View details
                          </button>
                        </Link>

                        <Link to="/products" className="inline-flex">
                          <button
                            type="button"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
                          >
                            Shop more
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold text-slate-900">Items</div>
                      <div className="text-xs font-semibold text-slate-600">
                        {(o.items || []).length} item(s)
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {(o.items || []).slice(0, 4).map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <img
                            src={it.assets?.previewUrl || it.assets?.originalUrl || ""}
                            alt={it.productSlug}
                            className="h-12 w-12 rounded-2xl border border-slate-200 object-cover bg-white"
                            loading="lazy"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-extrabold text-slate-900 truncate">
                              {it.productSlug?.toUpperCase()}
                            </div>
                            <div className="mt-0.5 text-xs font-semibold text-slate-600 truncate">
                              {it.config?.size ? `Size: ${it.config.size} • ` : ""}
                              {it.config?.frame ? `Frame: ${it.config.frame} • ` : ""}
                              {it.config?.mat ? `Mat: ${it.config.mat} • ` : ""}
                              {it.config?.material ? `Material: ${it.config.material} • ` : ""}
                              Qty: {it.config?.quantity || 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(o.items || []).length > 4 && (
                      <div className="mt-3 text-xs font-semibold text-slate-600">
                        +{(o.items || []).length - 4} more item(s)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </Page>
  );
}
