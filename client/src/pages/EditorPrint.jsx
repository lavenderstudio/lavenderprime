/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";

const C = "#00e5ff"; // Cyan
const M = "#e040fb"; // Magenta

const RELATED = [
  { name: "In & Đóng Khung", desc: "Khung thủ công cao cấp, sẵn treo tường.", price: "từ 189k", img: "/feature/11.avif", href: "/editor/print-frame", tag: "Phổ biến", accent: C },
  { name: "Fine Art Premium", desc: "Giấy mỹ thuật 100% cotton cao cấp.", price: "từ 249k", img: "/feature/12.avif", href: "/editor/fine-art-print", tag: "Nghệ thuật", accent: M },
  { name: "In Canvas Gallery", desc: "Vải canvas bọc khung gỗ tràm.", price: "từ 149k", img: "/feature/8.avif", href: "/editor/canvas", tag: "Gallery", accent: C },
];

export default function EditorFineArtPrint() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [material, setMaterial] = useState("Glossy");
  const [originalUrl, setOriginalUrl] = useState("");
  const [quote, setQuote] = useState(null);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null);

  useEffect(() => {
    api.get("/products/fine-art-print").then(res => {
      setProduct(res.data);
      const v5070 = res.data.variants.find(v => v.size.includes("50x70"));
      if (v5070) setVariantSku(v5070.sku);
    });
  }, []);

  useEffect(() => {
    if (!variantSku) return;
    api.post("/pricing/quote", { productSlug: "fine-art-print", variantSku, options: { material }, quantity: 1 })
      .then(res => setQuote(res.data));
  }, [variantSku, material]);

  const portraitVariants = useMemo(() => (product?.variants || []).filter(v => v.orientation === "portrait"), [product]);
  const selectedVariant = portraitVariants.find(v => v.sku === variantSku);

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      {/* 1. TOP SECTION: STUDIO WORKSPACE (Fixed Height) */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] min-h-[700px] overflow-hidden border-b border-slate-100">
        
        {/* LEFT: MUSEUM DISPLAY */}
        <div className="relative flex-1 bg-[#f4f1eb] flex flex-col items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='0.4'/%3E%3C/svg%3E")` }} />
          
          <AnimatePresence mode="wait">
            {!originalUrl ? (
              <motion.button onClick={() => setIsUploadWizardOpen(true)} className="group flex flex-col items-center gap-6 z-10">
                <div className="w-16 h-16 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-cyan-400 group-hover:text-cyan-400 transition-all">+</div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Tải ảnh lên (50x70)</span>
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative flex flex-col items-center z-10">
                {/* ẢNH TRÀN VIỀN (FULL-BLEED) VỚI ĐỔ BÓNG THỰC TẾ */}
                <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] bg-white p-[1px] clean-preview-container">
                    <PrintPreview imageUrl={originalUrl} />
                </div>
                {/* MUSEUM LABEL */}
                <div className="mt-12 text-center bg-white/40 backdrop-blur-sm p-4 px-8 border border-black/5 rounded-sm">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-slate-400 uppercase mb-1">Golden Art Frames</p>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">{selectedVariant?.size} — {material}</h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#ddd8cc] border-t border-[#bfbab0]" />
        </div>

        {/* RIGHT: CONTROL PANEL */}
        <div className="w-full lg:w-[420px] bg-white flex flex-col border-l border-slate-100 overflow-y-auto">
          <div className="p-10 border-b border-slate-50">
            <Link to="/products" className="text-[9px] font-black tracking-widest text-slate-400 uppercase">← Quay lại</Link>
            <h1 className="text-3xl font-black tracking-tighter uppercase mt-6 leading-none text-slate-900">In Ảnh<br/><span style={{ color: "transparent", WebkitTextStroke: `1px ${C}` }}>Cao Cấp</span></h1>
          </div>

          <div className="p-10 space-y-10 flex-1">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Kích thước</p>
                <div className="flex flex-wrap gap-2">
                  {portraitVariants.map(v => (
                    <button key={v.sku} onClick={() => setVariantSku(v.sku)} className={`px-4 py-2 text-[11px] font-bold border rounded-full transition-all ${v.sku === variantSku ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-slate-500 border-slate-200'}`}>{v.size}</button>
                  ))}
                </div>
             </div>

             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Chất liệu giấy</p>
                <div className="grid grid-cols-1 gap-2">
                  {["Glossy", "Matte", "Satin"].map(m => (
                    <button key={m} onClick={() => setMaterial(m)} className={`flex items-center justify-between p-4 border rounded-xl transition-all ${material === m ? 'border-cyan-400 bg-cyan-50/10' : 'border-slate-100'}`}>
                      <span className="text-[11px] font-black uppercase text-slate-800">{m} Finish</span>
                      <span className="text-cyan-500 text-lg">{material === m ? '●' : '○'}</span>
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="p-10 bg-white border-t border-slate-50 sticky bottom-0">
             <div className="flex justify-between items-end mb-6">
                <span className="text-[10px] font-black uppercase text-slate-400">Thanh toán</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{quote?.total.toLocaleString()} {quote?.currency}</span>
             </div>
             <button disabled={!originalUrl} className={`w-full py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all ${originalUrl ? 'bg-black text-white shadow-2xl shadow-cyan-500/20' : 'bg-slate-100 text-slate-300'}`}>Thêm vào giỏ hàng →</button>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM SECTION: RELATED SERVICES (TRÀN VIỀN) */}
      <section className="w-full bg-white">
        <div className="py-20 px-10 lg:px-20 border-b border-slate-100">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-cyan-500" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-500">Dịch vụ bổ sung</span>
           </div>
           <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900">Có thể bạn quan tâm</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 w-full">
           {RELATED.map((item, idx) => (
             <Link key={idx} to={item.href} className="group relative aspect-[16/10] md:aspect-auto md:h-[500px] overflow-hidden border-r border-slate-100 last:border-r-0">
                <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 p-12 flex flex-col justify-end text-white z-10">
                   <span className="inline-block self-start px-3 py-1 bg-white text-black text-[9px] font-black uppercase tracking-widest mb-4">{item.tag}</span>
                   <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{item.name}</h3>
                   <p className="text-xs text-white/70 mb-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">{item.desc}</p>
                   <span className="font-black text-sm border-b border-white/50 pb-1 w-fit">{item.price}</span>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* CSS FIX LỖI TEXT PREVIEW */}
      <style dangerouslySetInnerHTML={{ __html: `
        .clean-preview-container span, 
        .clean-preview-container p,
        .clean-preview-container div:not(:has(img)) {
          color: transparent !important;
          font-size: 0 !important;
          pointer-events: none !important;
          user-select: none !important;
          background: none !important;
        }
        .clean-preview-container img {
          display: block !important;
          max-width: 100% !important;
          height: auto !important;
        }
      `}} />

      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        onComplete={({ ratio, imageUrl }) => { setSelectedRatio(ratio); setOriginalUrl(imageUrl); }}
      />
    </div>
  );
}
