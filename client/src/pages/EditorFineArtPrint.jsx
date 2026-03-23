/* eslint-disable no-unused-vars */
// client/src/pages/EditorFineArtPrint.jsx
// ─────────────────────────────────────────────────────────────────────────────
// TRẢI NGHIỆM PHÒNG TRIỂN LÃM — Cyan × Magenta thuần
// Tràn viền hoàn toàn · Typography bảo tàng · Preview thực tế
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, useRef } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";

// ─── Bảng màu ────────────────────────────────────────────────────────────────
const C = "#00e5ff"; // Cyan thuần
const M = "#e040fb"; // Magenta thuần
const CM = C;

const RELATED = [
  { name: "In & Đóng Khung", desc: "Khung thủ công cao cấp, sẵn treo tường.", price: "từ 89 AED", img: "/feature/11.avif", href: "/editor/print-frame", tag: "Phổ biến nhất", accent: C },
  { name: "In Canvas", desc: "Canvas bọc gallery, chất lượng triển lãm.", price: "từ 149 AED", img: "/feature/8.avif", href: "/editor/canvas", tag: "Bán chạy", accent: M },
];

const MATERIALS_INFO = {
  Matte: { icon: "◻", desc: "Không phản sáng, màu sắc sâu và trầm lắng." },
  Glossy: { icon: "◼", desc: "Bề mặt bóng, màu rực rỡ và tươi sáng." },
  Pearl: { icon: "◈", desc: "Ánh kim nhẹ, sang trọng và đặc biệt." },
  Fine: { icon: "◇", desc: "Giấy mỹ thuật bề mặt nhám, cảm giác như vẽ tay." },
};

function parseCmSize(s) {
  if (!s) return null;
  const [w, h] = s.toLowerCase().replace("cm", "").replace("×", "x").trim().split("x").map(Number);
  return Number.isFinite(w) && Number.isFinite(h) ? { w, h } : null;
}

// ─── Upload Placeholder ───────────────────────────────────────────────────────
function UploadPlaceholder({ onUpload }) {
  return (
    <motion.button
      type="button"
      onClick={onUpload}
      className="group relative flex flex-col items-center justify-center gap-6 cursor-pointer w-full overflow-hidden bg-white"
      style={{ minHeight: 420, border: `1px dashed ${C}30` }}
      whileHover={{ background: `${C}05` }}
    >
      <div className="relative flex items-center justify-center h-20 w-20">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px dashed ${C}60` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <svg className="h-8 w-8 relative z-10" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center px-6">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tighter uppercase mb-2">Bắt đầu tác phẩm của bạn</h3>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Tải ảnh lên · Chọn kích thước · Nhận hàng tận cửa</p>
      </div>
      <span className="absolute bottom-6 right-8 font-mono text-[10px] tracking-[0.4em] text-slate-300">STEP 01</span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANG CHÍNH
// ─────────────────────────────────────────────────────────────────────────────
export default function EditorFineArtPrint() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [material, setMaterial] = useState("Matte");
  const [quantity] = useState(1);
  const [originalUrl, setOriginalUrl] = useState("");
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null);

  useEffect(() => { document.title = "In Nghệ Thuật Premium — Gallery Experience"; }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products/fine-art-print");
        setProduct(res.data);
        if (res.data.options?.materials?.[0]) setMaterial(res.data.options.materials[0].name);
      } catch (err) { setError(err?.response?.data?.message || err.message); }
    };
    load();
  }, []);

  const portraitVariants = useMemo(() => (product?.variants || []).filter(v => v.orientation === "portrait"), [product]);

  useEffect(() => {
    if (!variantSku) return;
    const run = async () => {
      try {
        const res = await api.post("/pricing/quote", {
          productSlug: "fine-art-print", variantSku, options: { material }, quantity,
        });
        setQuote(res.data);
      } catch (err) { setQuote(null); }
    };
    run();
  }, [variantSku, material, quantity]);

  const selectedVariant = portraitVariants.find(v => v.sku === variantSku);
  const canOrder = !!(originalUrl && quote && selectedRatio);

  const handleAddToCart = async () => {
    try {
      if (!canOrder) return;
      const sessionId = getSessionId();
      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: "fine-art-print",
          variantSku,
          config: { size: selectedVariant.size, material, quantity, transform: { ratio: selectedRatio.id } },
          assets: { originalUrl },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError("Lỗi khi thêm vào giỏ hàng"); }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-cyan-100">
      {/* Thanh định hướng (Breadcrumb) */}
      <nav className="flex items-center justify-between px-8 sm:px-12 py-5 border-b border-slate-100">
        <Link to="/products" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-all">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Quay lại
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.4em] text-slate-300">GALLERY EDITOR v2.0</span>
          <div className="h-3 w-px bg-slate-200" />
          <span className="font-bold text-[10px] text-slate-900 uppercase tracking-widest">In Nghệ Thuật</span>
        </div>
      </nav>

      {/* Layout chính: Tràn viền */}
      {!product ? (
        <div className="p-20 text-center font-mono text-xs animate-pulse">ĐANG TẢI DỮ LIỆU TRIỂN LÃM...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px]">
          
          {/* CỘT TRÁI: VIEW TƯỜNG BẢO TÀNG */}
          <div className="relative bg-[#f7f7f7] flex flex-col min-h-[600px] lg:h-[calc(100vh-65px)] overflow-hidden border-r border-slate-100">
            {/* Overlay ánh sáng Spotlight */}
            <div className="absolute inset-0 pointer-events-none z-10" 
                 style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)" }} />
            
            {/* Header trạng thái */}
            <div className="absolute top-8 left-10 z-20 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-[9px] tracking-[0.3em] text-slate-500 uppercase">Live Preview</span>
              </div>
              <div className="h-px w-12 bg-slate-200" />
              <span className="font-mono text-[9px] tracking-[0.3em] text-slate-400 uppercase">Room 01</span>
            </div>

            {/* Vùng mô phỏng tường thực tế */}
            <div className="flex-1 flex items-center justify-center p-12 relative">
              {/* Sàn bảo tàng */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#e5e5e5] border-t border-[#dcdcdc]" />
              
              {!originalUrl ? (
                <div className="w-full max-w-lg shadow-[0_30px_100px_rgba(0,0,0,0.08)]">
                  <UploadPlaceholder onUpload={() => setIsUploadWizardOpen(true)} />
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-20 group"
                >
                  {/* Hiệu ứng treo tranh */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-12 bg-slate-300" />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-400 border border-white" />
                  
                  {/* Preview chính */}
                  <div className="shadow-[0_40px_120px_rgba(0,0,0,0.25)] transition-transform duration-500 group-hover:scale-[1.01]">
                    <PrintPreview imageUrl={originalUrl} />
                  </div>

                  {/* Nhãn chú thích kiểu Gallery */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="absolute -right-32 bottom-0 hidden xl:block w-24 p-3 bg-white border-l-2 border-cyan-400 text-[8px] font-bold leading-relaxed"
                  >
                    <p className="text-slate-900 uppercase mb-1">Tác phẩm</p>
                    <p className="text-slate-400 font-normal">Fine Art Print on {material}</p>
                    <p className="text-slate-400 font-normal mt-1">{selectedVariant?.size || "Custom size"}</p>
                  </motion.div>
                </motion.div>
              )}
            </div>
            
            {/* Footer thông tin ảnh */}
            {originalUrl && (
              <div className="px-10 py-5 bg-white flex items-center gap-6 border-t border-slate-100">
                <button onClick={() => setIsUploadWizardOpen(true)} className="text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-magenta-500 transition-colors">
                  ↺ Thay đổi hình ảnh
                </button>
                <div className="h-4 w-px bg-slate-100" />
                <span className="font-mono text-[9px] text-slate-400 uppercase">Tỷ lệ: {selectedRatio?.id}</span>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: BẢNG ĐIỀU KHIỂN CHI TIẾT */}
          <div className="bg-white flex flex-col h-full lg:h-[calc(100vh-65px)] overflow-y-auto">
            
            {/* Phần 1: Tiêu đề & Giá */}
            <div className="p-10 border-b border-slate-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-6" style={{ background: C }} />
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-slate-400">Fine Art Selection</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 leading-[0.9] mb-6">
                In Nghệ Thuật <br />
                <span style={{ WebkitTextStroke: `1.5px ${C}`, color: "transparent" }}>Cao Cấp</span>
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tighter text-slate-900">
                  {quote ? `${quote.total}` : "—"}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{quote?.currency || "AED"}</span>
              </div>
            </div>

            {/* Phần 2: Kích thước */}
            <div className="p-10 border-b border-slate-50">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">01. Kích thước</h4>
                {selectedVariant && <span className="font-mono text-[10px] text-cyan-500 font-bold">{selectedVariant.size}</span>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {portraitVariants.map((v) => {
                  const active = v.sku === variantSku;
                  return (
                    <button key={v.sku} onClick={() => setVariantSku(v.sku)}
                      className={`py-3 text-[10px] font-bold tracking-tighter transition-all ${
                        active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      }`}
                      style={{ borderRadius: 1 }}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phần 3: Chất liệu */}
            <div className="p-10 border-b border-slate-50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6">02. Loại giấy nghệ thuật</h4>
              <div className="grid grid-cols-2 gap-3">
                {product.options?.materials?.map((opt) => {
                  const active = opt.name === material;
                  const info = MATERIALS_INFO[opt.name] || {};
                  return (
                    <button key={opt.name} onClick={() => setMaterial(opt.name)}
                      className={`flex flex-col p-4 text-left transition-all border ${
                        active ? "border-cyan-400 bg-cyan-50/30" : "border-slate-100 hover:border-slate-300"
                      }`}
                      style={{ borderRadius: 2 }}
                    >
                      <span className={`text-lg mb-2 ${active ? "text-cyan-500" : "text-slate-300"}`}>{info.icon}</span>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{opt.name}</span>
                      <p className="text-[9px] text-slate-400 leading-relaxed mt-1">{info.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phần 4: Quy trình & Cam kết */}
            <div className="p-10 bg-slate-50 flex-1">
              <div className="space-y-4">
                {[
                  { t: "In Archival", d: "Mực in lưu trữ bền màu trên 100 năm." },
                  { t: "Gallery Quality", d: "Độ phân giải siêu cao, màu sắc chuẩn triển lãm." },
                  { t: "Safe Delivery", d: "Đóng gói ống cứng chuyên dụng, chống va đập." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-cyan-500 text-xs">✦</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-900 uppercase">{item.t}</p>
                      <p className="text-[10px] text-slate-500">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phần 5: CTA TRÀN VIỀN */}
            <div className="sticky bottom-0 p-8 bg-white border-t border-slate-100">
              <motion.button
                disabled={!canOrder}
                onClick={handleAddToCart}
                whileTap={{ scale: canOrder ? 0.98 : 1 }}
                className="w-full py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group"
                style={canOrder ? { background: C, color: "#000" } : { background: "#f1f1f1", color: "#ccc", cursor: "not-allowed" }}
              >
                <span className="relative z-10">
                  {canOrder ? `Thêm vào bộ sưu tập · ${quote?.total} ${quote?.currency}` : "Vui lòng chọn đủ thông tin"}
                </span>
                {canOrder && (
                  <motion.div 
                    className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" 
                  />
                )}
              </motion.button>
              <p className="mt-4 text-center text-[9px] font-mono text-slate-300 tracking-widest uppercase">Premium Craftsmanship from UAE</p>
            </div>
          </div>
        </div>
      )}

      {/* SẢN PHẨM KHÁC (FOOTER SECTION) */}
      <section className="border-t border-slate-100 py-24 px-10 sm:px-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: M }} />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-magenta-400">Discover More</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-slate-900">Có thể bạn sẽ thích</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {RELATED.map((p, i) => (
            <Link key={p.name} to={p.href} className="group relative bg-white border border-slate-100 p-8 flex items-center justify-between hover:bg-slate-50 transition-all">
              <div>
                <span className="font-mono text-[9px] text-slate-300 mb-2 block">0{i+1} / COLLECTION</span>
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                <span className="inline-block mt-4 text-[10px] font-bold text-cyan-500 group-hover:translate-x-2 transition-transform">KHÁM PHÁ →</span>
              </div>
              <div className="w-32 h-32 bg-slate-100 overflow-hidden shadow-xl group-hover:scale-105 transition-transform">
                 <img src={p.img} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        onComplete={({ ratio, imageUrl }) => { setSelectedRatio(ratio); setOriginalUrl(imageUrl); }}
      />
    </div>
  );
}
