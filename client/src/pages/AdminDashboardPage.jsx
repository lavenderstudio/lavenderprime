/* eslint-disable no-unused-vars */
import api from "../lib/api.js";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import ShinyText from "../components/reactbits/ShinyText.jsx";

// ── Bảng màu Bảo tàng ────────────────────────────────────────────────────────
const C = "#00e5ff";   // Cyan
const M = "#e040fb";   // Magenta
const COLORS = [C, M, "#1e293b", "#94a3b8"];
const STATUS_COLORS = {
  paid: C,
  completed: "#10b981",
  processing: "#f59e0b",
  shipped: M,
  cancelled: "#ef4444",
  refunded: "#8b5cf6",
};

// ── Components trang trí ─────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Hairline() {
  return <div className="h-px w-full bg-slate-100" />;
}

// ── Stat Card kiểu Gallery ───────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = C, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="group relative flex flex-col border-r border-slate-100 bg-white p-8 last:border-r-0 transition-all hover:bg-slate-50">
        <div className="absolute top-0 left-0 h-1 w-0 bg-current transition-all group-hover:w-full" style={{ color: accent }} />
        <span className="mb-4 text-2xl">{icon}</span>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-2 font-mono text-3xl font-extrabold tracking-tighter text-slate-900">{value}</p>
      </div>
    </Reveal>
  );
}

// ── Chart Panel kiểu Minimalist ──────────────────────────────────────────────
function ChartPanel({ title, subtitle, children, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-4 w-1" style={{ background: C }} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{subtitle}</p>
            <h3 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h3>
          </div>
        </div>
        <div className="h-[300px] w-full">{children}</div>
      </div>
    </Reveal>
  );
}

// ── Tooltip tùy chỉnh ────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-slate-900 bg-slate-900 px-4 py-3 text-white shadow-2xl">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest opacity-50">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold uppercase tracking-tight">
          {p.name}: <span style={{ color: p.color }}>{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data?.user?.role !== "admin") {
          navigate("/login"); return;
        }
        setMe(res.data.user);
        setCheckingAuth(false);
        fetchAnalytics();
      } catch { navigate("/login"); }
    };
    check();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
    } finally { setLoading(false); }
  };

  if (checkingAuth) return null; // Hoặc loading spinner tối giản

  // Xử lý dữ liệu biểu đồ
  const dailyData = (data?.dailyOrders || []).map(d => ({
    Ngày: d._id.slice(5),
    Đơn: d.orders,
    DoanhThu: d.revenue
  })).sort((a, b) => a.Ngày.localeCompare(b.Ngày));

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100">
      <style>{`.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke: #f1f5f9; }`}</style>

      {/* ── Header Tràn Viền ───────────────────────────────────────────────── */}
      <header className="relative border-b border-slate-100 bg-white px-10 py-16 sm:px-16 lg:px-24">
        <div className="absolute left-0 top-0 h-full w-1" style={{ background: C }} />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase">Hệ thống quản trị</span>
              <div className="h-px w-12 bg-cyan-200" />
              <span className="bg-slate-900 px-2 py-0.5 font-mono text-[9px] text-white">v2.0.25</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl">
              Bảng <span style={{ color: "transparent", WebkitTextStroke: `1.5px ${M}` }}>Điều Khiển</span>
            </h1>
            <p className="mt-4 font-mono text-xs text-slate-400">
              Chào buổi sáng, <span className="text-slate-900 font-bold underline decoration-cyan-400">{me?.fullName || "Quản trị viên"}</span>
            </p>
          </div>

          <div className="flex gap-4">
            <Link to="/admin" className="border border-slate-200 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition hover:bg-slate-900 hover:text-white">
              ← Đơn hàng
            </Link>
            <button 
              onClick={fetchAnalytics}
              className="px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition hover:scale-105"
              style={{ background: C }}
            >
              {loading ? "Đang cập nhật..." : "Làm mới dữ liệu"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Chỉ số chính (KPIs) ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 border-b border-slate-100 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Tổng doanh thu" value={`${data?.totalRevenue?.toLocaleString()} AED`} icon="💰" delay={0.1} />
        <StatCard label="Tổng đơn hàng" value={data?.ordersByStatus?.reduce((a,b)=>a+b.count,0) || 0} icon="📦" delay={0.15} />
        <StatCard label="Đã thanh toán" value={data?.ordersByStatus?.find(s=>s._id==='paid')?.count || 0} icon="✨" delay={0.2} accent={M} />
        <StatCard label="Thành viên" value={data?.totalUsers || 0} icon="👥" delay={0.25} />
        <StatCard label="Thời gian xử lý" value="~48h" icon="⏱" delay={0.3} accent={M} />
      </div>

      {/* ── Biểu đồ & Phân tích ────────────────────────────────────────────── */}
      <main className="px-10 py-20 sm:px-16 lg:px-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* Biểu đồ doanh thu - Chiếm 2/3 */}
          <div className="lg:col-span-2">
            <ChartPanel title="Hiệu suất kinh doanh" subtitle="Dữ liệu 30 ngày gần nhất">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="Ngày" axisLine={false} tickLine={false} tick={{fontFamily: 'monospace', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontFamily: 'monospace', fontSize: 10}} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="stepAfter" dataKey="DoanhThu" name="Doanh thu" stroke={C} strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Đơn" name="Số đơn" stroke={M} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>

          {/* Phân loại trạng thái - Chiếm 1/3 */}
          <ChartPanel title="Tình trạng đơn hàng" subtitle="Phân bổ tổng thể">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.ordersByStatus?.map(s => ({ name: s._id, value: s.count }))}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data?.ordersByStatus?.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry._id] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
               {data?.ordersByStatus?.map((s, i) => (
                 <div key={i} className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-tighter">
                   <div className="h-2 w-2" style={{ background: STATUS_COLORS[s._id] || COLORS[i % COLORS.length] }} />
                   {s._id}: {s.count}
                 </div>
               ))}
            </div>
          </ChartPanel>

          {/* Trang truy cập nhiều nhất */}
          <div className="lg:col-span-3 mt-12">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-extrabold tracking-tighter">Lưu lượng truy cập</h2>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
              {data?.topPages?.map((p, i) => (
                <div key={i} className="border border-slate-100 p-6 transition hover:bg-slate-50">
                  <p className="font-mono text-[10px] text-slate-400 mb-2">PAGEPATH / {i+1}</p>
                  <p className="font-mono text-sm font-bold truncate mb-4">{p._id}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-extrabold tracking-tighter" style={{ color: i % 2 === 0 ? C : M }}>{p.views}</span>
                    <span className="font-mono text-[9px] text-slate-400 uppercase">Lượt xem</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 px-10 py-10 sm:px-16 lg:px-24">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            © 2026 Golden Art Frames / Lavender Prime Studio
          </p>
          <div className="flex gap-6">
            {["Bảo mật", "Hệ thống", "Hỗ trợ"].map(item => (
              <button key={item} className="font-mono text-[10px] uppercase tracking-widest text-slate-400 hover:text-cyan-500">
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
