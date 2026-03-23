/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState, useRef } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";
import ShinyText from "../components/reactbits/ShinyText.jsx";

// ─── Bảng màu bảo tàng ──────────────────────────────────────────────────────
const C = "#00e5ff"; // Cyan
const M = "#e040fb"; // Magenta

// ─── Thành phần UI bổ trợ ───────────────────────────────────────────────────
function SectionLabel({ children, icon }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="h-3 w-[2px]" style={{ background: M }} />
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {children}
      </p>
    </div>
  );
}

function Hairline() {
  return <div className="h-px w-full bg-slate-100" />;
}

// ─── Component chính ────────────────────────────────────────────────────────
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
        if (res.data.options?.materials?.[0]) setMaterial(res.data.options.materials[0].name);
      } catch (err) { setError("Không thể tải thông tin sản phẩm."); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!variantSku) return;
    const getQuote = async () => {
      try {
        const res = await api.post("/pricing/quote", { 
          productSlug: "fine-art-print", 
          variantSku, 
          options: { material }, 
          quantity 
        });
        setQuote(res.data);
      } catch (err) { setQuote(null); }
    };
    getQuote();
  }, [variantSku, material, quantity]);

  const portraitVariants = useMemo(() => (product?.variants || []).filter(v => v.orientation === "portrait"), [product]);
  const selectedVariant = portraitVariants.find(v => v.sku === variantSku);
  const canOrder = !!(originalUrl && quote && selectedRatio);

  const handleAddToCart = async () => {
    try {
      if (!canOrder) return;
      await api.post("/cart/items", {
        sessionId: getSessionId(),
        item: {
          productSlug: "fine-art-print",
          variantSku,
          config: { material, quantity, transform: { ratio: selectedRatio.id } },
          assets: { originalUrl, previewUrl: "" },
          price: { total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError("Lỗi khi thêm vào giỏ hàng."); }
  };

  return (
    <Page title="Chế tác Bản in Nghệ thuật">
      <div className="min-h-screen bg-white text-slate-900 selection:bg-cyan-100">
        
        {/* 1. Header Điều hướng - Tối giản */}
        <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md lg:px-12">
          <Link to="/products" className="group flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Quay lại
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="font-mono text-[10px] tracking-[0.3em] text-slate-300">STUDIO / 002</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <p className="font-mono text-[9px] uppercase tracking-tighter text-slate-400">Trạng thái</p>
              <p className="text-[10px] font-bold text-cyan-500">Đang thiết kế</p>
            </div>
          </div>
        </nav>

        {/* 2. Main Editor - Tràn viền bất đối xứng */}
        <main className="grid lg:grid-cols-12">
          
          {/* CỘT TRÁI: Preview khổng lồ */}
          <div className="relative min-h-[60vh] bg-[#f8f9fa] lg:col-span-7 lg:h-[calc(100vh-64px)]">
            <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-20">
              <AnimatePresence mode="wait">
                {!originalUrl ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex h-full w-full max-w-lg flex-col items-center justify-center border border-dashed border-slate-200 bg-white p-12 text-center"
                  >
                    <div className="mb-8 h-24 w-[1px]" style={{ background: `linear-gradient(to bottom, transparent, ${C}, transparent)` }} />
                    <h2 className="mb-4 text-3xl font-extrabold tracking-tighter">Bắt đầu tác phẩm.</h2>
                    <p className="mb-8 max-w-xs text-sm leading-relaxed text-slate-400 font-medium">
                      Tải lên hình ảnh độ phân giải cao để có chất lượng in phòng trưng bày (Gallery Quality).
                    </p>
                    <button 
                      onClick={() => setIsUploadWizardOpen(true)}
                      className="group relative px-10 py-4 font-bold text-white transition-transform active:scale-95"
                    >
                      <div className="absolute inset-0 bg-slate-900 transition-transform group-hover:scale-105" />
                      <span className="relative z-10 text-xs tracking-widest uppercase">Tải ảnh lên →</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex h-full w-full items-center justify-center"
                  >
                    <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-transform hover:scale-[1.02] duration-700">
                      <PrintPreview imageUrl={originalUrl} />
                      {/* Border giả định khung bảo tàng */}
                      <div className="absolute -inset-4 border border-slate-200 pointer-events-none" />
                    </div>
                    <button 
                      onClick={() => setIsUploadWizardOpen(true)}
                      className="absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center bg-white border border-slate-100 shadow-xl hover:bg-slate-50 transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Metadata góc dưới trái */}
            <div className="absolute bottom-6 left-8 hidden lg:block">
              <div className="flex gap-8 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                <div><p>Hệ màu</p><p className="font-bold text-slate-900">Adobe RGB (1998)</p></div>
                <div><p>Giấy</p><p className="font-bold text-slate-900">{material}</p></div>
                <div><p>Cấp độ</p><p className="font-bold text-slate-900">Fine Art Archival</p></div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Bảng điều khiển (Editorial Layout) */}
          <div className="relative flex flex-col border-l border-slate-100 lg:col-span-5">
            
            {/* Header thông tin */}
            <div className="px-8 py-12 lg:px-16">
              <div className="mb-6 flex items-center gap-3">
                <span className="bg-slate-900 px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase tracking-tighter">Fine Art</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <h1 className="mb-2 text-5xl font-extrabold tracking-tighter text-slate-900 lg:text-6xl">
                Bản In <br />
                <span style={{ color: "transparent", WebkitTextStroke: `1.5px ${C}` }}>Nghệ Thuật</span>
              </h1>
              <p className="text-sm font-medium leading-relaxed text-slate-500">
                Chất lượng phòng trưng bày, mực lưu trữ trên giấy cao cấp nhập khẩu từ Đức.
              </p>
            </div>

            <Hairline />

            {/* Cấu hình sản phẩm */}
            <div className="flex-1 space-y-12 px-8 py-10 lg:px-16">
              
              {/* Kích thước */}
              <section>
                <SectionLabel>01 / Kích thước (cm)</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {portraitVariants.map((v) => (
                    <button
                      key={v.sku}
                      onClick={() => setVariantSku(v.sku)}
                      className={`relative flex flex-col items-center border py-4 transition-all ${
                        variantSku === v.sku 
                          ? "border-slate-900 bg-slate-900 text-white" 
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-extrabold">{v.size.replace("cm", "")}</span>
                      <span className={`mt-1 font-mono text-[8px] uppercase tracking-tighter ${variantSku === v.sku ? "text-slate-400" : "text-slate-300"}`}>Portrait</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Chất liệu */}
              <section>
                <SectionLabel>02 / Chất liệu giấy</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  {product?.options?.materials?.map((opt) => {
                    const active = opt.name === material;
                    return (
                      <button 
                        key={opt.name} 
                        onClick={() => setMaterial(opt.name)}
                        className={`group flex flex-col p-4 text-left transition-all border ${
                          active ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-slate-900" : "text-slate-400"}`}>
                            {opt.name}
                          </span>
                          {active && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-400 group-hover:text-slate-600">
                          {opt.name === "Matte" ? "Bề mặt mờ mịn, không phản chiếu." : "Bề mặt bán bóng, rực rỡ sắc màu."}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Tóm tắt chi phí */}
              <div className="bg-slate-950 p-8 text-white">
                <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 text-center">Tóm tắt báo giá</p>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-white/50 italic font-serif">Product</span>
                    <span className="text-xs font-bold">Fine Art Print</span>
                  </div>
                  <div className="flex items-end justify-between pt-2">
                    <span className="text-xs font-bold text-white/50 italic font-serif">Total</span>
                    <div className="text-right">
                      <span className="block font-mono text-[10px] uppercase text-cyan-400 leading-none mb-1">Thanh toán (AED)</span>
                      <span className="text-4xl font-black tracking-tighter">
                        {quote ? quote.total : "——"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thanh hành động cố định chân trang (Mobile) hoặc Cuối cột (Desktop) */}
            <div className="sticky bottom-0 z-20 border-t border-slate-100 bg-white/95 p-8 backdrop-blur-md lg:px-16">
              {!originalUrl && (
                <p className="mb-4 text-center font-mono text-[9px] font-bold uppercase text-magenta-500 animate-pulse">
                  * Vui lòng tải ảnh để tiếp tục
                </p>
              )}
              <button
                disabled={!canOrder}
                onClick={handleAddToCart}
                className={`group relative h-16 w-full overflow-hidden transition-all active:scale-95 ${
                  canOrder ? "cursor-pointer" : "cursor-not-allowed grayscale opacity-50"
                }`}
              >
                <div className="absolute inset-0 bg-slate-900 transition-transform group-hover:scale-105" />
                <div className="relative flex h-full items-center justify-center gap-3">
                  {canOrder ? (
                    <ShinyText text="THÊM VÀO GIỎ HÀNG →" speed={3} className="text-xs font-bold tracking-[0.2em] text-white" />
                  ) : (
                    <span className="text-xs font-bold tracking-[0.2em] text-white/50">CHƯA HOÀN TẤT</span>
                  )}
                </div>
              </button>
              <div className="mt-6 flex justify-center gap-6">
                 <div className="flex items-center gap-2 opacity-30">
                    <div className="h-1 w-1 bg-slate-900" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">UAE Shipping</span>
                 </div>
                 <div className="flex items-center gap-2 opacity-30">
                    <div className="h-1 w-1 bg-slate-900" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Secure Payment</span>
                 </div>
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

        {/* Thông báo lỗi */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-12 left-1/2 z-[100] -translate-x-1/2 border border-red-200 bg-white px-6 py-3 shadow-2xl"
            >
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  );
}
