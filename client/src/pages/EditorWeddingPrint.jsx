/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import { CANVAS_OPTIONS } from "../lib/optionsUi.js";

// Hệ màu tím nghệ thuật Heritage
const PURPLE_ACCENT = "rgb(224, 64, 251)";

const RELATED_PRODUCTS = [
  { 
    name: "In & Đóng Khung", 
    desc: "Ảnh của bạn, khung thủ công, sẵn treo tường.", 
    img: "/feature/11.avif",
    href: "/editor/print-frame",
    accent: PURPLE_ACCENT
  },
  { 
    name: "Fine Art Print", 
    desc: "Giấy mỹ thuật chất lượng bảo tàng.", 
    img: "/feature/12.avif", 
    href: "/editor/fine-art-print",
    accent: "#ffffff"
  },
  { 
    name: "Khung Collage", 
    desc: "Nhiều ảnh trong một khung đẹp.", 
    img: "/feature/3.avif", 
    href: "/editor/collage-frame",
    accent: PURPLE_ACCENT
  }
];

export default function EditorCanvas() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame] = useState("Stretched"); 
  const [originalUrl, setOriginalUrl] = useState("");
  const [quote, setQuote] = useState(null);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null);

  useEffect(() => {
    api.get("/products/canvas").then(res => {
      setProduct(res.data);
      const firstPortrait = res.data.variants?.find(v => v.orientation === "portrait");
      if (firstPortrait) setVariantSku(firstPortrait.sku);
    });
  }, []);

  useEffect(() => {
    if (!variantSku) return;
    api.post("/pricing/quote", {
      productSlug: "canvas", variantSku, options: { frame }, quantity: 1,
    }).then(res => setQuote(res.data));
  }, [variantSku, frame]);

  const handleAddToCart = async () => {
    const payload = {
      sessionId: getSessionId(),
      productSlug: "canvas", variantSku,
      options: { frame, originalUrl, ratio: selectedRatio },
      quantity: 1
    };
    await api.post("/cart", payload);
    navigate("/cart");
  };

  const portraitVariants = useMemo(() => (product?.variants || []).filter(v => v.orientation === "portrait"), [product]);
  const canOrder = !!(originalUrl && quote);

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden">
      
      {/* 1. VÙNG TRƯNG BÀY & CẤU HÌNH */}
      <div className="flex flex-col lg:flex-row h-[90vh] lg:h-screen overflow-hidden border-b border-white/5">
        
        {/* Gallery 3D Canvas */}
        <div className="relative flex-1 bg-[#0F0F0F] flex flex-col items-center justify-center p-8 lg:p-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ background: `radial-gradient(circle at 50% 50%, ${PURPLE_ACCENT} 0%, transparent 70%)` }} />
          
          <AnimatePresence mode="wait">
            {!originalUrl ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10 text-center">
                <button onClick={() => setIsUploadWizardOpen(true)} className="group flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#E040FB] transition-all duration-500">
                    <span className="text-2xl font-light text-white/30 group-hover:text-[#E040FB]">+</span>
                  </div>
                  <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40 group-hover:text-white transition-colors">Khởi tạo tác phẩm</p>
                </button>
              </motion.div>
            ) : (
              <motion.div key="artwork" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
                <div className="canvas-container-3d">
                  <div className="canvas-3d-box shadow-[50px_80px_100px_-20px_rgba(0,0,0,0.7)]">
                    <div className="canvas-face-front">
                      <img src={originalUrl} alt="Canvas Front" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                    </div>
                    <div className="canvas-face-right" style={{ backgroundImage: `url(${originalUrl})` }} />
                    <div className="canvas-face-bottom" style={{ backgroundImage: `url(${originalUrl})` }} />
                  </div>
                </div>
                <div className="mt-24 text-center">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#E040FB]">Canvas Gallery Wrap</h2>
                  <p className="text-[10px] font-medium text-white/30 mt-3 italic tracking-widest">Hand-stretched on 1.5" sustainable wood frames</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Điều khiển */}
        <div className="w-full lg:w-[440px] bg-[#0A0A0A] border-l border-white/5 flex flex-col z-20">
          <div className="p-10">
            <Link to="/products" className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase hover:text-[#E040FB] transition-colors">← Collections</Link>
            <h1 className="text-5xl font-black tracking-tighter uppercase mt-8 leading-[0.85]">
              Heritage <br/><span className="italic" style={{ color: "transparent", WebkitTextStroke: `1px ${PURPLE_ACCENT}` }}>Canvas</span>
            </h1>
          </div>

          <div className="p-10 space-y-12 overflow-y-auto flex-1 custom-scrollbar">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] bg-[#E040FB] text-white w-5 h-5 flex items-center justify-center rounded-full font-bold">1</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Kích thước bảo tàng</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {portraitVariants.map(v => (
                  <button key={v.sku} onClick={() => setVariantSku(v.sku)} 
                    className={`py-4 px-4 text-[11px] font-bold border transition-all ${v.sku === variantSku ? 'bg-[#E040FB] text-white border-[#E040FB] shadow-[0_0_20px_rgba(224,64,251,0.3)]' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}>
                    {v.size}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] bg-[#E040FB] text-white w-5 h-5 flex items-center justify-center rounded-full font-bold">2</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Hình thức hoàn thiện</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CANVAS_OPTIONS?.map(opt => (
                  <button key={opt.id} onClick={() => setFrame(opt.id)} 
                    className={`flex flex-col gap-3 p-3 border transition-all ${frame === opt.id ? 'border-[#E040FB] bg-[#E040FB]/5' : 'border-white/5 hover:bg-white/5'}`}>
                    <img src={opt.img} className="w-full aspect-square object-cover grayscale opacity-50" alt="" />
                    <span className="text-[10px] font-black uppercase text-center tracking-widest">{opt.id}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="p-10 border-t border-white/5 bg-[#0D0D0D]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Total Investment</span>
                <div className="text-4xl font-black text-[#E040FB] tracking-tighter mt-1">
                    {quote ? `${quote.total.toLocaleString()} ${quote.currency}` : "---"}
                </div>
              </div>
            </div>
            <button disabled={!canOrder} onClick={handleAddToCart} 
              className={`w-full py-6 text-[11px] font-black uppercase tracking-[0.5em] transition-all duration-500 ${canOrder ? 'bg-white text-black hover:bg-[#E040FB] hover:text-white shadow-2xl' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>
              {canOrder ? "Add to Archive →" : "Upload artwork"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. ART INSTALLATION DECOR (MODULE MỚI) */}
      <section className="w-full py-40 px-10 border-t border-white/5 bg-[#0F0F0F] relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-10 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-7xl md:text-9xl font-bold tracking-tighter leading-none mb-10 opacity-10 select-none">THE<br />GALLERY</h2>
            <p className="text-xl md:text-3xl text-white/80 leading-relaxed italic font-serif">
              "Mỗi bức ảnh không chỉ là một tờ giấy in, đó là một mảnh linh hồn của buổi lễ, được lưu giữ trong sự tĩnh lặng của nghệ thuật."
            </p>
          </div>
          <div className="flex flex-col items-end border-r-2 border-[#E040FB] pr-8 mb-4">
             <span className="text-6xl font-black text-[#E040FB] leading-none">99%</span>
             <span className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase mt-2">Color Accuracy</span>
          </div>
        </div>
        {/* Decorative blur for the module */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E040FB]/5 blur-[120px] rounded-full -mr-48 -mt-48" />
      </section>

      {/* 3. SECTION RELATED (DI SẢN VĨNH CỬU) */}
      <section className="w-full bg-[#050505] py-32 px-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="max-w-screen-2xl mx-auto relative z-10">
          <div className="mb-20">
             <p className="text-[#E040FB] font-mono text-[11px] uppercase tracking-[0.6em] mb-4 italic">The Heritage Collection</p>
             <h2 className="text-white text-6xl md:text-8xl font-black tracking-tighter uppercase leading-tight">Dịch vụ <br/> <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>Tương hỗ</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12">
            {RELATED_PRODUCTS.map((item, idx) => (
              <Link key={idx} to={item.href} className="group relative aspect-[3/4] overflow-hidden bg-zinc-900 shadow-2xl">
                <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{ background: item.accent }} />
                <div className="absolute inset-0 p-12 flex flex-col justify-end">
                  <span className="font-mono text-[10px] text-[#E040FB] mb-3 tracking-widest">{String(idx + 1).padStart(2, '0')}</span>
                  <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-3">{item.name}</h3>
                  <p className="text-white/50 text-[11px] mb-8 leading-relaxed uppercase tracking-widest">{item.desc}</p>
                  <div className="flex items-center gap-4 text-white text-[10px] font-black tracking-[0.3em] uppercase transition-all group-hover:translate-x-3">
                     View Exhibit <span className="text-xl">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CSS DÀNH RIÊNG */}
      <style dangerouslySetInnerHTML={{ __html: `
        .canvas-container-3d { perspective: 2500px; padding: 20px; }
        .canvas-3d-box { 
          position: relative; width: 380px; height: 570px;
          transform-style: preserve-3d; 
          transform: rotateY(-25deg) rotateX(15deg) rotateZ(-2deg);
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .canvas-3d-box:hover { transform: rotateY(-15deg) rotateX(10deg) rotateZ(0deg); }
        .canvas-face-front { position: relative; width: 100%; height: 100%; z-index: 2; background: #222; overflow: hidden; }
        .canvas-face-right {
          position: absolute; top: 0; right: 0; bottom: 0; width: 45px;
          background-size: cover; background-position: right center;
          transform: rotateY(90deg); transform-origin: right;
          filter: brightness(0.6) contrast(1.2); z-index: 1;
        }
        .canvas-face-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; height: 45px;
          background-size: cover; background-position: center bottom;
          transform: rotateX(-90deg); transform-origin: bottom;
          filter: brightness(0.4) contrast(1.2); z-index: 1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${PURPLE_ACCENT}; }
      `}} />

      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        onComplete={({ ratio, imageUrl }) => { 
          setSelectedRatio(ratio); 
          setOriginalUrl(imageUrl); 
          setIsUploadWizardOpen(false);
        }}
      />
    </div>
  );
}
