/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import { FRAME_OPTIONS } from "../lib/optionsUi.js";
import FramePreview from "../components/FramePreview.jsx";

// Dữ liệu "Câu chuyện liên quan" để tạo sự liền mạch
const RELATED_COLLECTIONS = [
  { name: "Single Canvas", desc: "Sức mạnh của một khoảnh khắc duy nhất.", img: "/feature/11.avif", href: "/editor/canvas", accent: "#00e5ff" },
  { name: "Fine Art", desc: "Chất lượng bảo tàng cho những kỷ niệm vô giá.", img: "/feature/12.avif", href: "/editor/fine-art-print", accent: "#e040fb" }
];

const PRODUCT_SLUG = "collage-frame";

export default function EditorCollage() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame] = useState("Black Wood");
  const [imageCount, setImageCount] = useState(4);
  const [assets, setAssets] = useState([]);
  const [quote, setQuote] = useState(null);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  const allowedCounts = [4, 9, 16];
  const lockedRatioId = "1:1";

  // Khởi tạo dữ liệu
  useEffect(() => {
    api.get(`/products/${PRODUCT_SLUG}`).then(res => {
      setProduct(res.data);
      setVariantSku("COL_SQ_31.5x31.5_4");
    }).catch(err => console.error(err));
  }, []);

  // Sync SKU khi đổi số lượng ảnh
  useEffect(() => {
    const skus = { 4: "COL_SQ_31.5x31.5_4", 9: "COL_SQ_43x43_9", 16: "COL_SQ_54.5x54.5_16" };
    setVariantSku(skus[imageCount]);
  }, [imageCount]);

  // Lấy báo giá
  useEffect(() => {
    if (!variantSku) return;
    api.post("/pricing/quote", { productSlug: PRODUCT_SLUG, variantSku, options: { frame }, quantity: 1 })
       .then(res => setQuote(res.data)).catch(() => setQuote(null));
  }, [variantSku, frame]);

  // Quản lý assets
  useEffect(() => {
    setAssets(prev => {
      const next = [...prev];
      while (next.length < imageCount) next.push({ originalUrl: "", transform: null });
      return next.slice(0, imageCount);
    });
  }, [imageCount]);

  const hasAllUploads = useMemo(() => assets.every(a => a.originalUrl), [assets]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
      
      {/* HEADER ĐẲNG CẤP */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <Link to="/products" className="group flex items-center gap-3">
          <div className="h-px w-8 bg-white/30 group-hover:w-12 group-hover:bg-white transition-all" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Bộ sưu tập</span>
        </Link>
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-black uppercase tracking-[0.2em]">Collage <span className="text-white/30">Curator</span></h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Đang thiết kế</p>
          <p className="text-xs font-bold">{imageCount} Tác phẩm</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-screen pt-20">
        
        {/* VÙNG TRƯNG BÀY TRÀN VIỀN (THE GALLERY) */}
        <div className="relative flex-1 bg-[#111] flex items-center justify-center p-6 lg:p-20 overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65'/%3E%3C/svg%3E")` }} />
            
            <motion.div 
                layout
                className="relative z-10 w-full max-w-[70vh] aspect-square shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
            >
                <FramePreview frame={frame} aspectRatio="1:1" maxWidthClass="w-full">
                    <div className={`grid h-full w-full gap-1 bg-white p-1`} style={{ gridTemplateColumns: `repeat(${Math.sqrt(imageCount)}, 1fr)` }}>
                        {assets.map((slot, idx) => (
                            <motion.div 
                                key={idx} 
                                onClick={() => { setActiveSlotIndex(idx); setIsUploadWizardOpen(true); }}
                                className="relative group cursor-pointer overflow-hidden bg-zinc-100 border border-black/5"
                                whileHover={{ scale: 0.98 }}
                            >
                                {slot.originalUrl ? (
                                    <img src={slot.originalUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <span className="text-2xl font-light text-black">+</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-black">Slot {idx+1}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Thay thế</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </FramePreview>
            </motion.div>

            {/* Decorative Label */}
            <div className="absolute bottom-10 left-10 hidden lg:block">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] leading-loose">
                    Museum Grade Canvas / Archival Ink / Handcrafted Frame<br/>
                    Edition: Unique Collage Series 2024
                </p>
            </div>
        </div>

        {/* BẢNG ĐIỀU KHIỂN (THE CURATOR PANEL) */}
        <aside className="w-full lg:w-[450px] bg-black border-l border-white/10 flex flex-col z-20">
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-16">
                
                {/* 01. LAYOUT */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-[10px] font-black text-amber-500 tracking-widest">01</span>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Cấu trúc câu chuyện</h3>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="flex gap-2">
                        {allowedCounts.map(count => (
                            <button 
                                key={count} 
                                onClick={() => setImageCount(count)}
                                className={`flex-1 py-4 text-[10px] font-black border transition-all ${imageCount === count ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                            >
                                {count} ẢNH
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-[10px] text-white/30 italic">Hệ thống khung Collage hình vuông tỉ lệ 1:1 bảo tàng.</p>
                </section>

                {/* 02. FRAME STYLE */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-[10px] font-black text-amber-500 tracking-widest">02</span>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Chất liệu viền</h3>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {FRAME_OPTIONS.map(opt => (
                            <button 
                                key={opt.id} 
                                onClick={() => setFrame(opt.id)}
                                className={`group flex items-center gap-4 p-3 border transition-all ${frame === opt.id ? 'border-white bg-white/5' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <img src={opt.img} className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${frame === opt.id ? 'text-white' : 'text-white/40'}`}>{opt.id}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-10 bg-zinc-900/50 border-t border-white/10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Giá trị tác phẩm</span>
                        <div className="text-3xl font-black text-white tracking-tighter mt-1">
                            {quote ? `${quote.total.toLocaleString()} ${quote.currency}` : "---"}
                        </div>
                    </div>
                    <div className="text-right">
                         <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Tiến độ</span>
                         <p className="text-xs font-bold text-amber-500">{assets.filter(a => a.originalUrl).length} / {imageCount}</p>
                    </div>
                </div>

                <button 
                    disabled={!hasAllUploads || !quote} 
                    onClick={() => {/* handleAddToCart logic */}}
                    className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 ${hasAllUploads ? 'bg-white text-black hover:tracking-[0.6em] shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                >
                    {hasAllUploads ? "Gửi vào giỏ hàng →" : `Cần thêm ${imageCount - assets.filter(a => a.originalUrl).length} ảnh`}
                </button>
            </div>
        </aside>
      </div>

      {/* SECTION RELATED (CÂU CHUYỆN LIỀN MẠCH) */}
      <section className="w-full bg-[#050505] py-32 px-10 border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-20">
            <p className="text-amber-500 font-mono text-[10px] uppercase tracking-[0.5em] mb-4">Mỗi cách thể hiện mang đến một cảm xúc khác nhau</p>
            <h2 className="text-white text-6xl font-black tracking-tighter uppercase leading-none">Tác phẩm <br/> khác của bạn</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {RELATED_COLLECTIONS.map((item, idx) => (
              <Link key={idx} to={item.href} className="group relative aspect-[16/7] overflow-hidden bg-zinc-900">
                <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                
                {/* Accent Line */}
                <div className="absolute top-0 left-0 bottom-0 w-1 transition-transform duration-500 origin-bottom scale-y-0 group-hover:scale-y-100" style={{ background: item.accent }} />

                <div className="absolute inset-0 p-12 flex flex-col justify-center">
                  <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-2">{item.name}</h3>
                  <p className="text-white/40 text-[10px] max-w-xs uppercase tracking-[0.2em] leading-relaxed mb-8">{item.desc}</p>
                  <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] py-2 border-b border-white/20 w-fit group-hover:border-white transition-colors">Trải nghiệm ngay →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        lockedRatioId={lockedRatioId}
        onComplete={({ ratio, imageUrl }) => {
          setAssets(prev => {
            const next = [...prev];
            next[activeSlotIndex] = { originalUrl: imageUrl, transform: { ratio: ratio.id } };
            return next;
          });
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}} />
    </div>
  );
}
