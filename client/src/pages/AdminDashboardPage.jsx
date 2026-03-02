/* eslint-disable no-unused-vars */
// client/src/pages/AdminDashboardPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Admin-only Overview Dashboard — analytics charts & KPIs
// Accessible at /admin/dashboard — only role="admin" can view.
// ─────────────────────────────────────────────────────────────────────────────

import api from "../lib/api.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const ACCENT  = "#FF633F";
const COLORS  = [ACCENT, "#6366f1", "#22c55e", "#f59e0b", "#14b8a6", "#ec4899", "#8b5cf6", "#0ea5e9"];
const STATUS_COLORS = {
  paid:             ACCENT,
  completed:        "#22c55e",
  processing:       "#f59e0b",
  shipped:          "#3b82f6",
  cancelled:        "#ef4444",
  refunded:         "#8b5cf6",
  requires_payment: "#94a3b8",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function humanSlug(slug = "") {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function fmt(n = 0) {
  return n.toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtCurrency(n = 0) {
  return `AED ${fmt(n)}`;
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = ACCENT, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{value}</p>
      </div>
    </motion.div>
  );
}

// ── Chart Panel ──────────────────────────────────────────────────────────────
function ChartPanel({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
    >
      <p className="text-sm font-extrabold text-slate-900">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-bold text-slate-500 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" && p.name?.toLowerCase().includes("revenue")
            ? fmtCurrency(p.value)
            : fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get("/auth/me");
        const user = res.data?.user;
        if (!user || user.role !== "admin") {
          setError("Forbidden — Admin access only.");
          setCheckingAuth(false);
          return;
        }
        setMe(user);
        setCheckingAuth(false);
        fetchAnalytics();
      } catch {
        navigate("/login", { replace: true });
      }
    };
    check();
  }, []);

  // ── Fetch analytics ───────────────────────────────────────────────────────
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/analytics");
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Auth loading screen ───────────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 60% 40% at 50% 55%, ${ACCENT}18 0%, transparent 70%)` }}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <img src="/logo.png" alt="Golden Art Frames" className="h-14 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          <div className="mt-8 relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: ACCENT }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-white/30">Checking Access…</p>
        </motion.div>
      </div>
    );
  }

  // ── Derive numbers ────────────────────────────────────────────────────────
  const statusMap = {};
  (data?.ordersByStatus || []).forEach(s => { statusMap[s._id] = s.count; });

  const totalOrders  = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const paidOrders   = (statusMap.paid || 0);
  const fulfilledOrders = (statusMap.completed || 0);

  // Daily orders chart — merge orders + revenue by day
  const dailyMap = {};
  (data?.dailyOrders || []).forEach(d => {
    dailyMap[d._id] = { date: d._id, orders: d.orders, revenue: d.revenue || 0 };
  });
  const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Daily visits
  const visitMap = {};
  (data?.dailyVisits || []).forEach(d => { visitMap[d._id] = { date: d._id, visits: d.visits }; });
  const visitData = Object.values(visitMap).sort((a, b) => a.date.localeCompare(b.date));

  // Top products
  const topProducts = (data?.topProducts || []).map(p => ({ name: humanSlug(p._id), count: p.count }));

  // Status pie
  const statusPie = (data?.ordersByStatus || [])
    .filter(s => s._id !== "requires_payment")
    .map(s => ({ name: s._id.charAt(0).toUpperCase() + s._id.slice(1), value: s.count }));

  // Traffic source pie
  const trafficPie = (data?.trafficBySource || []).map(t => ({
    name: t._id.charAt(0).toUpperCase() + t._id.slice(1),
    value: t.visits,
  }));

  // Top pages
  const topPages = (data?.topPages || []).map(p => ({ path: p._id, views: p.views }));

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 antialiased">
      {/* suppress recharts SVG focus ring */}
      <style>{`.recharts-wrapper svg:focus { outline: none; }`}</style>

      {/* ── Dark header ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 px-4 pb-6 pt-10">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: ACCENT }}
        />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Golden Art Frames
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-white">Overview Dashboard</h1>
              {me && (
                <p className="mt-1 text-xs text-white/40">
                  Logged in as <span className="font-bold text-white/60">{me.fullName || me.email}</span>{" "}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase">{me.role}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Link
                to="/admin"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                ← Admin Orders
              </Link>
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="rounded-2xl px-4 py-2 text-sm font-extrabold text-white transition-all disabled:opacity-50"
                style={{ background: ACCENT }}
              >
                {loading ? "Refreshing…" : "↻ Refresh"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">

        {/* Error / Forbidden */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              <b>Error:</b> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading shimmer */}
        {loading && !data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* ══ KPI STAT CARDS ══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Total Revenue"     value={fmtCurrency(data.totalRevenue)} icon="💰" delay={0}    />
              <StatCard label="Total Orders"      value={fmt(totalOrders)}               icon="📦" delay={0.05} />
              <StatCard label="Paid Orders"       value={fmt(paidOrders)}                icon="✅" delay={0.1}  />
              <StatCard label="Fulfilled Orders"  value={fmt(fulfilledOrders)}           icon="🚀" accent="#22c55e" delay={0.15} />
              <StatCard label="Registered Users"  value={fmt(data.totalUsers)}           icon="👥" accent="#6366f1" delay={0.2}  />
            </div>

            {/* ══ ORDERS & REVENUE OVER TIME ═══════════════════════════════ */}
            <ChartPanel
              title="Orders & Revenue — Last 30 Days"
              subtitle="All non-pending orders. Revenue in AED."
              delay={0.25}
            >
              {dailyData.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No order data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dailyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => v.slice(5)} />
                    <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="left"  type="monotone" dataKey="orders"  name="Orders"  stroke={ACCENT}    strokeWidth={2.5} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (AED)" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartPanel>

            {/* ══ TOP PRODUCTS + STATUS PIE ════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Top products bar chart */}
              <ChartPanel title="Top Products" subtitle="By items sold (paid + fulfilled orders)" delay={0.3}>
                {topProducts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No product data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={topProducts} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} width={120} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="count" name="Items Sold" fill={ACCENT} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>

              {/* Order status donut */}
              <ChartPanel title="Order Status Breakdown" subtitle="All-time order distribution" delay={0.35}>
                {statusPie.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No order data yet.</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {statusPie.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {statusPie.map((entry, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[entry.name.toLowerCase()] || COLORS[i % COLORS.length] }} />
                          {entry.name} ({entry.value})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </ChartPanel>
            </div>

            {/* ══ TRAFFIC ══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Traffic source donut */}
              <ChartPanel title="Traffic by Source" subtitle="Where visitors came from — last 30 days" delay={0.4}>
                {trafficPie.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    <p>No traffic data yet.</p>
                    <p className="mt-1 text-xs text-slate-300">Data populates as users visit pages.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={trafficPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {trafficPie.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {trafficPie.map((entry, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          {entry.name} ({fmt(entry.value)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </ChartPanel>

              {/* Daily visits line chart */}
              <ChartPanel title="Daily Website Visits" subtitle="Page views per day — last 30 days" delay={0.45}>
                {visitData.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    <p>No visit data yet.</p>
                    <p className="mt-1 text-xs text-slate-300">Data populates as users visit pages.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={visitData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="visits" name="Visits" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>
            </div>

            {/* ══ TOP PAGES TABLE ═══════════════════════════════════════════ */}
            <ChartPanel title="Top Pages" subtitle="Most visited paths — last 30 days" delay={0.5}>
              {topPages.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No page view data yet.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">#</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Page Path</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {topPages.map((p, i) => (
                        <tr key={i} className="transition hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 text-xs font-bold text-slate-400">{i + 1}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{p.path}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-xs font-extrabold"
                              style={{ background: `${ACCENT}15`, color: ACCENT }}
                            >
                              {fmt(p.views)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartPanel>
          </>
        )}
      </div>
    </div>
  );
}
