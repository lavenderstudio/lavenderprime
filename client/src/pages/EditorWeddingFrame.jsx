/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import { FRAME_OPTIONS } from "../lib/optionsUi.js";
import ShinyText from "../components/reactbits/ShinyText.jsx";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import WeddingFramePreview from "../components/WeddingFramePreview.jsx";
import PersonalisationForm from "../components/PersonalisationForm.jsx";

// ─── HELPERS ────────────────────────────────────────────────────────────────
function MuseumLabel({ children }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-[1px] w-8 bg-black/20" />
      <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-black/60">
        {children}
      </span>
    </div>
  );
}

const GALLERY_COLLECTION = [
  { name: "Timeless Canvas", tag: "Most Popular", img: "/feature/8.avif", href: "/editor/canvas" },
  { name: "Acrylic Glass", tag: "Modern Edge", img: "/feature/12.avif", href: "/editor/fine-art-print" },
  { name: "Legacy Wood", tag: "Handcrafted", img: "/feature/3.avif", href: "/editor/collage-frame" },
];

export default function EditorWeddingFrame() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame] = useState("Black Wood");
  const [quantity] = useState(1);
  const [originalUrl, setOriginalUrl] = useState("");
  const [quote, setQuote] = useState(null);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [personalization, setPersonalization] = useState({});
  const lockedRatioId = "2:3";

  useEffect(() => {
    api.get("/products/wedding-frame").then((res) => {
      setProduct(res.data);
      const firstPortrait = res.data.variants.find((v) => v.orientation === "portrait");
      if (firstPortrait) setVariantSku(firstPortrait.sku);
      const fields = res.data?.personalizationConfig?.fields || [];
      if (fields.length) {
        const initial = {};
        fields.forEach((f) => { initial[f.key] = ""; });
        setPersonalization(initial);
      }
    });
  }, []);

  useEffect(() => {
    if (variantSku) {
      api.post("/pricing/quote", { productSlug: "wedding-frame", variantSku, options: { frame }, quantity })
        .then(res => setQuote(res.data));
    }
  }, [variantSku, frame, quantity]);

  const portraitVariants = useMemo(() => (product?.variants || []).filter((v) => v.orientation === "portrait"), [product]);
  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);

  const handleAddToCart = async () => {
    const sessionId = getSessionId();
    await api.post("/cart/items", {
      sessionId,
      item: {
        productSlug: "wedding-frame", variantSku,
        config: { orientation: "portrait", size: selectedVariant.size, frame, quantity, transform: { ratio: "2:3", ratioW: 2, ratioH: 3 } },
        personalization: personalization,
        assets: { originalUrl, previewUrl: "" },
        price: { unit: quote.unit, total: quote.total, currency: quote.currency },
      },
    });
    navigate("/cart");
  };

  return (
    <Page title="Nghệ Thuật Triển Lãm Cưới">
      {/* 
         FIX: Sử dụng relative và overflow-clip để chặn scroll ngang ảo.
         Dùng calc để tính toán lại lề chính xác, triệt tiêu lỗi lệch phải.
      */}
      <div className="relative bg-[#FDFDFD] text-black font-light left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-x-hidden">
        
        <style>{`
          /* Loại bỏ dòng chữ Preview Only và các thông báo khác */
          div[class*="WeddingFramePreview"] p:last-child,
          div[class*="WeddingFramePreview"] span:contains("Preview"),
          div[class*="WeddingFramePreview"] [class*="text-slate-400"],
          .preview-notice { 
            display: none !important; 
          }
          
          /* Ẩn các text mặc định từ component con */
          div[class*="WeddingFramePreview"] p, 
          div[class*="WeddingFramePreview"] span { 
            display: none !important; 
          }
          
          /* Cho phép hiển thị layer cá nhân hóa */
          .personalization-layer, 
          .personalization-layer *, 
          [class*="personalization"] { 
            display: block !important; 
          }

          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; }
          
          /* Chỉnh lại căn giữa cho Hero để tránh lệch do scrollbar */
          .full-bleed-fix {
            width: 100vw;
            position: relative;
            left: 50%;
            right: 50%;
            margin-left: -50vw;
            margin-right: -50vw;
          }
        `}</style>

        {/* 1. HERO GALLERY SECTION */}
        <section className="flex flex-col lg:flex-row border-b border-black/[0.05] min-h-[95vh] w-full">
          
          {/* Trái: Vùng trưng bày */}
          <div className="lg:w-2/3 relative bg-[#F2F2F2] flex items-center justify-center p-6 lg:p-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(0,0,0,0.03)_0%,_transparent_70%)] pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {originalUrl ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] max-w-full"
                >
                  <WeddingFramePreview
                    imageUrl={originalUrl} frame={frame}
                    groomName={personalization.groomName} brideName={personalization.brideName}
                    locationText={personalization.location} weddingDateText={personalization.weddingDate}
                    message={personalization.message}
                  />
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setIsUploadWizardOpen(true)}
                  className="z-10 w-[280px] h-[420px] lg:w-[350px] lg:h-[525px] border border-black/[0.05] bg-white flex flex-col items-center justify-center gap-6 group transition-all"
                >
                  <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.5em] text-black/40 uppercase">Tải lên hình ảnh</span>
                </motion.button>
              )}
            </AnimatePresence>

            <div className="absolute bottom-10 left-10 hidden lg:block border-l border-black/10 pl-6">
               <p className="font-mono text-[9px] text-black/30 tracking-widest uppercase italic">Curated Edition</p>
               <p className="text-xl font-bold tracking-tighter text-black/80">FINE-ART-2026</p>
            </div>
          </div>

          {/* Phải: Bảng điều khiển */}
          <div className="lg:w-1/3 border-l border-black/[0.05] flex flex-col bg-white">
            <div className="p-8 lg:p-16 overflow-y-auto h-full custom-scrollbar">
              <MuseumLabel>01. Kích thước</MuseumLabel>
              <div className="grid grid-cols-2 gap-2 mb-10">
                {portraitVariants.map((v) => (
                  <button key={v.sku} onClick={() => setVariantSku(v.sku)}
                    className={`py-4 border text-[10px] font-bold tracking-[0.2em] transition-all ${variantSku === v.sku ? 'bg-black text-white border-black' : 'border-black/5 text-black/40 hover:border-black/20'}`}>
                    {v.size}
                  </button>
                ))}
              </div>

              <MuseumLabel>02. Loại khung</MuseumLabel>
              <div className="grid grid-cols-3 gap-6 mb-10">
                {FRAME_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setFrame(opt.id)}
                    className="flex flex-col items-center gap-3 group">
                    <div className={`w-full aspect-square rounded-full overflow-hidden border transition-all p-1 ${frame === opt.id ? 'border-black scale-105' : 'border-transparent opacity-40'}`}>
                      <img src={opt.img} className="w-full h-full object-cover rounded-full" alt="" />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-tighter text-black/50">{opt.id.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              <MuseumLabel>03. Cá nhân hóa</MuseumLabel>
              <div className="space-y-4 mb-10">
                <PersonalisationForm
                  enabled={true}
                  fields={product?.personalizationConfig?.fields || []}
                  values={personalization}
                  onChange={(key, value) => setPersonalization((prev) => ({ ...prev, [key]: value }))}
                />
              </div>

              <div className="pt-8 border-t border-black/5">
                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-mono text-[9px] text-black/30 tracking-[0.3em] uppercase">Thành tiền</span>
                  <span className="text-3xl font-bold tracking-tighter">
                    {quote ? `${quote.total.toLocaleString()} ${quote.currency}` : '---'}
                  </span>
                </div>
                <button 
                  disabled={!originalUrl || !quote} 
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-black/90 disabled:opacity-10"
                >
                  <ShinyText text="Thêm vào bộ sưu tập →" speed={3} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MID SECTION */}
        <section className="py-32 px-10 md:px-24 bg-[#F9F9F9] border-b border-black/5 w-full">
           <div className="flex flex-col md:flex-row items-center gap-16 max-w-[1440px] mx-auto">
              <div className="md:w-1/2 text-left">
                <h2 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none italic">
                  Di sản <br />
                  <span className="text-black/10">vĩnh cửu.</span>
                </h2>
              </div>
              <div className="md:w-1/2">
                <p className="text-black/60 text-xl leading-relaxed max-w-lg mb-8">
                  Sự kết hợp hoàn hảo giữa công nghệ in nghệ thuật và đôi bàn tay khéo léo của nghệ nhân Việt.
                </p>
                <div className="flex gap-12">
                   <div>
                     <p className="text-2xl font-bold tracking-tighter">Archival</p>
                     <p className="text-black/30 text-[10px] tracking-[0.2em] uppercase">Tiêu chuẩn bảo tàng</p>
                   </div>
                   <div className="w-[1px] h-12 bg-black/10" />
                   <div>
                     <p className="text-2xl font-bold tracking-tighter">Handmade</p>
                     <p className="text-black/30 text-[10px] tracking-[0.2em] uppercase">Chế tác thủ công</p>
                   </div>
                </div>
              </div>
           </div>
        </section>

        {/* 3. RELATED PRODUCTS */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {GALLERY_COLLECTION.map((item, i) => (
              <Link key={i} to={item.href} className="group relative h-[70vh] overflow-hidden border-r border-black/[0.05] block bg-white">
                <img src={item.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-10 right-10">
                   <span className="px-4 py-2 border border-black/10 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase bg-white/80 backdrop-blur-sm">
                     {item.tag}
                   </span>
                </div>

                <div className="absolute bottom-16 left-12">
                   <p className="font-mono text-[9px] text-black/50 tracking-[0.4em] uppercase mb-2">Collection</p>
                   <h3 className="text-4xl font-bold tracking-tighter text-black uppercase">
                     {item.name}
                   </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <UploadWizardModal
          isOpen={isUploadWizardOpen}
          onClose={() => setIsUploadWizardOpen(false)}
          lockedRatioId={lockedRatioId}
          onComplete={({ ratio, imageUrl }) => {
            setOriginalUrl(imageUrl);
            setIsUploadWizardOpen(false);
          }}
        />
      </div>
    </Page>
  );
}
