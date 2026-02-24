/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// client/src/pages/AdminOrdersPage.jsx

import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import JSZip from "jszip";

// 🎨 Theme tokens
import { ACCENT, ACCENT_BG, ACCENT_HOVER, Container } from "../components/home/ui.jsx";

export default function AdminOrdersPage() {
  const navigate = useNavigate();

  // ── All state declared at the top (Rules of Hooks) ──────────────────────────
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
  const [zipping, setZipping] = useState({}); // tracks per-order ZIP progress

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

      const res = await api.patch(`/admin/users/${userId}/role`, { role });

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

  // ── Get all image URLs for an item (supports single + mini-frames) ──────────
  const getItemImageUrls = (it) => {
    const items = it?.assets?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.map((x) => x?.originalUrl || x?.previewUrl).filter(Boolean);
    }
    const single = it?.assets?.originalUrl || it?.assets?.previewUrl;
    return single ? [single] : [];
  };

  // ── Preview all images in a new tab ─────────────────────────────────────────
  const previewAllImages = (urls, title = "Preview") => {
    if (!urls?.length) return;
    const html = `<html><head><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;margin:0;padding:16px;background:#f8fafc}h1{font-size:16px;margin:0 0 12px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}.card{background:white;border:1px solid #e2e8f0;border-radius:14px;padding:10px}img{width:100%;height:220px;object-fit:cover;border-radius:12px;border:1px solid #e2e8f0}.meta{margin-top:8px;font-size:12px;color:#334155;word-break:break-all}</style></head><body><h1>${title} (${urls.length})</h1><div class="grid">${urls.map((u, i) => `<div class="card"><img src="${u}" alt="img-${i}"><div class="meta">Photo ${i + 1}</div></div>`).join("")}</div></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // ── Build and download a ZIP for the entire order ────────────────────────────
  const downloadOrderZip = async (order) => {
    const orderNum = String(order.orderNumber).padStart(6, "0");
    const zipName = `ORDER-${orderNum}.zip`;

    setZipping((prev) => ({ ...prev, [order._id]: true }));
    try {
      const zip = new JSZip();

      // 1. Build order-info.txt
      const addr = [
        order.shippingAddress?.line1,
        order.shippingAddress?.line2,
        order.shippingAddress?.city,
        order.shippingAddress?.postcode,
        order.shippingAddress?.country,
      ].filter(Boolean).join(", ") || "—";

      let info = [
        `ORDER INFORMATION`,
        `=================`,
        ``,
        `Order Number : ${orderNum}`,
        `Order ID     : ${order._id}`,
        `Status       : ${order.status.toUpperCase()}`,
        `Date         : ${order.createdAt ? new Date(order.createdAt).toLocaleString("en-GB") : "—"}`,
        ``,
        `CUSTOMER`,
        `--------`,
        `Name         : ${order.customer?.fullName || "—"}`,
        `Email        : ${order.customer?.email || "—"}`,
        `Phone        : ${order.customer?.phone || "—"}`,
        ``,
        `SHIPPING ADDRESS`,
        `----------------`,
        addr,
        ``,
        `ORDER ITEMS`,
        `-----------`,
      ].join("\n");

      order.items.forEach((it, idx) => {
        const itemNum = String(idx + 1).padStart(2, "0");
        info += `\n\nItem ${itemNum}: ${it.productSlug.toUpperCase()}`;
        info += `\n  SKU      : ${it.variantSku}`;
        if (it.config?.size)      info += `\n  Size     : ${it.config.size}`;
        if (it.config?.frame)     info += `\n  Frame    : ${it.config.frame}`;
        if (it.config?.mat)       info += `\n  Mat      : ${it.config.mat}`;
        if (it.config?.material)  info += `\n  Material : ${it.config.material}`;
        info += `\n  Qty      : ${it.config?.quantity || 1}`;
        if (it.personalization?.groomName)   info += `\n  Groom    : ${it.personalization.groomName}`;
        if (it.personalization?.brideName)   info += `\n  Bride    : ${it.personalization.brideName}`;
        if (it.personalization?.weddingDate) info += `\n  Wed Date : ${it.personalization.weddingDate}`;
        if (it.personalization?.location)    info += `\n  Location : ${it.personalization.location}`;
        if (it.personalization?.message)     info += `\n  Message  : ${it.personalization.message}`;
        info += `\n  Price    : ${it.price?.total ?? "—"} ${it.price?.currency ?? ""}`;
      });

      info += `\n\nPRICING`;
      info += `\n-------`;
      info += `\n  Subtotal : ${order.totals?.subtotal ?? "—"} ${order.totals?.currency ?? ""}`;
      if (order.totals?.shipping != null) info += `\n  Shipping : ${order.totals.shipping} ${order.totals.currency}`;
      if (order.totals?.tax != null)      info += `\n  Tax      : ${order.totals.tax} ${order.totals.currency}`;
      info += `\n  TOTAL    : ${order.totals?.grandTotal ?? "—"} ${order.totals?.currency ?? ""}`;
      info += `\n`;

      zip.file("order-info.txt", info);

      // 2. Fetch and add images
      for (let idx = 0; idx < order.items.length; idx++) {
        const it = order.items[idx];
        const urls = getItemImageUrls(it);
        if (!urls.length) continue;

        const folder = order.items.length > 1
          ? `item-${String(idx + 1).padStart(2, "0")}-${it.productSlug}/`
          : ``;

        for (let i = 0; i < urls.length; i++) {
          try {
            const resp = await fetch(urls[i]);
            const blob = await resp.blob();
            const ext = blob.type === "image/png" ? "png" : "jpg";
            const filename = urls.length > 1
              ? `${folder}photo-${String(i + 1).padStart(2, "0")}.${ext}`
              : `${folder}${it.productSlug}.${ext}`;
            zip.file(filename, blob);
          } catch {
            // skip failed images silently
          }
        }
      }

      // 3. Generate and trigger download
      const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const blobUrl = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("ZIP download failed", err);
    } finally {
      setZipping((prev) => ({ ...prev, [order._id]: false }));
    }
  };

  function isWeddingFrameItem(item) {
    return item?.productSlug === "wedding-frame";
  }

  // ── Early return AFTER all hooks ─────────────────────────────────────────────
  if (checkingAuth) {
    return <Page title="Admin"><p>Checking access…</p></Page>;
  }

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
            <Link
              to="/admin/pricing"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-50 transition"
            >
              Manage Pricing
            </Link>
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
                <div>
                  <div className="font-extrabold text-slate-900">{u.fullName || "—"}</div>
                  <div className="text-xs text-slate-600">{u.email}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">Role</span>

                  {me?.role === "admin" ? (
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u._id, e.target.value)}
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
                      ].filter(Boolean).join(", ") || "—"}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-center gap-2">
                    <Link to={`/order/${o._id}`} className="inline-flex">
                      <button
                        type="button"
                        className={`rounded-2xl px-4 py-2 text-xs font-extrabold text-white shadow-sm ${ACCENT_BG} ${ACCENT_HOVER} active:scale-[0.99]`}
                      >
                        View details
                      </button>
                    </Link>

                    {/* ⬇ Download all images + info as a ZIP */}
                    <button
                      type="button"
                      onClick={() => downloadOrderZip(o)}
                      disabled={!!zipping[o._id]}
                      className="rounded-2xl px-4 py-2 text-xs font-extrabold shadow-sm border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {zipping[o._id] ? "Zipping…" : "⬇ Download ZIP"}
                    </button>

                    <div className="font-extrabold text-slate-900">
                      {o.totals?.grandTotal} {o.totals?.currency}
                    </div>
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-extrabold ${
                      o.status === "paid" ? "bg-[#FF633F]/10 text-[#FF633F]" : "bg-emerald-100 text-emerald-800"
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
                      {/* IMAGE + PREVIEW */}
                      {(() => {
                        const urls = getItemImageUrls(it);
                        const isMini = Array.isArray(it?.assets?.items) && it.assets.items.length > 0;
                        const stack = urls.slice(0, 4);
                        const first = urls[0];

                        return (
                          <div className="flex gap-2">
                            {/* Thumbnails */}
                            <div className="relative h-24 w-24 shrink-0">
                              {urls.length ? (
                                <>
                                  {isMini ? (
                                    stack.map((u, i) => (
                                      <img
                                        key={u + i}
                                        src={u}
                                        alt={`${it.productSlug}-img-${i}`}
                                        className="absolute h-24 w-24 rounded-xl border border-slate-200 object-cover shadow-sm"
                                        style={{ transform: `translate(${i * 6}px, ${i * 6}px)`, zIndex: 10 - i }}
                                      />
                                    ))
                                  ) : (
                                    <img
                                      src={first}
                                      alt={it.productSlug}
                                      className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
                                    />
                                  )}
                                  {isMini && urls.length > 4 && (
                                    <div className="absolute -bottom-2 -right-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-slate-700 shadow">
                                      +{urls.length - 4}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500">
                                  No image
                                </div>
                              )}
                            </div>

                            {/* Preview button */}
                            <div className="flex flex-col items-end justify-center gap-1 w-full">
                              <button
                                type="button"
                                onClick={() => previewAllImages(urls, `Order #${String(o.orderNumber).padStart(6, "0")} — ${it.productSlug}`)}
                                disabled={!urls.length}
                                className={`w-50 text-center rounded-lg px-2 py-1 text-xs font-extrabold ${
                                  !urls.length
                                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                    : `${ACCENT_BG} ${ACCENT_HOVER} text-white`
                                }`}
                              >
                                Preview{isMini ? ` (${urls.length})` : ""}
                              </button>
                            </div>
                          </div>
                        );
                      })()}

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
                          {isWeddingFrameItem(it) && it.personalization?.groomName && it.personalization?.brideName
                            ? <div>Names: {it.personalization.groomName} & {it.personalization.brideName}</div>
                            : null}
                          {isWeddingFrameItem(it) && it.personalization?.location
                            ? <div>Location: {it.personalization.location}</div>
                            : null}
                          {isWeddingFrameItem(it) && it.personalization?.weddingDate
                            ? <div>Date: {it.personalization.weddingDate}</div>
                            : null}
                          {isWeddingFrameItem(it) && it.personalization?.message
                            ? <div>Message: {it.personalization.message}</div>
                            : null}
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
