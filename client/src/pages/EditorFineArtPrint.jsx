/* eslint-disable no-unused-vars */
// client/src/pages/EditorFineArtPrint.jsx
// ─────────────────────────────────────────────────────────────────────────────
// THIẾT KẾ BẢO TÀNG — Full-bleed · Typography nghệ thuật · Trải nghiệm Gallery
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";

// ─── Bảng màu ────────────────────────────────────────────────────────────────
const C = "#00e5ff"; // Cyan thuần
const M = "#e040fb"; // Magenta thuần

const RELATED = [
  { name: "In & Đóng Khung", desc: "Khung thủ công cao cấp, sẵn treo tường.", price: "từ 89 AED", img: "/feature/11.avif", href: "/editor/print-frame", tag: "Phổ biến nhất", accent: C },
  { name: "In Canvas", desc: "Canvas bọc gallery, chất lượng triển lãm.", price: "từ 149 AED", img: "/feature/8.avif", href: "/editor/canvas", tag: "Bán chạy", accent: M },
  { name: "In Collage", desc: "Nhiều khoảnh khắc trong một khung hình.", price: "từ 179 AED", img: "/feature/3.avif", href: "/editor/collage-frame", tag: "Sáng tạo", accent: C },
];

const MATERIALS_INFO = {
  Matte: { icon: "◻", desc: "Không phản sáng, màu sắc sâu và trầm lắng." },
  Glossy: { icon: "◼", desc: "Bề mặt bóng, màu rực rỡ và tươi sáng." },
  Pearl: { icon: "◈", desc: "Ánh kim nhẹ, sang trọng và đặc biệt." },
  Fine: { icon: "◇", desc: "Giấy nghệ thuật bề mặt nhám, như tranh vẽ tay." },
};

function parseCmSize(s) {
  if (!s) return null;
  const [w, h] = s.toLowerCase().replace("cm","").replace("×","x").trim().split("x").map(Number);
  return Number.isFinite(w) && Number.isFinite(h) ? { w, h } : null;
}

// ─── Upload Placeholder ───────────────────────────────────────────────────────
function UploadPlaceholder({ onUpload }) {
  return (
    <motion.button
      type="button"
      onClick={onUpload}
      className="group relative flex flex-col items-center justify-center gap-6 cursor-pointer w-full overflow-hidden"
      style={{ minHeight: 450, border: `1px dashed ${C}30`, background: "#fff" }}
      whileHover={{ background: `${C}05` }}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-white shadow-xl transition-transform group-hover:scale-110">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-slate-400 mb-2">Bước 01</p>
        <h3 className="text-xl font-extrabold tracking-tighter text-slate-900">Tải Tác Phẩm Của Bạn</h3>
        <p className="mt-2 text-xs text-slate-500 max-w-[240px] leading-relaxed">Hỗ trợ JPEG, PNG, HEIC. Chất lượng phòng trưng bày.</p>
      </div>

      <div className="absolute bottom-8 flex items-center gap-3">
        <div className="h-px w-8" style={{ background: C }} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500">Bắt đầu ngay</span>
        <div className="h-px w-8" style={{ background: C }} />
      </div>
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

  useEffect(() => { document.title = "Thiết Kế In Nghệ Thuật | Lavender Prime"; }, []);

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

  const portraitVariants = useMemo(() => (product?.variants || []).filter(v => v.orientation === "portrait"), [product]);
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
          config: { material, quantity, transform: { ratio: selectedRatio.id } },
          assets: { originalUrl, previewUrl: "" },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-cyan-100">
      {/* 1. Header Điều hướng */}
      <nav className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:px-12">
        <Link to="/products" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-slate-900">
          <span className="transition-transform group-hover:-translate-x-1">←</span> Quay lại
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-2 w-2 rounded-full" style={{ background: C }} />
          <span className="font-mono text-[9px] tracking-[0.4em] text-slate-500 uppercase">Phòng Chế Tác Trực Tuyến</span>
        </div>
      </nav>

      {/* 2. Layout Chính - Tràn viền bất đối xứng */}
      <main className="grid grid-cols-1 lg:grid-cols-[1fr_450px]">
        
        {/* Cột Trái: Trải nghiệm Gallery */}
        <section className="relative flex min-h-[600px] flex-col items-center justify-center bg-[#f8f7f4] lg:min-h-screen" style={{ borderRight: "1px solid #eee" }}>
          {/* Background Decor */}
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ 
            backgroundImage: "linear-gradient(#e5e5e1 1px, transparent 1px), linear-gradient(90deg, #e5e5e1 1px, transparent 1px)",
            backgroundSize: "100px 100px" 
          }} />
          
          <div className="absolute top-12 flex flex-col items-center gap-2 opacity-30">
            <span className="font-mono text-[10px] tracking-[0.5em] text-slate-500">EXHIBITION WALL</span>
            <div className="h-px w-24 bg-slate-400" />
          </div>

          <div className="relative z-10 w-full max-w-2xl px-8 py-20">
            <AnimatePresence mode="wait">
              {!originalUrl ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <UploadPlaceholder onUpload={() => setIsUploadWizardOpen(true)} />
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                  {/* Spotlight Effect */}
                  <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white opacity-20 blur-[80px]" />
                  
                  {/* Tác phẩm trên tường */}
                  <div className="relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-[1.02]">
                    <div className="bg-white p-3 shadow-inner">
                        <PrintPreview imageUrl={originalUrl} />
                    </div>
                  </div>

                  {/* Nhãn thông tin kiểu bảo tàng */}
                  <div className="mt-16 border-l border-slate-300 pl-6 text-left self-start lg:ml-20">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Tác phẩm in</p>
                    <h4 className="mt-1 text-sm font-extrabold uppercase tracking-tighter text-slate-800">
                      {selectedVariant?.size || "Chưa chọn kích thước"}
                    </h4>
                    <p className="text-[10px] italic text-slate-500">Giấy {material} · Golden Art Archives</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-10 left-10 flex items-center gap-4 opacity-40">
            <span className="font-mono text-[9px] tracking-widest">GAF-PRNT-2025</span>
          </div>
        </section>

        {/* Cột Phải: Bảng điều khiển */}
        <aside className="bg-white px-8 py-12 lg:px-12 lg:py-20">
          <header className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-[1px] w-6" style={{ background: M }} />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: M }}>Cấu hình bản in</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-[0.9] tracking-tighter text-slate-900">
              In Nghệ Thuật<br />
              <span style={{ color: "transparent", WebkitTextStroke: `1px ${C}` }}>Chất Lượng Cao</span>
            </h1>
          </header>

          {/* Chọn Kích Thước */}
          <div className="mb-10">
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">01. Kích thước (cm)</h3>
            <div className="flex flex-wrap gap-2">
              {portraitVariants.map((v) => {
                const active = v.sku === variantSku;
                return (
                  <button key={v.sku} onClick={() => setVariantSku(v.sku)}
                    className={`border px-5 py-2 text-xs font-bold transition-all ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                    style={{ borderRadius: 1 }}>
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn Chất Liệu */}
          <div className="mb-10">
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">02. Loại giấy nghệ thuật</h3>
            <div className="grid grid-cols-1 gap-3">
              {product?.options?.materials?.map((opt) => {
                const active = opt.name === material;
                const info = MATERIALS_INFO[opt.name] || {};
                return (
                  <button key={opt.name} onClick={() => setMaterial(opt.name)}
                    className={`flex items-center gap-4 border p-4 text-left transition-all ${active ? 'border-cyan-500 bg-cyan-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                    style={{ borderRadius: 2 }}>
                    <span className="text-xl" style={{ color: active ? C : '#ccc' }}>{info.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">{opt.name}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{info.desc}</p>
                    </div>
                    {opt.price > 0 && <span className="text-[10px] font-mono text-slate-400">+{opt.price} AED</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thanh toán / CTA */}
          <div className="mt-16 border-t border-slate-100 pt-10">
            <div className="mb-6 flex items-end justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Giá trị bản in:</span>
              <div className="text-right">
                <p className="text-3xl font-black tracking-tighter text-slate-900">
                  {quote ? `${quote.total}` : "—"} <span className="text-sm font-normal text-slate-400">AED</span>
                </p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Đã bao gồm thuế VAT</p>
              </div>
            </div>

            <motion.button 
              disabled={!canOrder}
              onClick={handleAddToCart}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 text-sm font-extrabold uppercase tracking-[0.2em] transition-all duration-500 disabled:bg-slate-100 disabled:text-slate-300"
              style={{ background: canOrder ? C : "#f1f1f1", color: canOrder ? "#000" : "#ccc", borderRadius: 2 }}
            >
              {originalUrl ? (canOrder ? "Thêm Vào Giỏ Hàng" : "Chọn Kích Thước") : "Tải Ảnh Để Tiếp Tục"}
            </motion.button>
            
            <p className="mt-4 text-center font-mono text-[8px] tracking-[0.2em] text-slate-400 uppercase">
              Chế tác thủ công tại UAE · Giao hàng 2-3 ngày
            </p>
          </div>
        </aside>
      </main>

      {/* 3. Footer: Sản phẩm liên quan */}
      <section className="border-t border-slate-100 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {RELATED.map((p, i) => (
            <Link key={p.name} to={p.href} className="group relative border-b border-slate-100 p-10 transition-colors hover:bg-slate-50 md:border-b-0 md:border-r">
              <div className="absolute top-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full" style={{ background: p.accent }} />
              <p className="font-mono text-[9px] tracking-[0.3em] text-slate-400 mb-4">LỰA CHỌN {String(i + 1).padStart(2, "0")}</p>
              <h5 className="text-lg font-extrabold tracking-tighter">{p.name}</h5>
              <p className="mt-2 text-xs text-slate-500 line-clamp-2">{p.desc}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: p.accent }}>{p.price}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100">Bắt đầu →</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        onComplete={({ ratio, imageUrl }) => { setSelectedRatio(ratio); setOriginalUrl(imageUrl); }}
      />
    </div>
  );
}
