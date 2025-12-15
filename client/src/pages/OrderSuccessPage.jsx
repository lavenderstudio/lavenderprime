// client/src/pages/OrderSuccessPage.jsx
// ----------------------------------------------------
// Order confirmation page (MVP)
// Fetches order by ID and displays details.
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api.js";
import Page from "../components/Page.jsx";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, [id]);

  return (
    <Page title="Order Confirmed">
      <Link to="/print/portrait" className="text-sm text-blue-600 hover:underline">
        ← Back to shop
      </Link>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
          <b>Error:</b> {error}
        </div>
      )}

      {!order ? (
        <p className="mt-6 text-gray-600">Loading order…</p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr,1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Order details</h3>
            <p className="mt-2 text-sm text-gray-800">
              <b>Order ID:</b> {order._id}
            </p>
            <p className="text-sm text-gray-800">
              <b>Status:</b> {order.status}
            </p>

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
                    <div className="font-semibold">{item.config?.size}</div>
                    <div className="text-xs text-gray-600">
                      {item.config?.mount} • Qty {item.config?.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {item.price?.total} {item.price?.currency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
            <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-800">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {order.totals.subtotal} {order.totals.currency}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-600">
              MVP note: payment integration (Stripe) comes next.
            </p>
          </div>
        </div>
      )}
    </Page>
  );
}
