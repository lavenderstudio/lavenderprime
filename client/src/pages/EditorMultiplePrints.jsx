/* eslint-disable react-hooks/static-components */
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import MultiUploadWizardModal from "../components/MultiUploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";
import ShinyText from "../components/reactbits/ShinyText.jsx";

const PRODUCT_SLUG = "multiple-prints";
const C = "#00e5ff"; // Cyan Accent
const M = "#e040fb"; // Magenta Accent

// ─── HELPERS ────────────────────────────────────────────────────────────────
function parseCmSize(sizeStr) {
  if (!sizeStr) return null;
  const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
  const [w, h] = cleaned.split("x").map((n) => Number(n));
  return { w, h };
}

function SectionLabel({ children, color = M }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px w-6" style={{ background: color }} />
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color }}>
        {children}
      </span>
    </div>
  );
}

export default function EditorMultiplePrints() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [material, setMaterial] = useState("Matte");
  const [assets, setAssets] = useState([]);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [isMultiWizardOpen, setIsMultiWizardOpen] = useState(false);

  // Load Product
  useEffect(() => {
    api.get(`/products/${PRODUCT_SLUG}`).then((res) => {
      setProduct(res.data);
      const firstPortrait = res.data.variants?.find((v) => v.orientation === "portrait") || res.data.variants?.[0];
      if (firstPortrait) setVariantSku(firstPortrait.sku);
      if (res.data.options?.materials?.[0]) setMaterial(res.data.options.materials[0].name);
    }).catch(err => setError(err.message));
  }, []);

  const materialOptions = useMemo(() => product?.options?.materials || [], [product]);
  const portraitVariants = useMemo(() => (product?.variants || []).filter((v) => v.orientation === "portrait"), [product]);
  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);
  const parsedPrint = parseCmSize(selectedVariant?.size);

  // Pricing
  useEffect(() => {
    if (variantSku) {
      api.post("/pricing/quote", { productSlug: PRODUCT_SLUG, variantSku, options: { material }, quantity: Math.max(1, assets.length) })
        .then(res => setQuote(res.data))
        .catch(() => setQuote(null));
    }
  }, [variantSku, material, assets.length]);

  const handleBulkComplete = (newFiles) => setAssets((prev) => [...prev, ...newFiles]);
  const removeAsset = (idx) => setAssets((prev) => prev.filter((_, i) => i !== idx));

  const handleAddToCart = async () => {
    try {
      const sessionId = getSessionId();
      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: PRODUCT_SLUG, variantSku,
          config: { orientation: "portrait", size: selectedVariant.size, material },
          quantity: assets.length,
          assets: { items: assets.map((a) => ({ originalUrl: a.originalUrl, previewUrl: a.previewUrl || "", transform: a.transform })) },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError(err.message); }
  };

  return (
    <Page title="Museum Curator — Multiple Prints">
      {/* ✅ Triệt tiêu dòng chữ Preview only bằng Global Style Injection */}
      <style>{`
        div[class*="PrintPreview"] p, 
        div[class*="PrintPreview"] span,
        .preview-label-fix p { 
          display: none !important; 
        }
      `}</style>

      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        
        {/* HEADER: Tràn viền với Padding tiêu chuẩn */}
        <section className="px-6 sm:px-12 lg:px-20 pt-24 pb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel color={M}>Fine Art Collection</SectionLabel>
              <h1 className="font-extrabold tracking-tighter text-slate-900 leading-[0.9] mb-2" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
                Multiple<br />
                <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>Prints</span>
              </h1>
              <p className="mt-4 text-slate-400 font-mono text-xs tracking-widest uppercase">Triển lãm cá nhân của bạn bắt đầu tại đây.</p>
            </div>
            <Link to="/products" className="group shrink-0 text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2 mb-4 tracking-widest uppercase">
              ← Quay lại bộ sưu tập
            </Link>
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* MAIN CURATOR GRID */}
        <div className="grid lg:grid-cols-12 w-full min-h-[80vh]">
          
          {/* LEFT: THE GALLERY WALL (Ảnh của khách) */}
          <div className="lg:col-span-7 bg-[#F8F8F8] border-r border-slate-100 p-8 lg:p-20 relative">
             <div className="absolute top-10 left-10 font-mono text-[10vw] font-black text-slate-200/50 select-none leading-none z-0">EXHIBIT</div>
             
             <div className="relative z-10 w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                   <h3 className="font-mono text-[10px] tracking-[0.4em] uppercase text-slate-400">01 — Tác phẩm ({assets.length})</h3>
                   <button onClick={() => setIsMultiWizardOpen(true)} className="px-6 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500 transition-colors">
                     + Thêm ảnh vào triển lãm
                   </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {assets.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsMultiWizardOpen(true)}
                      className="aspect-[16/9] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer group hover:border-cyan-400 transition-all bg-white shadow-sm"
                    >
                      <span className="text-4xl font-light text-slate-200 group-hover:text-cyan-400 mb-4">+</span>
                      <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">Tải lên các khoảnh khắc của bạn</p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {assets.map((slot, idx) => (
                        <motion.div key={idx} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group">
                          <div className="relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-white p-1 transition-transform duration-500 group-hover:scale-[1.02]">
                            <div className="preview-label-fix">
                              <PrintPreview imageUrl={slot.originalUrl} />
                            </div>
                            <button onClick={() => removeAsset(idx)} className="absolute -top-3 -right-3 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">✕</button>
                          </div>
                          <div className="mt-4 flex justify-between items-center px-1">
                             <span className="font-mono text-[9px] text-slate-400 uppercase tracking-tighter">Frame 0{idx+1}</span>
                             <div className="h-px flex-1 mx-4 bg-slate-100" />
                             <span className="font-bold text-[10px] uppercase tracking-widest">{selectedVariant?.size}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>

          {/* RIGHT: CURATOR CONTROLS */}
          <div className="lg:col-span-5 p-10 lg:p-20 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto w-full space-y-16">
              
              {/* Size Selection */}
              <div>
                <SectionLabel>02. Quy cách trưng bày</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  {portraitVariants.map(v => (
                    <button key={v.sku} onClick={() => setVariantSku(v.sku)}
                      className={`py-4 px-2 border text-[11px] font-black tracking-widest transition-all ${variantSku === v.sku ? 'border-black bg-black text-white shadow-xl shadow-black/10' : 'border-slate-100 text-slate-400 hover:border-slate-900'}`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Selection */}
              <div>
                <SectionLabel>03. Chất liệu bề mặt</SectionLabel>
                <div className="space-y-3">
                  {materialOptions.map(opt => (
                    <button key={opt.name} onClick={() => setMaterial(opt.name)}
                      className={`w-full flex justify-between items-center p-5 border transition-all ${material === opt.name ? 'border-cyan-400 bg-cyan-50/20' : 'border-slate-50 opacity-60 hover:opacity-100'}`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-widest">{opt.name}</span>
                      {material === opt.name && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="pt-10 border-t border-slate-100 mt-20">
                <div className="flex items-baseline justify-between mb-8">
                  <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">Định mức đầu tư</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter block">
                      {quote ? `${quote.total.toLocaleString()} ${quote.currency}` : '---'}
                    </span>
                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest italic">Bao gồm VAT & Đóng gói cao cấp</span>
                  </div>
                </div>

                <button disabled={!quote || assets.length === 0} onClick={handleAddToCart}
                  className="w-full py-6 text-[12px] font-black uppercase tracking-[0.4em] transition-all disabled:opacity-20 disabled:grayscale relative overflow-hidden group"
                  style={{ background: 'black', color: 'white' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-magenta-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10">
                    <ShinyText text="Đưa vào giỏ hàng →" speed={3} />
                  </span>
                </button>
                
                <div className="mt-6 grid grid-cols-3 gap-4">
                   {['Bảo mật 100%', 'Vận chuyển Toàn quốc', 'Chất lượng Bảo tàng'].map(text => (
                     <div key={text} className="text-center">
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter leading-tight">{text}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CHẾ TÁC THỦ CÔNG SECTION (Giai đoạn chuyển tiếp) */}
        <section className="py-32 px-10 bg-slate-950 text-white relative w-full overflow-hidden">
           <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-20">
              <div className="flex-1">
                 <SectionLabel color={C}>Craftsmanship</SectionLabel>
                 <h2 className="text-5xl font-extrabold tracking-tight mb-8 leading-tight">Mỗi bản in là một<br/><span style={{ color: "transparent", WebkitTextStroke: `1px ${C}` }}>Di sản.</span></h2>
                 <p className="text-slate-400 font-light leading-relaxed text-lg">Chúng tôi không chỉ in ảnh, chúng tôi chế tác những tác phẩm lưu giữ thời gian. Với công nghệ in 12 màu UltraChrome và giấy Giclée chính hiệu, bức tường của bạn sẽ trở thành một không gian nghệ thuật đích thực.</p>
              </div>
              <div className="w-px h-40 bg-slate-800 hidden md:block" />
              <div className="flex-1 grid grid-cols-2 gap-8">
                 <div>
                    <h4 className="text-cyan-400 font-black text-3xl mb-2">200+</h4>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Năm độ bền màu</p>
                 </div>
                 <div>
                    <h4 className="text-magenta-400 font-black text-3xl mb-2">1200</h4>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">DPI Độ phân giải</p>
                 </div>
              </div>
           </div>
        </section>

        <MultiUploadWizardModal
          isOpen={isMultiWizardOpen}
          onClose={() => setIsMultiWizardOpen(false)}
          onComplete={handleBulkComplete}
        />
      </div>
    </Page>
  );
}
