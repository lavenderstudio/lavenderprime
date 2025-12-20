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
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          <b>Error:</b> {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-gray-700">You have no orders yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o._id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Order{" "}
                    <span className="font-mono">
                      #{String(o.orderNumber ?? "").padStart(6, "0")}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(o.createdAt).toLocaleString()} • Status:{" "}
                    <span className="font-semibold">{o.status?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {(o.totals?.grandTotal ?? o.totals?.subtotal)}{" "}
                    {o.totals?.currency}
                  </div>
                  <Link
                    to={`/order/${o._id}`}
                    className="mt-2 inline-block rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                  >
                    View details
                  </Link>
                </div>
              </div>

              {/* Items preview */}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(o.items || []).slice(0, 4).map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img
                      src={it.assets?.previewUrl || it.assets?.originalUrl || ""}
                      alt={it.productSlug}
                      className="h-12 w-12 rounded-xl border border-gray-200 object-cover"
                    />
                    <div className="text-sm text-gray-800">
                      <div className="font-semibold">{it.productSlug?.toUpperCase()}</div>
                      <div className="text-xs text-gray-600">
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
                <div className="mt-2 text-xs text-gray-500">
                  +{(o.items || []).length - 4} more item(s)
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
