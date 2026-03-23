/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import FramePreview from "../components/FramePreview.jsx";
import { CANVAS_OPTIONS } from "../lib/optionsUi.js";

// Sửa đường dẫn ảnh thành đường dẫn tuyệt đối (bắt đầu bằng /) để không bị lỗi khi chuyển trang
const RELATED_CANVAS = [
  { 
    name: "In & Đóng Khung", 
    desc: "Ảnh của bạn, khung thủ công, sẵn treo tường.", 
    img: "/feature/11.avif", // Dùng path gốc
    href: "/editor/print-frame",
    accent: "#00e5ff" // Cyan từ HomePage
  },
  { 
    name: "Fine Art Print", 
    desc: "Giấy mỹ thuật chất lượng bảo tàng.", 
    img: "/feature/12.avif", 
    href: "/editor/fine-art-print",
    accent: "#e040fb" // Magenta từ HomePage
  },
  { 
    name: "Khung Collage", 
    desc: "Nhiều ảnh trong một khung đẹp.", 
    img: "/feature/3.avif", 
    href: "/editor/collage-frame",
    accent: "#00e5ff"
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
    }).catch(err => console.error("Lỗi lấy sản phẩm:", err));
  }, []);

  useEffect(() => {
    if (!variantSku) return;
    api.post("/pricing/quote", {
      productSlug: "canvas",
      variantSku,
      options: { frame },
      quantity: 1,
    }).then(res => setQuote(res.data)).catch(() => {});
  }, [variantSku, frame]);

  const handleAddToCart = async () => {
    try {
      const payload = {
        sessionId: getSessionId(),
        productSlug: "canvas",
        variantSku,
        options: { frame, originalUrl, ratio: selectedRatio },
        quantity: 1
      };
      await api.post("/cart", payload);
      navigate("/cart");
    } catch (err) {
      alert("Lỗi thêm vào giỏ hàng.");
    }
  };

  const portraitVariants = useMemo(() => (product?.variants || []).filter(v => v.orientation === "portrait"), [product]);
  const selectedVariant = portraitVariants.find(v => v.sku === variantSku);
  const canOrder = !!(originalUrl && quote);

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        
        {/* VÙNG TRƯNG BÀY (GALLERY PREVIEW) */}
        <div className="relative flex-1 bg-[#ebe8e0] flex flex-col items-center justify-center p-8 lg:p-20 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65'/%3E%3C/svg%3E")` }} />
          
          <AnimatePresence mode="wait">
            {!originalUrl ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center z-10">
                <button onClick={() => setIsUploadWizardOpen(true)} className="group flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-black transition-all duration-500">
                    <span className="text-2xl font-light text-slate-400 group-hover:text-black">+</span>
                  </div>
                  <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-slate-400 group-hover:text-black transition-colors">Tải ảnh lên</p>
                </button>
              </motion.div>
            ) : (
              <motion.div key="artwork" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative flex flex-col items-center z-10">
                
                {frame === "Stretched" ? (
                  /* FIX LỖI BO GÓC TRÊN BÊN PHẢI */
                  <div className="canvas-wrapper">
                    <div className="canvas-3d shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]">
                      <div className="canvas-front">
                        <img src={originalUrl} alt="Preview" className="w-full h-auto block shadow-lg" />
                      </div>
                      <div className="canvas-side-right" style={{ backgroundImage: `url(${originalUrl})` }} />
                      <div className="canvas-side-bottom" style={{ backgroundImage: `url(${originalUrl})` }} />
                    </div>
                  </div>
                ) : (
                  <div className="canvas-clean-container shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)]">
                    <FramePreview imageUrl={originalUrl} frame={frame} maxWidthClass="max-h-[65vh]" />
                  </div>
                )}

                <div className="mt-12 text-center">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800">Premium Museum Quality</h2>
                  <p className="text-[10px] font-medium text-slate-400 mt-2 italic tracking-widest">{selectedVariant?.size} • {frame}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BẢNG ĐIỀU KHIỂN (CONTROLS) */}
        <div className="w-full lg:w-[440px] bg-white border-l border-slate-100 flex flex-col z-20 shadow-2xl">
          <div className="p-10 border-b border-slate-50">
            <Link to="/products" className="text-[10px] font-black tracking-widest text-slate-400 uppercase hover:text-black transition-colors">← Bộ sưu tập</Link>
            <h1 className="text-4xl font-black tracking-tighter uppercase mt-6 leading-[0.85] text-slate-900">
              Canvas <br/><span style={{ color: "transparent", WebkitTextStroke: "1px #1a1a1a" }}>Bọc Khung</span>
            </h1>
          </div>

          <div className="p-10 space-y-12 overflow-y-auto flex-1 custom-scrollbar">
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-4">
                01. Kích thước <div className="h-px flex-1 bg-slate-100" />
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {portraitVariants.map(v => (
                  <button key={v.sku} onClick={() => setVariantSku(v.sku)} className={`py-3 px-4 text-[11px] font-bold border transition-all ${v.sku === variantSku ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}>
                    {v.size}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-4">
                02. Hoàn thiện <div className="h-px flex-1 bg-slate-100" />
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {CANVAS_OPTIONS?.map(opt => (
                  <button key={opt.id} onClick={() => setFrame(opt.id)} className={`flex flex-col gap-3 p-3 border transition-all ${frame === opt.id ? 'border-black bg-slate-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <img src={opt.img} className="w-full aspect-square object-cover" alt="" />
                    <span className="text-[10px] font-black uppercase text-center tracking-widest">{opt.id}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="p-10 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Giá ước tính</span>
                <div className="text-3xl font-black text-slate-900 tracking-tighter mt-1">{quote ? `${quote.total.toLocaleString()} ${quote.currency}` : "---"}</div>
              </div>
            </div>
            <button disabled={!canOrder} onClick={handleAddToCart} className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 ${canOrder ? 'bg-black text-white hover:tracking-[0.5em] shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              {canOrder ? "Xác nhận đơn hàng →" : "Vui lòng tải ảnh"}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION RELATED (ĐÃ SỬA LỖI HIỂN THỊ HÌNH ẢNH) */}
      <section className="w-full bg-black py-24 px-10">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-amber-500 font-mono text-[10px] uppercase tracking-[0.5em] mb-4 underline underline-offset-8">Mở rộng không gian</p>
              <h2 className="text-white text-5xl font-black tracking-tighter uppercase leading-none">Dịch vụ <br/> liên quan</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {RELATED_CANVAS.map((item, idx) => (
              <Link key={idx} to={item.href} className="group relative aspect-[4/5] overflow-hidden bg-zinc-900 border border-white/5">
                {/* LƯU Ý: Dùng đường dẫn / tuyệt đối để đảm bảo hiển thị đúng ở mọi route */}
                <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                
                {/* Đường line accent kiểu HomePage */}
                <div className="absolute top-0 left-0 right-0 h-1 transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100" style={{ background: item.accent }} />

                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <span className="font-mono text-[10px] text-white/40 mb-2">{String(idx + 1).padStart(2, '0')}</span>
                  <h3 className="text-white text-2xl font-black uppercase tracking-tighter mb-2">{item.name}</h3>
                  <p className="text-white/40 text-[10px] mb-6 line-clamp-2 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                  <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] py-2 border-b border-white/20 w-fit group-hover:border-white transition-colors">Khám phá →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .canvas-wrapper { perspective: 2000px; padding: 40px; }
        .canvas-3d { 
          position: relative; 
          transform-style: preserve-3d; 
          transform: rotateY(-20deg) rotateX(10deg);
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .canvas-3d:hover { transform: rotateY(-5deg) rotateX(5deg); }
        .canvas-front { position: relative; z-index: 2; backface-visibility: hidden; }
        
        /* Sửa lỗi bo góc bằng cách sử dụng clip-path và tinh chỉnh origin */
        .canvas-side-right {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 40px;
          background-size: cover;
          background-position: right center;
          transform: rotateY(90deg);
          transform-origin: right;
          filter: brightness(0.7) contrast(1.1);
          z-index: 1;
        }
        .canvas-side-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 40px;
          background-size: cover;
          background-position: center bottom;
          transform: rotateX(-90deg);
          transform-origin: bottom;
          filter: brightness(0.5) contrast(1.1);
          z-index: 1;
        }
        .canvas-clean-container span, .canvas-clean-container p { display: none !important; }
      `}} />

      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        onComplete={({ ratio, imageUrl }) => { setSelectedRatio(ratio); setOriginalUrl(imageUrl); }}
      />
    </div>
  );
}
