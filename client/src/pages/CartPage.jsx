// ─────────────────────────────────────────────────────────────────────────────
// Giỏ hàng Nghệ thuật — Cyan × Magenta thuần trên nền trắng
// Tràn viền · Việt ngữ · Trải nghiệm Gallery
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import api from "../lib/api.js";
import { MAT_CM } from "../lib/matSizes.js";
import { getSessionId } from "../lib/session.js";
import FramePreview from "../components/FramePreview.jsx";
import Canvas3DPreview from "../components/CanvasStretchedPreview.jsx";
import CollagePreview from "../components/CollagePreview.jsx";
import WeddingFramePreview from "../components/WeddingFramePreview.jsx";
import ShinyText from "../components/reactbits/ShinyText.jsx";

// ─── Bảng màu ────────────────────────────────────────────────────────────────
const C = "#00e5ff";   // cyan thuần
const M = "#e040fb";   // magenta thuần
const CM = C;

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

function Hairline({ className = "" }) {
  return <div className={`h-px w-full bg-slate-100 ${className}`} />;
}

// ─── Helpers (giữ nguyên logic gốc) ──────────────────────────────────────────
function parseCmSize(sizeStr) {
  if (!sizeStr) return null;
  const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
  const [w, h] = cleaned.split("x").map(Number);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { w, h };
}
function totalWithMat(w, h, matCm) {
  return { w: w + matCm * 2, h: h + matCm * 2 };
}
function isMultiAssets(assets) {
  return !!assets && Array.isArray(assets.items) && assets.items.length > 0;
}
function getPreviewFromCartItem(it) {
  const assets = it?.assets || {};
  if (isMultiAssets(assets)) {
    const first = assets.items.find((x) => x?.originalUrl || x?.previewUrl);
    return first?.originalUrl || first?.previewUrl || "";
  }
  if (assets.originalUrl || assets.previewUrl) return assets.originalUrl || assets.previewUrl || "";
  if (it?.originalUrl || it?.previewUrl) return it.originalUrl || it.previewUrl || "";
  return "";
}

// ─── Spec chip ───────────────────────────────────────────────────────────────
function SpecItem({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-50 py-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-800">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CART ITEM CARD
// ─────────────────────────────────────────────────────────────────────────────
function CartItemCard({ it, onRemove, index }) {
  const cfg = it.config || {};
  const assets = it.assets || {};
  const previewImg = getPreviewFromCartItem(it);
  const isMiniFrames = it.productSlug === "mini-frames";

  const print = parseCmSize(cfg.size);
  const frame = cfg.frame || null;
  const mat = cfg.mat || null;
  const matCm = mat ? (MAT_CM[mat] ?? 0) : 0;
  const total = print && mat ? totalWithMat(print.w, print.h, matCm) : null;

  const isCollageItem = it?.productSlug === "collage-frame" || it?.config?.orientation === "collage";
  const isWeddingFrameItem = it?.productSlug === "wedding-frame" || it?.productSlug === "wedding-print";

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="group border-b border-slate-100 bg-white transition-colors hover:bg-slate-50/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr]">
        
        {/* Preview Panel - Museum Style */}
        <div className="relative flex items-center justify-center bg-[#fcfcfc] p-8 md:border-r md:border-slate-100">
          <span className="absolute left-4 top-4 font-mono text-[10px] text-slate-300">
            REF_{String(index + 1).padStart(2, "0")}
          </span>
          
          <div className="w-full max-w-[200px] drop-shadow-2xl">
            {isCollageItem && isMultiAssets(assets) ? (
              <CollagePreview frame={frame || "Black Wood"} mat={mat || "None"} layout={cfg.layout} assets={assets.items} />
            ) : isMiniFrames && isMultiAssets(assets) ? (
              <div className="grid grid-cols-2 gap-2">
                {assets.items.slice(0, 4).map((a, i) => (
                  <FramePreview key={i} imageUrl={a.originalUrl} frame={frame} mat={mat} />
                ))}
              </div>
            ) : (
              previewImg && (
                frame === "Stretched" ? <Canvas3DPreview imageUrl={previewImg} /> : 
                <FramePreview imageUrl={previewImg} frame={frame || "White Wood"} mat={mat || "None"} />
              )
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="flex flex-col p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase mb-1">Cấu hình tác phẩm</p>
              <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                {it.productSlug?.replace(/-/g, " ")}
              </h3>
            </div>
            
            <button
              onClick={() => onRemove(it._id)}
              className="self-start font-mono text-[10px] font-bold tracking-widest text-slate-400 hover:text-red-500 transition-colors uppercase border-b border-transparent hover:border-red-500 pb-0.5"
            >
              [ Gỡ bỏ ]
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-1">
            <SpecItem label="Vật liệu" value={cfg.material || "Giấy nghệ thuật"} />
            <SpecItem label="Khung" value={frame || "Không khung"} />
            <SpecItem label="Kích thước in" value={cfg.size || "—"} />
            {mat && <SpecItem label="Bo tranh (Mat)" value={`${mat} (${matCm}cm)`} />}
            {total && <SpecItem label="Kích thước tổng" value={`${total.w}×${total.h}cm`} />}
          </div>

          {/* Wedding Data */}
          {isWeddingFrameItem && it.personalization && (
            <div className="mt-4 border-l-2 border-slate-900 bg-slate-50 p-4 font-mono text-[11px]">
               <p className="font-bold uppercase text-slate-400 mb-1">Cá nhân hóa:</p>
               <p>{it.personalization.groomName} & {it.personalization.brideName}</p>
               <p>{it.personalization.location} — {it.personalization.weddingDate}</p>
            </div>
          )}

          <div className="mt-auto pt-8 flex items-end justify-between">
            <div className="font-mono text-[10px] text-slate-400 uppercase">
              Đơn giá: {it.price?.unit} {it.price?.currency}
            </div>
            <div className="text-2xl font-black tracking-tighter text-slate-900">
              {it.price?.total} <span className="text-sm font-bold">{it.price?.currency}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const sessionId = useMemo(() => getSessionId(), []);

  const loadCart = async () => {
    try {
      const res = await api.get(`/cart/${sessionId}`);
      setCart(res.data);
    } catch (err) {
      setError("Không thể tải giỏ hàng.");
    }
  };

  useEffect(() => { loadCart(); }, []);

  const totals = useMemo(() => {
    const items = cart?.items || [];
    const subtotal = items.reduce((sum, it) => sum + (it?.price?.total || 0), 0);
    return { subtotal, currency: items[0]?.price?.currency || "AED" };
  }, [cart]);

  const handleRemove = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${sessionId}/items/${itemId}`);
      setCart(res.data);
    } catch (err) { setError("Lỗi khi xóa mục."); }
  };

  const itemCount = cart?.items?.length ?? 0;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-10 sm:px-16 lg:px-24 border-b border-slate-100">
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: C }} />
        
        <Reveal>
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-xs tracking-[0.3em] text-slate-400 uppercase">Danh mục của bạn</span>
            <div className="h-px w-12" style={{ background: M }} />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
            Giỏ <br /> 
            <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>Hàng.</span>
          </h1>
          
          <div className="mt-8 flex items-center gap-6">
             <div className="flex flex-col">
               <span className="font-mono text-[10px] text-slate-400 uppercase">Số lượng</span>
               <span className="text-2xl font-black">{itemCount} tác phẩm</span>
             </div>
             <div className="h-10 w-px bg-slate-100" />
             <div className="flex flex-col">
               <span className="font-mono text-[10px] text-slate-400 uppercase">Trạng thái</span>
               <span className="text-xs font-bold uppercase tracking-widest text-white px-2 py-0.5" style={{ background: M }}>
                 Sẵn sàng thanh toán
               </span>
             </div>
          </div>
        </Reveal>
      </section>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-0 lg:flex lg:items-start">
        
        {/* Left: Items List */}
        <div className="flex-1 lg:border-r lg:border-slate-100">
          {!cart ? (
            <div className="p-20 text-center font-mono text-xs animate-pulse text-slate-300 uppercase tracking-widest">
              Đang truy xuất dữ liệu...
            </div>
          ) : itemCount === 0 ? (
            <div className="py-40 px-10 text-center">
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-6">Giỏ hàng trống</h2>
              <Link to="/products" className="inline-block px-10 py-4 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors" style={{ borderRadius: 2 }}>
                Bắt đầu sáng tác ngay →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {cart.items.map((it, i) => (
                  <CartItemCard key={it._id} it={it} onRemove={handleRemove} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right: Summary Side Bar */}
        <aside className="w-full lg:w-[450px] lg:sticky lg:top-0 p-10 lg:p-16 bg-white">
          <Reveal>
            <div className="mb-10">
              <p className="font-mono text-[10px] tracking-[0.25em] text-slate-400 uppercase mb-3">Tóm tắt đơn hàng</p>
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Thanh toán</h2>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-end">
                <span className="font-mono text-xs text-slate-400 uppercase">Tạm tính</span>
                <span className="text-xl font-bold">{totals.subtotal} {totals.currency}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-mono text-xs text-slate-400 uppercase">Vận chuyển (UAE)</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Tính tại bước sau</span>
              </div>
              <Hairline className="my-6" />
              <div className="flex justify-between items-end">
                <span className="font-black text-sm uppercase tracking-tighter">Tổng cộng</span>
                <span className="text-4xl font-black" style={{ color: C }}>
                   {totals.subtotal} <span className="text-lg">{totals.currency}</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="group relative w-full overflow-hidden py-6 bg-slate-900 transition-all hover:scale-[1.02] active:scale-95"
              style={{ borderRadius: 2 }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10 text-white font-black uppercase tracking-[0.2em] text-sm">
                <ShinyText text="Tiến hành đặt hàng →" speed={3} />
              </span>
            </button>

            <div className="mt-12 space-y-6">
              {[
                { title: "Bảo mật", desc: "Thanh toán mã hóa chuẩn quốc tế" },
                { title: "Sản xuất", desc: "Chế tác thủ công tại xưởng UAE" },
                { title: "Giao hàng", desc: "Đóng gói chuyên dụng cho tác phẩm nghệ thuật" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-1.5 w-1.5 mt-1.5 shrink-0" style={{ background: i % 2 === 0 ? C : M }} />
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/products" className="mt-12 block text-center font-mono text-[10px] font-bold text-slate-300 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]">
              ← Tiếp tục chọn tranh
            </Link>
          </Reveal>
        </aside>

      </div>

      {/* Footer Hairline */}
      <Hairline className="bg-slate-50" />
    </div>
  );
}
