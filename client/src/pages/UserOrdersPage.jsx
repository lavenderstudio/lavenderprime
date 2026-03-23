// ─────────────────────────────────────────────────────────────────────────────
// User Orders Page — Museum Gallery Edition (Cyan × Magenta)
// Tràn viền · Việt hóa · Đẳng cấp triển lãm
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import api from "../lib/api.js";

// ─── Bảng màu ────────────────────────────────────────────────────────────────
const C = "#00e5ff"; // Cyan
const M = "#e040fb"; // Magenta

// ─── Reveal Animation ────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Đường kẻ trang trí ──────────────────────────────────────────────────────
function Hairline() {
  return <div className="w-full h-px bg-slate-100" />;
}

// ─── Trạng thái đơn hàng (Việt hóa) ──────────────────────────────────────────
function statusUi(statusRaw) {
  const s = String(statusRaw || "").toLowerCase();
  
  const map = {
    paid: { label: "Đã thanh toán", color: "#22c55e" },
    processing: { label: "Đang chế tác", color: C },
    shipped: { label: "Đang vận chuyển", color: M },
    completed: { label: "Hoàn thành", color: "#22c55e" },
    requires_payment: { label: "Chờ thanh toán", color: M },
    cancelled: { label: "Đã hủy", color: "#f43f5e" },
    refunded: { label: "Đã hoàn tiền", color: "#94a3b8" },
  };

  const res = map[s] || { label: statusRaw || "Đang xử lý", color: "#94a3b8" };
  return res;
}

// ─── Stacked thumbnails (Kiểu gallery) ───────────────────────────────────────
function ThumbStack({ urls }) {
  const stack = (urls || []).slice(0, 3);
  if (!urls?.length) return <div className="h-16 w-12 bg-slate-50 border border-slate-100 flex items-center justify-center text-[8px] text-slate-300 uppercase">No Img</div>;

  return (
    <div className="relative h-20 w-16 shrink-0 group">
      {stack.map((u, i) => (
        <img
          key={i}
          src={u}
          alt=""
          className="absolute inset-0 h-full w-full object-cover border border-white shadow-sm transition-transform duration-500 group-hover:translate-x-1"
          style={{ 
            zIndex: 10 - i, 
            transform: `translate(${i * 4}px, ${i * -2}px)`,
            filter: i > 0 ? "grayscale(100%) opacity(0.5)" : "none"
          }}
        />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getItemThumbUrls(it) {
  const items = it?.assets?.items;
  if (Array.isArray(items) && items.length > 0)
    return items.map((x) => x?.previewUrl || x?.originalUrl).filter(Boolean);
  const single = it?.assets?.previewUrl || it?.assets?.originalUrl;
  return single ? [single] : [];
}

function humanSlug(slug) {
  const dict = {
    "print-frame": "In & Đóng Khung",
    "fine-art-print": "In Nghệ Thuật",
    "canvas": "In Canvas",
    "collage-frame": "Khung Collage",
  };
  return dict[slug] || "Sản Phẩm Tùy Chỉnh";
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function UserOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login", { state: { from: "/orders" }, replace: true });
          return;
        }
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-cyan-100">
      
      {/* ── Section 1: Hero Editorial ────────────────────────────────────── */}
      <section className="relative border-b border-slate-100 pt-32 pb-20 px-10 sm:px-16 lg:px-24">
        {/* Accent Vertical Line */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: C }} />
        
        <Reveal>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-xs tracking-[0.3em] text-slate-400 uppercase">Thư viện cá nhân</span>
            <div className="h-px w-12" style={{ background: M }} />
          </div>
          <h1 
            className="font-extrabold leading-[0.9] tracking-tighter text-slate-900"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          >
            Đơn Hàng<br />
            <span style={{ color: "transparent", WebkitTextStroke: `1px ${C}` }}>Của Bạn.</span>
          </h1>
        </Reveal>
      </section>

      {/* ── Section 2: Order List ────────────────────────────────────────── */}
      <section className="py-0">
        {loading ? (
          <div className="px-10 sm:px-16 lg:px-24 py-20 space-y-12">
            {[1, 2].map(n => <div key={n} className="h-40 w-full bg-slate-50 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-10 sm:px-16 lg:px-24 py-32 text-center">
            <p className="font-mono text-sm text-slate-400 uppercase tracking-widest">Chưa có dữ liệu lưu trữ</p>
            <Link to="/products" className="mt-8 inline-block font-extrabold text-sm border-b-2 border-slate-900 pb-1 hover:text-cyan-500 hover:border-cyan-500 transition-all">
              Bắt đầu bộ sưu tập của bạn →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((o, idx) => {
              const st = statusUi(o.status);
              const orderNo = String(o.orderNumber ?? "").padStart(6, "0");
              const total = o.totals?.grandTotal ?? o.totals?.subtotal;
              
              return (
                <Reveal key={o._id} delay={idx * 0.05}>
                  <div className="group grid lg:grid-cols-12 items-stretch hover:bg-slate-50 transition-colors duration-500">
                    
                    {/* Mã đơn & Trạng thái */}
                    <div className="lg:col-span-3 p-10 lg:border-r border-slate-100 flex flex-col justify-between">
                      <div>
                        <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase mb-2">Mã lưu trữ</p>
                        <p className="text-2xl font-extrabold tracking-tighter font-mono">#{orderNo}</p>
                      </div>
                      <div className="mt-8 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full" style={{ background: st.color }} />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                    </div>

                    {/* Chi tiết sản phẩm */}
                    <div className="lg:col-span-6 p-10 flex flex-col justify-center">
                      <div className="space-y-6">
                        {o.items?.slice(0, 2).map((it, i) => (
                          <div key={i} className="flex gap-6 items-start">
                            <ThumbStack urls={getItemThumbUrls(it)} />
                            <div className="min-w-0">
                              <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-900">{humanSlug(it.productSlug)}</h3>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {it.config?.size && `Kích thước: ${it.config.size} · `}
                                {it.config?.frame && `Khung: ${it.config.frame} · `}
                                {`SL: ${it.config?.quantity || 1}`}
                              </p>
                            </div>
                          </div>
                        ))}
                        {o.items?.length > 2 && (
                          <p className="font-mono text-[10px] text-slate-300 uppercase">+{o.items.length - 2} sản phẩm khác trong tệp</p>
                        )}
                      </div>
                    </div>

                    {/* Tổng tiền & Hành động */}
                    <div className="lg:col-span-3 p-10 bg-slate-900 lg:bg-transparent flex flex-col justify-between items-end border-t lg:border-t-0 border-slate-100">
                      <div className="text-right">
                        <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-1">Tổng giá trị</p>
                        <p className="text-2xl font-extrabold text-white lg:text-slate-900 tabular-nums">
                          {total} <span className="text-sm font-normal opacity-50">{o.totals?.currency}</span>
                        </p>
                      </div>
                      
                      <div className="mt-8 flex gap-4">
                        <Link 
                          to={`/order/${o._id}`}
                          className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-[0.2em] border border-slate-200 text-white lg:text-slate-900 hover:bg-slate-900 hover:text-white transition-all"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Section 3: Footer Support ───────────────────────────────────── */}
      <Hairline />
      <section className="px-10 sm:px-16 lg:px-24 py-20 flex flex-col lg:flex-row justify-between items-start gap-10">
        <Reveal className="max-w-md">
          <h2 className="text-xl font-extrabold tracking-tight mb-4">Bạn cần hỗ trợ về đơn hàng?</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Mọi tác phẩm đều được chúng tôi bảo hành chất lượng lưu trữ. Nếu có bất kỳ vấn đề gì về vận chuyển hoặc chế tác, vui lòng liên hệ đội ngũ curator.
          </p>
        </Reveal>
        <div className="flex gap-3">
          <button className="px-8 py-4 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-cyan-500 transition-colors">
            Nhắn tin hỗ trợ
          </button>
          <Link to="/products" className="px-8 py-4 border border-slate-200 text-xs font-bold uppercase tracking-widest hover:border-magenta-500 hover:text-magenta-500 transition-all">
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>

    </div>
  );
}
