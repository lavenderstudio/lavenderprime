/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// client/src/pages/AdminOrdersPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modern Admin Dashboard — matches site theme.
// ALL existing logic is preserved exactly. Only the UI is redesigned.
// ─────────────────────────────────────────────────────────────────────────────

import api from "../lib/api.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

const ACCENT = "#FF633F";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function humanSlug(slug) {
  return (slug || "Custom Print")
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isWeddingFrameItem(item) {
  return item?.productSlug === "wedding-frame" || item?.productSlug === "wedding-print";
}

function statusUi(s) {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return { label: "Paid", bg: `${ACCENT}15`, border: `${ACCENT}50`, color: ACCENT };
  if (v === "completed" || v === "fulfilled") return { label: "Fulfilled", bg: "#f0fdf4", border: "#86efac", color: "#166534" };
  if (v === "shipped") return { label: "Shipped", bg: "#eff6ff", border: "#93c5fd", color: "#1e40af" };
  if (v === "processing") return { label: "Processing", bg: "#fefce8", border: "#fde047", color: "#713f12" };
  if (v === "cancelled" || v === "refunded") return { label: v.charAt(0).toUpperCase() + v.slice(1), bg: "#fff1f2", border: "#fecdd3", color: "#9f1239" };
  return { label: s || "Pending", bg: "#f8fafc", border: "#e2e8f0", color: "#475569" };
}

// ─── Nav pill button ──────────────────────────────────────────────────────────
function NavPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl px-4 py-2 text-sm font-extrabold transition-all duration-200"
      style={
        active
          ? { background: ACCENT, color: "#fff" }
          : { background: "#f1f5f9", color: "#475569" }
      }
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
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
  const [zipping, setZipping] = useState({});

  // ── Auth check ───────────────────────────────────────────────────────────
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

  // ── Role update ───────────────────────────────────────────────────────────
  const updateUserRole = async (userId, role) => {
    try {
      setError("");
      setLoading(true);
      const res = await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: res.data.user.role } : u));
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = async (status = activeStatus) => {
    try {
      setLoading(true);
      setActiveView("orders");
      const res = await api.get("/admin/orders", {
        params: { status, ...(fromDate && { from: fromDate }), ...(toDate && { to: toDate }) },
      });
      setOrders(res.data.orders || []);
      setActiveStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch users ───────────────────────────────────────────────────────────
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

  // ── Mark fulfilled ────────────────────────────────────────────────────────
  const markFulfilled = async (orderId) => {
    await api.patch(`/admin/orders/${orderId}/fulfill`);
    fetchOrders(activeStatus);
  };

  // ── Get item image URLs ───────────────────────────────────────────────────
  const getItemImageUrls = (it) => {
    const items = it?.assets?.items;
    if (Array.isArray(items) && items.length > 0)
      return items.map(x => x?.originalUrl || x?.previewUrl).filter(Boolean);
    const single = it?.assets?.originalUrl || it?.assets?.previewUrl;
    return single ? [single] : [];
  };

  // ── Preview in new tab ────────────────────────────────────────────────────
  const previewAllImages = (urls, title = "Preview") => {
    if (!urls?.length) return;
    const html = `<html><head><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;margin:0;padding:16px;background:#f8fafc}h1{font-size:16px;margin:0 0 12px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}.card{background:white;border:1px solid #e2e8f0;border-radius:14px;padding:10px}img{width:100%;height:220px;object-fit:cover;border-radius:12px;border:1px solid #e2e8f0}.meta{margin-top:8px;font-size:12px;color:#334155;word-break:break-all}</style></head><body><h1>${title} (${urls.length})</h1><div class="grid">${urls.map((u, i) => `<div class="card"><img src="${u}" alt="img-${i}"><div class="meta">Photo ${i + 1}</div></div>`).join("")}</div></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // ── Download ZIP ──────────────────────────────────────────────────────────
  const downloadOrderZip = async (order) => {
    const orderNum = String(order.orderNumber).padStart(6, "0");
    const zipName = `ORDER-${orderNum}.zip`;
    setZipping(prev => ({ ...prev, [order._id]: true }));
    try {
      const zip = new JSZip();
      const addr = [order.shippingAddress?.line1, order.shippingAddress?.line2, order.shippingAddress?.city, order.shippingAddress?.postcode, order.shippingAddress?.country].filter(Boolean).join(", ") || "—";
      let info = [`ORDER INFORMATION`, `=================`, ``, `Order Number : ${orderNum}`, `Order ID     : ${order._id}`, `Status       : ${order.status.toUpperCase()}`, `Date         : ${order.createdAt ? new Date(order.createdAt).toLocaleString("en-GB") : "—"}`, ``, `CUSTOMER`, `--------`, `Name         : ${order.customer?.fullName || "—"}`, `Email        : ${order.customer?.email || "—"}`, `Phone        : ${order.customer?.phone || "—"}`, ``, `SHIPPING ADDRESS`, `----------------`, addr, ``, `ORDER ITEMS`, `-----------`].join("\n");
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
      info += `\n\nPRICING\n-------\n  Subtotal : ${order.totals?.subtotal ?? "—"} ${order.totals?.currency ?? ""}`;
      if (order.totals?.shipping != null) info += `\n  Shipping : ${order.totals.shipping} ${order.totals.currency}`;
      if (order.totals?.tax != null)      info += `\n  Tax      : ${order.totals.tax} ${order.totals.currency}`;
      info += `\n  TOTAL    : ${order.totals?.grandTotal ?? "—"} ${order.totals?.currency ?? ""}\n`;
      zip.file("order-info.txt", info);
      for (let idx = 0; idx < order.items.length; idx++) {
        const it = order.items[idx];
        const urls = getItemImageUrls(it);
        if (!urls.length) continue;
        const folder = order.items.length > 1 ? `item-${String(idx + 1).padStart(2, "0")}-${it.productSlug}/` : ``;
        for (let i = 0; i < urls.length; i++) {
          try {
            const resp = await fetch(urls[i]);
            const blob = await resp.blob();
            const ext = blob.type === "image/png" ? "png" : "jpg";
            const filename = urls.length > 1 ? `${folder}photo-${String(i + 1).padStart(2, "0")}.${ext}` : `${folder}${it.productSlug}.${ext}`;
            zip.file(filename, blob);
          } catch { /* skip failed images silently */ }
        }
      }
      const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const blobUrl = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = zipName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("ZIP download failed", err);
    } finally {
      setZipping(prev => ({ ...prev, [order._id]: false }));
    }
  };

  // ── Auth loading screen ───────────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 55%, ${ACCENT}18 0%, transparent 70%)`,
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center"
        >
          <img
            src="/logo.png"
            alt="Golden Art Frames"
            className="h-14 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />

          {/* Spinner ring */}
          <div className="mt-8 relative h-10 w-10">
            {/* Track */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            {/* Rotating arc */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: ACCENT }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
          </div>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 text-xs font-bold uppercase tracking-widest text-white/30"
          >
            Checking Access...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">

      {/* ── Dark header ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 px-4 pb-0 pt-10">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-0">
            {/* Title */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Golden Art Frames
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-white">
                Admin Dashboard
              </h1>
              {me && (
                <p className="mt-1 text-xs text-white/40">
                  Logged in as <span className="font-bold text-white/60">{me.fullName || me.email}</span>
                  {" "}<span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase">{me.role}</span>
                </p>
              )}
            </div>

            {/* Manage pricing link */}
            <Link
              to="/admin/pricing"
              className="mb-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              Manage Pricing →
            </Link>
          </div>

          {/* ── Tab nav ──────────────────────────────────────────────── */}
          <div className="mt-6 flex gap-1 border-b border-white/10">
            {[
              { key: "paid",      label: "Paid Orders",      onClick: () => fetchOrders("paid") },
              { key: "completed", label: "Fulfilled Orders",  onClick: () => fetchOrders("completed") },
              { key: "users",     label: "Users",             onClick: fetchUsers },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={tab.onClick}
                className={`rounded-t-xl px-5 py-2.5 text-sm font-extrabold transition-all duration-200 ${
                  (activeView === "users" && tab.key === "users") ||
                  (activeView === "orders" && activeStatus === tab.key)
                    ? "border-x border-t border-white/10 bg-white text-slate-900"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">

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

        {/* ── Date filter bar (orders only) ─────────────────────────── */}
        {activeView === "orders" && (
          <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#FF633F]/60 focus:ring-2 focus:ring-[#FF633F]/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">To</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#FF633F]/60 focus:ring-2 focus:ring-[#FF633F]/10"
              />
            </div>
            <button
              onClick={() => fetchOrders(activeStatus)}
              className="rounded-xl px-5 py-2 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:brightness-110"
              style={{ background: ACCENT }}
            >
              Apply
            </button>
            <button
              onClick={() => { setFromDate(""); setToDate(""); fetchOrders(activeStatus); }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Reset
            </button>

            {loading && (
              <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF633F]" />
                Loading…
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            USERS VIEW
        ══════════════════════════════════════════════════════════════ */}
        {activeView === "users" && (
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div
              className="px-6 py-4"
              style={{ background: `linear-gradient(135deg, ${ACCENT}10 0%, transparent 70%)` }}
            >
              <h2 className="text-lg font-extrabold text-slate-900">All Users</h2>
              <p className="text-xs text-slate-400 mt-0.5">{users.length} account{users.length !== 1 ? "s" : ""}</p>
            </div>

            <div className="divide-y divide-slate-100">
              {users.length === 0 && !loading && (
                <p className="px-6 py-8 text-center text-sm text-slate-400">No users found.</p>
              )}
              {users.map((u, idx) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-extrabold text-slate-900">{u.fullName || "—"}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">Role</span>
                    {me?.role === "admin" ? (
                      <select
                        value={u.role}
                        onChange={e => updateUserRole(u._id, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-900 outline-none focus:border-[#FF633F]/60 focus:ring-2 focus:ring-[#FF633F]/10"
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
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            ORDERS VIEW
        ══════════════════════════════════════════════════════════════ */}
        {activeView === "orders" && (
          <div className="space-y-5">
            {orders.length === 0 && !loading && (
              <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
                <p className="text-sm text-slate-400">No orders found for this filter.</p>
              </div>
            )}

            {orders.map((o, oIdx) => {
              const orderNo = String(o.orderNumber).padStart(6, "0");
              const st = statusUi(o.status);
              const shippingAddr = [o.shippingAddress?.line1, o.shippingAddress?.line2, o.shippingAddress?.city, o.shippingAddress?.postcode, o.shippingAddress?.country].filter(Boolean).join(", ") || "—";

              return (
                <motion.div
                  key={o._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: oIdx * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
                >
                  {/* ── Order header card ─────────────────────────────────── */}
                  <div
                    className="flex flex-wrap items-start justify-between gap-4 px-6 py-5"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}08 0%, transparent 60%)` }}
                  >
                    {/* Left: customer + shipping */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900">
                          Order <span className="font-mono">#{orderNo}</span>
                        </span>
                        {/* Status pill */}
                        <span
                          className="rounded-full border px-3 py-0.5 text-xs font-extrabold"
                          style={{ background: st.bg, borderColor: st.border, color: st.color }}
                        >
                          {st.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(o.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Customer info */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
                        <span className="flex items-center gap-1">
                          <span className="text-slate-400">👤</span>
                          {o.customer?.fullName || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-slate-400">✉</span>
                          {o.customer?.email || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-slate-400">📞</span>
                          {o.customer?.phone || "—"}
                        </span>
                      </div>

                      {/* Shipping address */}
                      <p className="mt-1 text-xs text-slate-400">
                        <span className="font-bold text-slate-500">Ship to: </span>{shippingAddr}
                      </p>
                    </div>

                    {/* Right: total + actions */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p className="text-xl font-extrabold" style={{ color: ACCENT }}>
                        {o.totals?.grandTotal} {o.totals?.currency}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Link to={`/order/${o._id}`}>
                          <button
                            type="button"
                            className="rounded-2xl px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:brightness-110"
                            style={{ background: ACCENT }}
                          >
                            View Details
                          </button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => downloadOrderZip(o)}
                          disabled={!!zipping[o._id]}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {zipping[o._id] ? (
                            <span className="flex items-center gap-1.5">
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                              Zipping…
                            </span>
                          ) : "⬇ Download ZIP"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Items ─────────────────────────────────────────────── */}
                  <div className="space-y-3 border-t border-slate-100 p-5">
                    {o.items.map((it, idx) => {
                      const urls = getItemImageUrls(it);
                      const isMini = Array.isArray(it?.assets?.items) && it.assets.items.length > 0;
                      const stack = urls.slice(0, 4);

                      return (
                        <div
                          key={idx}
                          className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4
                                     sm:grid-cols-[auto,1fr,auto]"
                        >
                          {/* Thumbnail stack + preview button */}
                          <div className="flex flex-col items-start gap-2">
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
                                        style={{ transform: `translate(${i * 5}px, ${i * 5}px)`, zIndex: 10 - i }}
                                      />
                                    ))
                                  ) : (
                                    <img
                                      src={urls[0]}
                                      alt={it.productSlug}
                                      className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
                                    />
                                  )}
                                  {isMini && urls.length > 4 && (
                                    <div className="absolute -bottom-2 -right-2 z-20 rounded-full border border-white bg-slate-900 px-2 py-0.5 text-[10px] font-extrabold text-white shadow">
                                      +{urls.length - 4}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-400">
                                  No Img
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => previewAllImages(urls, `Order #${orderNo} — ${it.productSlug}`)}
                              disabled={!urls.length}
                              className="rounded-xl mt-3 px-3 py-1 text-[11px] font-extrabold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ background: urls.length ? ACCENT : "#94a3b8" }}
                            >
                              Preview{isMini ? ` (${urls.length})` : ""}
                            </button>
                          </div>

                          {/* Details */}
                          <div className="text-sm">
                            <p className="font-extrabold text-slate-900">{humanSlug(it.productSlug)}</p>
                            <div className="mt-2 space-y-1 text-xs text-slate-600">
                              <div><span className="font-bold text-slate-700">SKU:</span> {it.variantSku}</div>
                              {it.config?.size     && <div><span className="font-bold text-slate-700">Size:</span> {it.config.size}</div>}
                              {it.config?.frame    && <div><span className="font-bold text-slate-700">Frame:</span> {it.config.frame}</div>}
                              {it.config?.mat      && <div><span className="font-bold text-slate-700">Mat:</span> {it.config.mat}</div>}
                              {it.config?.material && <div><span className="font-bold text-slate-700">Material:</span> {it.config.material}</div>}
                              {isWeddingFrameItem(it) && it.personalization?.groomName && it.personalization?.brideName && (
                                <div><span className="font-bold text-slate-700">Names:</span> {it.personalization.groomName} & {it.personalization.brideName}</div>
                              )}
                              {isWeddingFrameItem(it) && it.personalization?.location && (
                                <div><span className="font-bold text-slate-700">Location:</span> {it.personalization.location}</div>
                              )}
                              {isWeddingFrameItem(it) && it.personalization?.weddingDate && (
                                <div><span className="font-bold text-slate-700">Date:</span> {it.personalization.weddingDate}</div>
                              )}
                              {isWeddingFrameItem(it) && it.personalization?.message && (
                                <div><span className="font-bold text-slate-700">Message:</span> {it.personalization.message}</div>
                              )}
                              <div><span className="font-bold text-slate-700">Qty:</span> {it.config?.quantity || 1}</div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right font-extrabold" style={{ color: ACCENT }}>
                            {it.price?.total} {it.price?.currency}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Mark fulfilled ─────────────────────────────────────── */}
                  {o.status === "paid" && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => markFulfilled(o._id)}
                        className="w-full rounded-2xl py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-300 hover:brightness-110"
                        style={{ background: "#16a34a" }}
                      >
                        ✓ Mark as Fulfilled
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
