/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// client/src/pages/AdminOrdersPage.jsx

import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// 🎨 Theme tokens
import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

export default function AdminOrdersPage() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeView, setActiveView] = useState("orders");
  const [activeStatus, setActiveStatus] = useState("paid");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get("/auth/me");
        const user = res.data?.user;

        if (!user || !["admin", "manager"].includes(user.role)) {
          setError("Forbidden");
          setCheckingAuth(false);
          return;
        }

        setMe(user);
        setCheckingAuth(false);
        fetchOrders("paid");
      } catch {
        navigate("/login", { replace: true });
      }
    };
    check();
  }, []);

  const updateUserRole = async (userId, role) => {
    try {
      setError("");
      setLoading(true);

      // ✅ must use backticks so userId is inserted
      const res = await api.patch(`/admin/users/${userId}/role`, { role });

      // ✅ update locally without refetch
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role: res.data.user.role } : u
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (status = activeStatus) => {
    try {
      setLoading(true);
      setActiveView("orders");

      const res = await api.get("/admin/orders", {
        params: {
          status,
          ...(fromDate && { from: fromDate }),
          ...(toDate && { to: toDate }),
        },
      });

      setOrders(res.data.orders || []);
      setActiveStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setActiveView("users");

      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markFulfilled = async (orderId) => {
    await api.patch(`/admin/orders/${orderId}/fulfill`);
    fetchOrders(activeStatus);
  };

  if (checkingAuth) {
    return <Page title="Admin"><p>Checking access…</p></Page>;
  }

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


  return (
    <Page title="Admin Dashboard">
      <Container>

        {/* Header / Filters */}
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr,auto] items-end">
          <div className="flex flex-wrap gap-3">
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />

            <button
              onClick={() => fetchOrders(activeStatus)}
              className={`rounded-xl px-4 py-2 text-sm font-extrabold ${ACCENT_BG} ${ACCENT_HOVER} text-white`}
            >
              Apply
            </button>

            <button
              onClick={() => { setFromDate(""); setToDate(""); fetchOrders(activeStatus); }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrders("paid")}
              className={`rounded-xl px-4 py-2 text-sm font-extrabold ${activeStatus === "paid" ? ACCENT_BG + " text-white" : "bg-slate-100"}`}
            >
              Paid
            </button>
            <button
              onClick={() => fetchOrders("completed")}
              className={`rounded-xl px-4 py-2 text-sm font-extrabold ${activeStatus === "completed" ? ACCENT_BG + " text-white" : "bg-slate-100"}`}
            >
              Fulfilled
            </button>
            <button
              onClick={fetchUsers}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
            >
              Users
            </button>
          </div>
        </div>

        {/* USERS VIEW */}
        {activeView === "users" && (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* User info */}
                <div>
                  <div className="font-extrabold text-slate-900">
                    {u.fullName || "—"}
                  </div>
                  <div className="text-xs text-slate-600">{u.email}</div>
                </div>

                {/* Role control */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">
                    Role
                  </span>

                  {me?.role === "admin" ? (
                    <select
                      value={u.role}
                      onChange={(e) =>
                        updateUserRole(u._id, e.target.value)
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-900"
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                      {u.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ORDERS VIEW */}
        {activeView === "orders" && (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-extrabold text-slate-900">
                      Order #{String(o.orderNumber).padStart(6, "0")}
                    </div>
                    <div className="text-xs text-slate-600">
                      {o.customer?.fullName} • {o.customer?.email} • {o.customer?.phone}
                    </div>
                    <div className="text-xs text-slate-600">
                      <b className="text-slate-700">Shipping:</b>{" "}
                      {[
                        o.shippingAddress?.line2,
                        o.shippingAddress?.line1,
                        o.shippingAddress?.city,
                        o.shippingAddress?.postcode,
                        o.shippingAddress?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-center gap-2">
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
                    <div className="font-extrabold text-slate-900">
                      {o.totals?.grandTotal} {o.totals?.currency}
                    </div>
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-extrabold ${
                      o.status === "paid" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {o.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 space-y-4 border-t pt-4">
                  {o.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[96px,1fr,auto]"
                    >
                      {/* IMAGE + ACTIONS */}
                      <div className="flex gap-2">
                        <img
                          src={it.assets?.originalUrl}
                          alt={it.productSlug}
                          className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
                        />

                        {/* Actions */}
                        <div className="flex flex-col items-end justify-center gap-1 w-full">
                          {/* Preview */}
                          <a
                            href={it.assets?.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`w-50 text-center rounded-lg px-2 py-1 text-xs font-extrabold ${ACCENT_BG} ${ACCENT_HOVER} text-white`}
                          >
                            Preview
                          </a>

                          {/* Download */}
                          <button
                            onClick={() =>
                              downloadImage(
                                it.assets?.originalUrl,
                                `${o.orderNumber}-${it.productSlug}.jpg`
                              )
                            }
                            className="w-50 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-extrabold text-slate-900 hover:bg-slate-100"
                          >
                            Download
                          </button>
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="text-sm text-slate-800">
                        <div className="font-extrabold text-slate-900">
                          {it.productSlug.toUpperCase()}
                        </div>

                        <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                          <div><b>SKU:</b> {it.variantSku}</div>
                          {it.config?.size && <div><b>Size:</b> {it.config.size}</div>}
                          {it.config?.frame && <div><b>Frame:</b> {it.config.frame}</div>}
                          {it.config?.mat && <div><b>Mat:</b> {it.config.mat}</div>}
                          {it.config?.material && <div><b>Material:</b> {it.config.material}</div>}
                          <div><b>Qty:</b> {it.config?.quantity || 1}</div>
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="text-right text-sm font-extrabold text-slate-900">
                        {it.price?.total} {it.price?.currency}
                      </div>
                    </div>
                  ))}
                </div>


                {o.status === "paid" && (
                  <button
                    onClick={() => markFulfilled(o._id)}
                    className={`mt-4 w-full rounded-xl px-4 py-2 font-extrabold ${ACCENT_BG} ${ACCENT_HOVER} text-white`}
                  >
                    Mark as Fulfilled
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </Container>
    </Page>
  );
}
