// client/src/pages/AdminOrdersPage.jsx
// ----------------------------------------------------
// Owner-only Admin Orders page (MVP)
// - Shows a token input on every visit
// - Sends token to backend via header x-admin-token
// - Backend validates against process.env.ADMIN_TOKEN
// ----------------------------------------------------

import { useState } from "react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

export default function AdminOrdersPage() {
  const [token, setToken] = useState("");        // user enters token each visit
  const [authed, setAuthed] = useState(false);   // set true only after successful request
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(""); // "YYYY-MM-DD"
  const [toDate, setToDate] = useState("");     // "YYYY-MM-DD"
  const [activeStatus, setActiveStatus] = useState("paid"); // "paid" | "completed"


  const fetchOrders = async (status = activeStatus) => {
    try {
      setError("");
      setLoading(true);

      const res = await api.get("/admin/orders", {
        params: {
          status,
          ...(fromDate ? { from: fromDate } : {}),
          ...(toDate ? { to: toDate } : {}),
        },
        headers: { "x-admin-token": token },
      });

      setOrders(res.data.orders || []);
      setAuthed(true);
      setActiveStatus(status); // ✅ remember current tab
    } catch (err) {
      setAuthed(false);
      setOrders([]);
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchPaidOrders = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.get("/admin/orders?status=paid", {
        headers: {
          "x-admin-token": token, // ✅ send user-entered token
        },
      });

      setOrders(res.data.orders || []);
      setAuthed(true); // ✅ token worked
    } catch (err) {
      setAuthed(false);
      setOrders([]);
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // If not authed yet, show login-style prompt
  if (!authed) {
    return (
      <Page title="Admin — Login">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Owner access</h3>
          <p className="mt-1 text-sm text-gray-600">
            Enter your admin token to view paid orders.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              <b>Error:</b> {error}
            </div>
          )}

          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            className="mt-4 w-full rounded-xl border border-gray-300 p-3 text-sm"
          />

          <button
            onClick={fetchPaidOrders}
            disabled={!token || loading}
            className="mt-4 w-full rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
          >
            {loading ? "Checking..." : "Enter admin"}
          </button>

        </div>
      </Page>
    );
  }

	const markFulfilled = async (orderId) => {
		try {
			setError("");

			await api.patch(
				`/admin/orders/${orderId}/fulfill`,
				{},
				{
					headers: {
						"x-admin-token": token,
					},
				}
			);

			// ✅ Refresh orders after update
			fetchPaidOrders(activeStatus);
		} catch (err) {
			setError(err?.response?.data?.message || err.message);
		}
	};

    const downloadImage = async (url, filename = "image.jpg") => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Image download failed", err);
    }
  };

  // Authed view
  return (
    <Page title="Admin — Paid Orders">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => fetchOrders(activeStatus)}
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Apply"}
          </button>

          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
              fetchOrders(activeStatus);
            }}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 active:scale-[0.99]"
          >
            Clear dates
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => fetchOrders("paid")}
            className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Paid Orders
          </button>

          <button
            onClick={() => fetchOrders("completed")}
            className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Fulfilled Orders
          </button>

          <button
            onClick={() => {
              setAuthed(false);
              setToken("");
              setOrders([]);
              setError("");
              setFromDate("");
              setToDate("");
            }}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>


      {orders.length === 0 ? (
        <p className="text-gray-600">No paid orders found.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Order: <span className="font-mono">{o._id}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(o.createdAt).toLocaleString()} • {o.customer?.fullName} • {o.customer?.email} • {o.customer?.phone}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {(o.totals?.grandTotal ?? o.totals?.subtotal)} {o.totals?.currency}
                  </div>
                  <div className="text-xs font-semibold text-green-700">{o.status.toUpperCase()}</div>
									{/* { o.status === "paid" && (
										<button
											onClick={() => updateStatus(o._id, "processing")}
											className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
										>
											Mark as Processing
										</button>
									)} */}
									{ o.status === "paid" && (
										<button
											onClick={() => markFulfilled(o._id)}
											className="mt-3 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98]"
										>
											Mark as Fulfilled
										</button>
									)}
									{ o.status === "completed" && (
										<div className="mt-3 inline-block rounded-xl bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
											Fulfilled ✓
										</div>
									)}
                </div>
              </div>

              <div className="mt-3 border-t pt-3 text-sm text-gray-800">
                <b>Shipping:</b> {o.shippingAddress?.line1}, {o.shippingAddress?.line2}, {o.shippingAddress?.city},{" "}
                {o.shippingAddress?.postcode}, {o.shippingAddress?.country}
              </div>

              <div className="mt-3 space-y-2">
                {(o.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex flex-col gap-2 items-center">
                      <img src={it.assets.originalUrl} alt={it.productSlug} className="mr-3 h-16 w-16 rounded-lg object-cover border border-gray-200" />
                      <a href={it.assets.originalUrl} className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 active:scale-[0.98]" target="_blank">
                        View Image
                      </a>
                      <button
                        onClick={() =>
                          downloadImage(
                            it.assets.originalUrl,
                            `${o._id}-${it.productSlug}.jpg`
                          )
                        }
                        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 active:scale-[0.98]"
                      >
                        Download Image
                      </button>
                    </div>
                    <div className="text-gray-800">
                      <b>{it.productSlug.toUpperCase()}</b> • {it.variantSku} 
                      {it.config?.size ? ` • Size: ${it.config.size}` : ""}
                      {it.config?.frame ? ` • Frame: ${it.config.frame}` : ""}
                      {it.config?.mat ? ` • Mat: ${it.config.mat} ` : ""}
											{it.config?.material ? ` • Material: ${it.config.material} ` : ""}
                      • Qty {it.config?.quantity || 1}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {it.price?.total} {it.price?.currency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
