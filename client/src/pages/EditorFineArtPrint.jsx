/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState, useRef } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";
import { motion, AnimatePresence } from "framer-motion";

// ─── Bảng màu Bảo tàng ──────────────────────────────────────────────────────
const C = "#00e5ff"; // Cyan thuần
const M = "#e040fb"; // Magenta thuần
const DARK = "#020617"; // Slate 950

function SectionLabel({ children, color = "slate-400" }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-px w-4" style={{ background: M }} />
      <p className={`text-[10px] font-mono uppercase tracking-[0.2em] text-${color}`}>
        {children}
      </p>
    </div>
  );
}

// ─── Component: Lựa chọn kích thước (Size) ───────────────────────────────────
function SizePills({ variants, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const active = v.sku === value;
        return (
          <button
            key={v.sku}
            type="button"
            onClick={() => onChange(v.sku)}
            className={`relative overflow-hidden px-5 py-2 text-xs font-bold transition-all duration-300 border
              ${active 
                ? "text-white border-transparent" 
                : "border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900"}`}
            style={{ 
              borderRadius: "2px",
              background: active ? DARK : "transparent"
            }}
          >
            {active && <motion.div layoutId="pill-bg" className="absolute inset-0 z-[-1]" style={{ background: DARK }} />}
            {v.size.replace("cm", " CM")}
          </button>
        );
      })}
    </div>
  );
}

// ─── Component: Lựa chọn chất liệu (Material) ────────────────────────────────
function MaterialTiles({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = opt.name === value;
        return (
          <button
            key={opt.name}
            type="button"
            onClick={() => onChange(opt.name)}
            className={`group flex flex-col items-start justify-between p-4 transition-all duration-500 border
              ${active ? "border-slate-900 bg-slate-50" : "border-slate-100 bg-white hover:border-slate-300"}`}
            style={{ borderRadius: "2px" }}
          >
            <div className="flex w-full justify-between items-start">
              <span className={`text-sm font-extrabold tracking-tight ${active ? "text-slate-900" : "text-slate-400"}`}>
                {opt.name === "Matte" ? "Giấy Mờ (Matte)" : opt.name === "Glossy" ? "Giấy Bóng (Glossy)" : opt.name}
              </span>
              <div className={`h-2 w-2 rounded-full transition-colors ${active ? "" : "bg-transparent border border-slate-200"}`} 
                   style={{ backgroundColor: active ? C : "" }} />
            </div>
            {opt.price > 0 && (
              <span className="mt-4 text-[10px] font-mono text-slate-400">
                + {opt.price} AED
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Component: Upload Placeholder ──────────────────────────────────────────
function UploadPlaceholder({ onUpload }) {
  return (
    <button
      type="button"
      onClick={onUpload}
      className="group relative flex w-full flex-col items-center justify-center overflow-hidden bg-slate-50 py-24 transition-all hover:bg-white border border-dashed border-slate-200"
      style={{ borderRadius: "2px" }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition-transform group-hover:scale-110">
          <svg className="h-6 w-6" style={{ color: M }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Tải Ảnh Của Bạn</p>
        <p className="mt-2 text-[11px] font-mono text-slate-400">Định dạng JPG, PNG hoặc HEIC</p>
      </div>
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" 
           style={{ background: `linear-gradient(45deg, ${C}05, ${M}05)` }} />
    </button>
  );
}

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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products/fine-art-print");
        setProduct(res.data);
        if (res.data.variants?.[0]) setVariantSku(res.data.variants[0].sku);
        const firstMaterial = res.data.options?.materials?.[0];
        if (firstMaterial) setMaterial(firstMaterial.name);
      } catch (err) { setError("Không thể tải thông tin sản phẩm."); }
    };
    load();
  }, []);

  useEffect(() => {
    const getQuote = async () => {
      if (!variantSku) return;
      try {
        const res = await api.post("/pricing/quote", { productSlug: "fine-art-print", variantSku, options: { material }, quantity });
        setQuote(res.data);
      } catch (err) { setQuote(null); }
    };
    getQuote();
  }, [variantSku, material, quantity]);

  const portraitVariants = useMemo(() => (product?.variants || []).filter((v) => v.orientation === "portrait"), [product]);
  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);
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
          config: { orientation: "portrait", size: selectedVariant.size, material, quantity, transform: { ratio: selectedRatio.id, ratioW: selectedRatio.w, ratioH: selectedRatio.h } },
          assets: { originalUrl, previewUrl: "" },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError("Lỗi khi thêm vào giỏ hàng."); }
  };

  return (
    <Page title="Chế tác Bản in Nghệ thuật">
      <div className="min-h-screen bg-white text-slate-900">
        
        {/* ─── Header Điều hướng ─── */}
        <header className="border-b border-slate-100 px-6 py-4 lg:px-12 flex justify-between items-center">
          <Link to="/products" className="group flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 hover:text-black transition-colors">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Trở lại thư viện
          </Link>
          <div className="flex items-center gap-4">
             <span className="h-1 w-1 rounded-full" style={{ background: C }} />
             <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 italic">Museum Quality Standard</span>
          </div>
        </header>

        <main className="grid lg:grid-cols-12 min-h-[calc(100vh-65px)]">
          
          {/* ─── Cột Trái: Preview (Tràn viền) ─── */}
          <div className="lg:col-span-7 bg-[#f8f8f8] relative flex items-center justify-center p-8 lg:p-20 border-r border-slate-100">
            <div className="absolute top-8 left-8 z-10">
               <SectionLabel color="slate-400">Phòng Trưng Bày Trực Tuyến</SectionLabel>
               <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                 Bản In <br />
                 <span style={{ WebkitTextStroke: `1px ${DARK}`, color: "transparent" }}>Nghệ Thuật</span>
               </h1>
            </div>

            <div className="w-full max-w-2xl">
              <AnimatePresence mode="wait">
                {!originalUrl ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <UploadPlaceholder onUpload={() => setIsUploadWizardOpen(true)} />
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                    <div className="shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-white p-4 lg:p-8 transition-transform duration-700 group-hover:scale-[1.02]">
                       <PrintPreview imageUrl={originalUrl} />
                    </div>
                    <button 
                      onClick={() => setIsUploadWizardOpen(true)}
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
                      style={{ borderRadius: "2px" }}
                    >
                      Thay đổi hình ảnh
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thông số kỹ thuật mờ bên dưới */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="font-mono text-[9px] text-slate-300 space-y-1 uppercase tracking-tighter">
                   <p>Fine Art Paper: 310gsm Cotton Rag</p>
                   <p>Inks: UltraChrome PRO12 Pigment</p>
                   <p>Origin: Handcrafted in UAE</p>
                </div>
                {selectedRatio && (
                  <div className="text-right">
                    <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">Tỉ lệ khung hình</p>
                    <p className="text-xl font-black italic" style={{ color: C }}>{selectedRatio.id}</p>
                  </div>
                )}
            </div>
          </div>

          {/* ─── Cột Phải: Cấu hình ─── */}
          <div className="lg:col-span-5 bg-white p-8 lg:p-16 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="mb-12">
                <SectionLabel>Tùy chỉnh tác phẩm</SectionLabel>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                  Chọn kích thước và chất liệu giấy cao cấp để biến bức ảnh của bạn thành một tác phẩm triển lãm thực thụ.
                </p>
              </div>

              {/* Kích thước */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest">Kích thước in</h3>
                  <span className="font-mono text-[10px] text-slate-400 underline uppercase">Bảng size chuẩn</span>
                </div>
                <SizePills variants={portraitVariants} value={variantSku} onChange={setVariantSku} />
              </div>

              {/* Chất liệu */}
              <div className="mb-10">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">Chất liệu giấy</h3>
                <MaterialTiles options={product?.options?.materials || []} value={material} onChange={setMaterial} />
              </div>

              {/* Tóm tắt */}
              <div className="border-t border-slate-100 pt-8 mt-12">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Giá trị chế tác</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tighter">{quote ? quote.total : "—"}</span>
                      <span className="text-sm font-bold uppercase">{quote?.currency || "AED"}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[9px] text-slate-400 uppercase tracking-tighter">
                    <p>Đã bao gồm thuế VAT</p>
                    <p>Giao hàng miễn phí toàn UAE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút Action */}
            <div className="space-y-4">
              {error && (
                <p className="text-[10px] font-bold text-magenta-500 text-center uppercase tracking-widest py-2 bg-magenta-50" style={{ color: M }}>
                  {error}
                </p>
              )}
              
              <button
                disabled={!canOrder}
                onClick={handleAddToCart}
                className={`group relative w-full overflow-hidden py-5 text-xs font-black uppercase tracking-[0.3em] transition-all duration-500
                  ${canOrder ? "text-white" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
                style={{ borderRadius: "2px", background: canOrder ? DARK : "" }}
              >
                {canOrder && (
                  <motion.div 
                    initial={{ x: "-100%" }} 
                    whileHover={{ x: "100%" }} 
                    transition={{ duration: 0.8 }} 
                    className="absolute inset-0 z-0 opacity-20"
                    style={{ background: `linear-gradient(90deg, transparent, ${C}, transparent)` }}
                  />
                )}
                <span className="relative z-10">Thêm vào giỏ hàng — {quote?.total} {quote?.currency}</span>
              </button>

              <div className="flex justify-center gap-8 py-4 border-t border-slate-50">
                 {["Giao hỏa tốc 48h", "Đóng gói an toàn", "Bảo hành màu sắc"].map(text => (
                   <span key={text} className="text-[9px] font-mono text-slate-300 uppercase tracking-tighter italic">✦ {text}</span>
                 ))}
              </div>
            </div>
          </div>
        </main>

        <UploadWizardModal
          isOpen={isUploadWizardOpen}
          onClose={() => setIsUploadWizardOpen(false)}
          onComplete={({ ratio, imageUrl }) => {
            setSelectedRatio(ratio);
            setOriginalUrl(imageUrl);
          }}
        />
      </div>
    </Page>
  );
}
