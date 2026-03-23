/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import MiniFramePreview from "../components/MiniFramePreview.jsx";
import { MINI_FRAME_MAT as MINI_FRAME_TYPE_OPTIONS, MINIFRAME_FRAME_OPTIONS } from "../lib/optionsUi.js";
import ShinyText from "../components/reactbits/ShinyText.jsx";

// ✅ Theme Tokens
const C = "#00e5ff"; // cyan
const M = "#e040fb"; // magenta

// ─── HELPERS ────────────────────────────────────────────────────────────────
function Hairline({ gradient = false }) {
  return <div className="w-full h-px" style={{ background: gradient ? `linear-gradient(90deg, ${C}, ${M})` : `${C}40` }} />;
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

// ─── RELATED PRODUCTS DATA (Updated with Descriptions) ──────────────────────
const RELATED_EXP = [
  { 
    name: "Fine Art Print", 
    desc: "Giấy in mỹ thuật 230gsm với độ tái tạo màu sắc cực cao.",
    img: "/feature/12.avif", 
    href: "/editor/fine-art-print", 
    accent: C 
  },
  { 
    name: "Canvas Gallery", 
    desc: "Bề mặt vải canvas vân nổi, tạo chiều sâu cho tác phẩm hội họa.",
    img: "/feature/8.avif", 
    href: "/editor/canvas", 
    accent: M 
  },
  { 
    name: "Collage Frame", 
    desc: "Kết hợp nhiều câu chuyện trong cùng một khung hình nghệ thuật.",
    img: "/feature/3.avif", 
    href: "/editor/collage-frame", 
    accent: C 
  },
];

export default function EditorMiniFrame() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame] = useState("Black Wood");
  const [mat, setMat] = useState("Classic");
  const [quantity, setQuantity] = useState(1);
  const [assets, setAssets] = useState([]);
  const [quote, setQuote] = useState(null);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  useEffect(() => {
    api.get(`/products/mini-frames`).then((res) => {
      setProduct(res.data);
      const variants = res.data.variants || [];
      const initial = variants.find((v) => v.orientation === "portrait") || variants[0];
      if (initial) setVariantSku(initial.sku);
    });
  }, []);

  const allVariants = useMemo(() => product?.variants || [], [product]);

  useEffect(() => {
    if (variantSku) {
      api.post("/pricing/quote", { productSlug: "mini-frames", variantSku, options: { frame, mat }, quantity })
        .then(res => setQuote(res.data));
    }
  }, [variantSku, frame, mat, quantity]);

  const requiredUploads = useMemo(() => {
    const pc = product?.purchaseConfig?.uploads;
    if (!pc?.enabled) return 0;
    return pc.perUnit ? quantity : (pc.fixedCount || 1);
  }, [product, quantity]);

  useEffect(() => {
    setAssets(prev => {
      const next = [...prev];
      while (next.length < requiredUploads) next.push({ originalUrl: "", previewUrl: "", transform: null });
      if (next.length > requiredUploads) next.length = requiredUploads;
      return next;
    });
  }, [requiredUploads]);

  const handleAddToCart = async () => {
    const sessionId = getSessionId();
    const selectedVariant = allVariants.find(v => v.sku === variantSku);
    await api.post("/cart/items", {
      sessionId,
      item: {
        productSlug: "mini-frames", variantSku,
        config: { orientation: selectedVariant?.orientation || "portrait", size: selectedVariant?.size, frame, mat },
        quantity,
        assets: { items: assets.map(a => ({ originalUrl: a.originalUrl, previewUrl: a.previewUrl, transform: a.transform })) },
        price: { unit: quote.unit, total: quote.total, currency: quote.currency }
      }
    });
    navigate("/cart");
  };

  return (
    <Page title="Chế tác Mini Frames">
      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        
        {/* HEADER SECTION - Full Width Padded */}
        <section className="px-6 sm:px-12 lg:px-20 pt-24 pb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel color={M}>Museum Quality</SectionLabel>
              <h1 className="font-extrabold tracking-tighter text-slate-900 leading-[0.9] mb-2" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
                Mini Frame<br />
                <span style={{ color: "transparent", WebkitTextStroke: `2px ${C}` }}>Collection</span>
              </h1>
            </div>
            <Link to="/products" className="group shrink-0 text-sm font-bold text-slate-400 transition hover:text-slate-900 flex items-center gap-2 mb-4">
              Quay lại cửa hàng <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </section>

        <Hairline gradient />

        {/* MAIN EDITOR GRID - Full Width */}
        <div className="grid lg:grid-cols-12 w-full">
          
          {/* PREVIEW AREA (LEFT) */}
          <div className="lg:col-span-7 bg-[#fcfcfc] border-r border-slate-100 flex items-center justify-center p-8 lg:p-20 relative min-h-[600px]">
             <div className="absolute top-10 left-10 font-mono text-[120px] font-black text-slate-100 select-none leading-none">01</div>
             
             <div className="relative z-10 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-12">
                <AnimatePresence mode="wait">
                  {assets.map((slot, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="relative group cursor-pointer"
                      onClick={() => { setActiveSlotIndex(idx); setIsUploadWizardOpen(true); }}
                    >
                      {slot.originalUrl ? (
                        <div className="relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] transition-transform duration-700 group-hover:scale-[1.03]">
                          <MiniFramePreview imageUrl={slot.originalUrl} frame={frame} mat={mat} />
                          <style>{`
                            div[class*="MiniFramePreview"] p, div[class*="MiniFramePreview"] span { display: none !important; }
                          `}</style>
                        </div>
                      ) : (
                        <div className="aspect-square border border-slate-200 flex flex-col items-center justify-center bg-white hover:border-cyan-400 transition-all group">
                           <span className="text-2xl font-light text-slate-300 group-hover:text-cyan-400">+</span>
                           <span className="font-mono text-[9px] mt-4 tracking-[0.2em] text-slate-400 uppercase">Tải ảnh lên</span>
                        </div>
                      )}
                      <div className="mt-4 flex justify-between items-baseline border-t border-slate-100 pt-2">
                        <span className="font-mono text-[9px] text-slate-300 tracking-tighter uppercase">Slot 0{idx+1}</span>
                        {slot.originalUrl && <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Thay đổi</span>}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
          </div>

          {/* CONTROLS AREA (RIGHT) */}
          <div className="lg:col-span-5 p-10 lg:p-16 flex flex-col justify-center bg-white">
            <div className="space-y-12">
              <div>
                <SectionLabel>01. Kích Thước Bản In</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {allVariants.map(v => (
                    <button key={v.sku} onClick={() => setVariantSku(v.sku)}
                      className={`px-5 py-3 text-[11px] font-bold tracking-widest transition-all ${variantSku === v.sku ? 'bg-black text-white' : 'border border-slate-100 text-slate-400 hover:border-slate-900'}`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>02. Chất Liệu Khung</SectionLabel>
                <div className="grid grid-cols-3 gap-3">
                  {MINIFRAME_FRAME_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setFrame(opt.id)}
                      className={`flex flex-col items-center gap-3 p-4 border transition-all ${frame === opt.id ? 'border-cyan-400 bg-cyan-50/20' : 'border-slate-50 bg-slate-50/50 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={opt.img} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-center">{opt.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>03. Kiểu Bo (Mat)</SectionLabel>
                <div className="flex gap-2">
                  {MINI_FRAME_TYPE_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setMat(opt.id)}
                      className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all ${mat === opt.id ? 'border-black bg-black text-white' : 'border-slate-100 text-slate-400'}`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-8">
                  <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">Tổng cộng</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">
                    {quote ? `${quote.total.toLocaleString()} ${quote.currency}` : '---'}
                  </span>
                </div>

                <button disabled={!quote || assets.some(a => !a.originalUrl)} onClick={handleAddToCart}
                  className="w-full py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-30 disabled:grayscale"
                  style={{ background: `linear-gradient(90deg, ${C}, ${M})`, color: 'white' }}
                >
                  <ShinyText text="Hoàn tất & Đặt hàng →" speed={3} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CHẾ TÁC THỦ CÔNG SECTION - Full Width */}
        <section className="py-32 px-10 sm:px-16 lg:px-24 bg-slate-950 text-white overflow-hidden relative w-full">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="w-full h-full" style={{ background: `radial-gradient(circle, ${M} 0%, transparent 70%)` }} />
          </div>
          <div className="max-w-3xl relative z-10">
             <SectionLabel color={C}>Nghệ thuật & Thủ công</SectionLabel>
             <h2 className="text-5xl font-extrabold tracking-tighter leading-tight mb-8">
               Chất lượng <span style={{ color: "transparent", WebkitTextStroke: `1px ${C}` }}>Gallery</span> cho không gian của bạn.
             </h2>
             <p className="text-white/50 leading-relaxed text-lg font-light">
               Mỗi khung ảnh không chỉ là vật trang trí, mà là một lời cam kết về độ bền vững. Chúng tôi sử dụng giấy in mỹ thuật 230gsm và khung gỗ nhập khẩu để đảm bảo bức ảnh của bạn đẹp như ngày đầu tiên trong suốt nhiều thập kỷ.
             </p>
          </div>
        </section>

        {/* ✅ RELATED PRODUCTS SECTION (Full Width & Descriptions) */}
        <section className="bg-white border-t border-slate-100 overflow-hidden w-full">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {RELATED_EXP.map((item, i) => (
              <Link key={i} to={item.href} className="group relative h-[500px] overflow-hidden border-r border-slate-100 last:border-r-0 block">
                <img 
                  src={item.img} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={item.name} 
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-transform duration-500 group-hover:-translate-y-4">
                   <span className="font-mono text-[10px] text-white/50 tracking-[0.4em] uppercase mb-4">Chế tác khác</span>
                   <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">{item.name}</h3>
                   <p className="text-white/60 text-sm font-light max-w-[250px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                     {item.desc}
                   </p>
                   <div className="mt-8 h-[2px] w-12 transition-all duration-500" style={{ background: item.accent }} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <UploadWizardModal
          isOpen={isUploadWizardOpen}
          onClose={() => setIsUploadWizardOpen(false)}
          lockedRatioId="1:1"
          onComplete={({ ratio, imageUrl }) => {
            setAssets(prev => {
              const next = [...prev];
              next[activeSlotIndex] = { originalUrl: imageUrl, transform: { ratio: ratio.id, ratioW: ratio.w, ratioH: ratio.h } };
              return next;
            });
            setIsUploadWizardOpen(false);
          }}
        />
      </div>
    </Page>
  );
}
