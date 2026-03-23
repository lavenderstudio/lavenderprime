/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import FramePreview from "../components/FramePreview.jsx";
import { FRAME_OPTIONS, MAT_OPTIONS } from "../lib/optionsUi.js";
import { MAT_CM } from "../lib/matSizes.js";
import ShinyText from "../components/reactbits/ShinyText.jsx";

// ✅ Theme tinh chỉnh cho trải nghiệm Bảo tàng Tương lai
const GOLD = "#D4AF37";
const CYAN = "#00e5ff";
const BORDER_GLASS = "rgba(255, 255, 255, 0.1)";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseCmSize(sizeStr) {
  if (!sizeStr) return null;
  const cleaned = sizeStr.toLowerCase().replace("cm", "").replace("×", "x").trim();
  const [w, h] = cleaned.split("x").map((n) => Number(n));
  return { w, h };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MuseumLabel({ children, accent = CYAN }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-[1px] w-8" style={{ background: accent }} />
      <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/50">
        {children}
      </span>
    </div>
  );
}

const RELATED_PRODUCTS = [
  { name: "Fine Art Print", label: "Museum Grade", img: "/feature/12.avif", href: "/editor/fine-art-print", color: CYAN },
  { name: "Canvas Pro", label: "Texture Focus", img: "/feature/8.avif", href: "/editor/canvas", color: GOLD },
  { name: "Mini Frames", label: "Desktop Art", img: "/feature/3.avif", href: "/editor/mini-frames", color: "#e040fb" },
];

export default function EditorPrintPortraitMuseum() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantSku, setVariantSku] = useState("");
  const [frame, setFrame] = useState("Black Wood");
  const [mat, setMat] = useState("Classic");
  const [originalUrl, setOriginalUrl] = useState("");
  const [quote, setQuote] = useState(null);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null);

  // Load product
  useEffect(() => {
    api.get("/products/print-and-frame").then((res) => {
      setProduct(res.data);
      const firstPortrait = res.data.variants.find((v) => v.orientation === "portrait");
      if (firstPortrait) setVariantSku(firstPortrait.sku);
    });
  }, []);

  // Fetch quote
  useEffect(() => {
    if (variantSku) {
      api.post("/pricing/quote", {
        productSlug: "print-and-frame",
        variantSku,
        options: { frame, mat },
        quantity: 1,
      }).then(res => setQuote(res.data));
    }
  }, [variantSku, frame, mat]);

  const portraitVariants = useMemo(
    () => (product?.variants || []).filter((v) => v.orientation === "portrait"),
    [product]
  );

  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);
  const parsedPrint = parseCmSize(selectedVariant?.size);

  const handleAddToCart = async () => {
    const sessionId = getSessionId();
    await api.post("/cart/items", {
      sessionId,
      item: {
        productSlug: "print-and-frame",
        variantSku,
        config: { orientation: "portrait", size: selectedVariant.size, frame, mat, transform: { ratio: selectedRatio.id } },
        assets: { originalUrl, previewUrl: "" },
        price: { unit: quote.unit, total: quote.total, currency: quote.currency },
      },
    });
    navigate("/cart");
  };

  return (
    <Page title="Bảo tàng Chế tác - Print & Frame">
      <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
        
        {/* ✅ CSS HACK: LOẠI BỎ CHỮ "PREVIEW ONLY" TRONG TOÀN BỘ COMPONENT */}
        <style>{`
          div[class*="FramePreview"] p, 
          div[class*="FramePreview"] span,
          div[class*="MiniFramePreview"] p { 
            display: none !important; 
          }
          .museum-shadow {
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7), 0 30px 60px -30px rgba(0,0,0,0.8);
          }
        `}</style>

        {/* ── HEADER ── */}
        <header className="relative z-20 pt-20 px-10 lg:px-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MuseumLabel accent={GOLD}>Curated Exhibition</MuseumLabel>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
              PRINT &<br />
              <span style={{ color: "transparent", WebkitTextStroke: `1px ${CYAN}` }}>FRAME</span>
            </h1>
          </motion.div>
          <Link to="/products" className="mb-4 text-xs font-bold tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors">
            [ Quay lại bộ sưu tập ]
          </Link>
        </header>

        {/* ── MAIN VIEWPORT (Tràn viền) ── */}
        <main className="grid lg:grid-cols-12 w-full mt-16 border-y border-white/5">
          
          {/* TRÁI: KHÔNG GIAN TRIỂN LÃM */}
          <div className="lg:col-span-7 bg-[#080808] relative min-h-[700px] flex items-center justify-center p-12 lg:p-24 overflow-hidden border-r border-white/5">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" 
                 style={{ background: `radial-gradient(circle at 50% 50%, #1a1a1a 0%, transparent 80%)` }} />
            <div className="absolute top-10 left-10 text-[180px] font-black text-white/[0.02] select-none uppercase">Studio</div>

            <AnimatePresence mode="wait">
              {!originalUrl ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="relative z-10 w-full max-w-md group cursor-pointer"
                  onClick={() => setIsUploadWizardOpen(true)}
                >
                  <div className="aspect-[3/4] border border-white/10 bg-white/[0.02] backdrop-blur-3xl flex flex-col items-center justify-center transition-all group-hover:border-cyan-500/50">
                    <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-light text-white/40">+</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Thêm kiệt tác của bạn</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 museum-shadow transition-transform duration-1000 hover:scale-[1.02]"
                >
                  <FramePreview
                    imageUrl={originalUrl}
                    frame={frame}
                    mat={mat}
                    maxWidthClass="max-w-[85vh]"
                  />
                  {/* Ánh sáng đèn Spotlight giả lập bảo tàng */}
                  <div className="absolute -top-20 inset-x-0 h-40 bg-gradient-to-b from-white/10 to-transparent blur-3xl pointer-events-none" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PHẢI: BẢNG ĐIỀU KHIỂN CÔNG NGHỆ */}
          <div className="lg:col-span-5 bg-[#050505] p-10 lg:p-20 flex flex-col">
            <div className="flex-1 space-y-16">
              
              {/* Size Select */}
              <section>
                <MuseumLabel>01. Cấu hình kích thước</MuseumLabel>
                <div className="flex flex-wrap gap-3">
                  {portraitVariants.map((v) => (
                    <button key={v.sku} onClick={() => setVariantSku(v.sku)}
                      className={`px-6 py-4 text-[11px] font-bold tracking-widest uppercase transition-all border
                        ${variantSku === v.sku ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </section>

              {/* Frame Select */}
              <section>
                <MuseumLabel>02. Vật liệu khung</MuseumLabel>
                <div className="grid grid-cols-3 gap-4">
                  {FRAME_OPTIONS.map((opt) => (
                    <button key={opt.id} onClick={() => setFrame(opt.id)}
                      className={`group relative p-4 border transition-all ${frame === opt.id ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/5 bg-white/[0.02] opacity-40 hover:opacity-100'}`}
                    >
                      <img src={opt.img} className="w-10 h-10 rounded-full mx-auto mb-3 object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                      <div className="text-[9px] font-black uppercase tracking-tighter text-center">{opt.id}</div>
                      {frame === opt.id && <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400" />}
                    </button>
                  ))}
                </div>
              </section>

              {/* Mat Select */}
              <section>
                <MuseumLabel>03. Lớp nền nghệ thuật (Mat)</MuseumLabel>
                <div className="grid grid-cols-4 gap-2">
                  {MAT_OPTIONS.map((opt) => (
                    <button key={opt.id} onClick={() => setMat(opt.id)}
                      className={`py-3 border text-[9px] font-bold uppercase tracking-widest transition-all
                        ${mat === opt.id ? 'border-white bg-white text-black' : 'border-white/10 text-white/30 hover:text-white'}`}
                    >
                      {opt.id}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Price & Action */}
            <div className="mt-20 pt-10 border-t border-white/10">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Giá chế tác</p>
                  <div className="text-4xl font-light tracking-tighter">
                    {quote ? `${quote.total.toLocaleString()} ${quote.currency}` : "---"}
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Kích thước in</p>
                    <p className="font-mono text-cyan-400">{parsedPrint?.w} × {parsedPrint?.h} CM</p>
                </div>
              </div>

              <button 
                disabled={!originalUrl || !quote} 
                onClick={handleAddToCart}
                className="w-full py-6 relative overflow-hidden group disabled:opacity-20"
              >
                <div className="absolute inset-0 bg-white transition-transform duration-500 group-hover:translate-y-[-100%]" />
                <div className="absolute inset-0 bg-cyan-500 translate-y-[100%] transition-transform duration-500 group-hover:translate-y-0" />
                <span className="relative z-10 text-black text-[11px] font-black uppercase tracking-[0.4em] transition-colors duration-500 group-hover:text-white">
                  <ShinyText text="Đưa vào bộ sưu tập →" speed={3} />
                </span>
              </button>
            </div>
          </div>
        </main>

        {/* ── CHẾ TÁC THỦ CÔNG SECTION ── */}
        <section className="py-40 px-10 lg:px-24 bg-[#0a0a0a] border-b border-white/5">
           <div className="max-w-4xl">
              <MuseumLabel accent={GOLD}>Artisan Standard</MuseumLabel>
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-10">
                Lưu giữ <span className="text-cyan-400">linh hồn</span> của bức ảnh trong từng thớ gỗ.
              </h2>
              <p className="text-white/40 text-xl font-light leading-relaxed max-w-2xl">
                Không chỉ đơn thuần là in ấn, chúng tôi tạo ra những vật phẩm trưng bày đẳng cấp bảo tàng. 
                Sử dụng mực in Pigment 12 màu và khung gỗ sồi nhập khẩu, mỗi tác phẩm là một di sản bền vững 100 năm.
              </p>
           </div>
        </section>

        {/* ── RELATED PRODUCTS (Impressive Labels) ── */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3">
          {RELATED_PRODUCTS.map((item, i) => (
            <Link key={i} to={item.href} className="group relative h-[600px] overflow-hidden border-r border-white/5 last:border-0">
              <img src={item.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-700" />
              
              {/* Nhãn gây ấn tượng */}
              <div className="absolute top-10 left-10 overflow-hidden">
                <motion.div initial={{ x: -100 }} whileInView={{ x: 0 }} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase">{item.label}</span>
                </motion.div>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
                <h3 className="text-4xl font-black tracking-tighter uppercase mb-2 transform transition-transform group-hover:scale-110 duration-500">{item.name}</h3>
                <div className="w-0 h-[1px] group-hover:w-20 transition-all duration-700" style={{ background: item.color }} />
              </div>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <span className="text-[9px] font-bold tracking-[0.5em] uppercase">[ Khám phá ]</span>
              </div>
            </Link>
          ))}
        </section>

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
    </Page>
  );
}
