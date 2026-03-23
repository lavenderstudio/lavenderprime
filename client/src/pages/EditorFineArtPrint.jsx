/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState, useRef } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Page from "../components/Page.jsx";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";

// ─── Bảng màu Bảo tàng ────────────────────────────────────────────────────────
const C = "#00e5ff"; // Cyan
const M = "#e040fb"; // Magenta

// ─── Component hỗ trợ ────────────────────────────────────────────────────────
const Hairline = () => <div className="h-px w-full bg-slate-100" />;

function SectionLabel({ children, icon }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-3 w-[2px]" style={{ background: M }} />
      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
        {children}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
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
        if (res.data.variants?.[0]) setVariantSku(res.data.variants[0].sku);
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
      } catch { setQuote(null); }
    };
    getQuote();
  }, [variantSku, material, quantity]);

  const portraitVariants = useMemo(() => (product?.variants || []).filter(v => v.orientation === "portrait"), [product]);
  const selectedVariant = portraitVariants.find(v => v.sku === variantSku);
  const canOrder = !!(originalUrl && quote && selectedRatio);

  const handleAddToCart = async () => {
    try {
      if (!canOrder) return;
      const sessionId = getSessionId();
      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: "fine-art-print", variantSku,
          config: { material, quantity, transform: { ratio: selectedRatio.id } },
          assets: { originalUrl, previewUrl: "" },
          price: { total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError("Lỗi khi thêm vào giỏ hàng."); }
  };

  return (
    <Page title="Thiết kế bản in nghệ thuật">
      <div className="min-h-screen bg-white">
        
        {/* ─── Header Điều hướng ─── */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:px-12">
          <Link to="/products" className="group flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-slate-400 hover:text-black">
            <span className="transition-transform group-hover:-translate-x-1">←</span> QUAY LẠI GALLERY
          </Link>
          <div className="flex items-center gap-4">
             <span className="font-mono text-[10px] text-slate-300">STUDIO EDITOR V.2025</span>
             <div className="h-4 w-px bg-slate-200" />
             <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: C }} />
          </div>
        </header>

        <div className="grid lg:grid-cols-12 min-h-[calc(100vh-60px)]">
          
          {/* ─── CỘT TRÁI: PREVIEW (Bảo tàng sạch) ─── */}
          <div className="lg:col-span-7 bg-[#fbfbfb] flex flex-col relative border-r border-slate-100">
            <div className="p-8 lg:p-16 flex-1 flex flex-col justify-center">
              
              {/* Tiêu đề dạng Editorial */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-slate-900 mb-4">
                  Bản In <br />
                  <span style={{ WebkitTextStroke: `1.5px ${C}`, color: "transparent" }}>Nghệ Thuật</span>
                </h1>
                <p className="font-mono text-[11px] tracking-[0.3em] text-slate-400 uppercase">
                  Giấy mỹ thuật lưu trữ · Độ phân giải 2400 DPI
                </p>
              </motion.div>

              {/* Vùng Preview */}
              <div className="relative group">
                <AnimatePresence mode="wait">
                  {!originalUrl ? (
                    <motion.button
                      key="upload"
                      onClick={() => setIsUploadWizardOpen(true)}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="w-full aspect-[3/4] border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center gap-4 transition-all hover:bg-white hover:border-cyan-400"
                    >
                      <div className="h-16 w-16 rounded-full border border-slate-100 flex items-center justify-center bg-slate-50 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="1.5"/></svg>
                      </div>
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-400">TẢI TÁC PHẨM LÊN</span>
                    </motion.button>
                  ) : (
                    <motion.div key="image" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="shadow-2xl">
                       <PrintPreview imageUrl={originalUrl} />
                       <button 
                        onClick={() => setIsUploadWizardOpen(true)}
                        className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white font-mono text-[9px] px-4 py-2 tracking-widest hover:bg-cyan-500 transition-colors"
                       >
                         THAY ĐỔI ẢNH
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Thông số kỹ thuật chân trang trái */}
            <div className="border-t border-slate-100 p-6 flex justify-between items-center font-mono text-[10px] text-slate-400 tracking-widest">
                <div className="flex gap-8">
                  <span>RATIO: {selectedRatio?.id || "N/A"}</span>
                  <span>SIZE: {selectedVariant?.size || "N/A"}</span>
                </div>
                <div style={{ color: C }}>UAE ARCHIVAL STANDARDS</div>
            </div>
          </div>

          {/* ─── CỘT PHẢI: CẤU HÌNH (Editorial) ─── */}
          <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col">
            <div className="flex-1 space-y-12">
              
              {/* Section: Kích thước */}
              <section>
                <SectionLabel>01. Kích Thước Bản In</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {portraitVariants.map((v) => (
                    <button
                      key={v.sku}
                      onClick={() => setVariantSku(v.sku)}
                      className={`py-4 px-6 text-left transition-all border ${
                        variantSku === v.sku ? "border-black bg-black text-white" : "border-slate-100 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <p className="font-mono text-[10px] mb-1 opacity-60">PHỔ BIẾN</p>
                      <p className="font-bold text-sm tracking-tighter">{v.size}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Section: Chất liệu */}
              <section>
                <SectionLabel>02. Chất Liệu Giấy</SectionLabel>
                <div className="space-y-2">
                  {product?.options?.materials?.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setMaterial(opt.name)}
                      className={`w-full flex justify-between items-center p-5 border transition-all ${
                        material === opt.name ? "border-cyan-400 bg-cyan-50/30" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-sm text-slate-900">{opt.name}</p>
                        <p className="text-[11px] text-slate-400">Archival pigment ink, {opt.name.toLowerCase()} finish.</p>
                      </div>
                      {material === opt.name && <div className="h-2 w-2 rounded-full" style={{ background: C }} />}
                    </button>
                  ))}
                </div>
              </section>

              {/* Tóm tắt đơn hàng */}
              <section className="bg-slate-50 p-6 space-y-3 font-mono text-[11px]">
                <div className="flex justify-between border-b border-slate-200 pb-2 text-slate-400 uppercase tracking-widest">
                  <span>Hạng mục</span>
                  <span>Chi tiết</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold">
                  <span>SẢN PHẨM</span>
                  <span>FINE ART PRINT</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VẬT LIỆU</span>
                  <span>{material}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>KÍCH THƯỚC</span>
                  <span>{selectedVariant?.size || "---"}</span>
                </div>
              </section>
            </div>

            {/* ─── Footer Action ─── */}
            <div className="mt-12 space-y-4">
              <div className="flex items-end justify-between mb-4">
                <span className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase">Tổng cộng</span>
                <div className="text-right">
                  <span className="text-4xl font-black tracking-tighter leading-none text-slate-900">
                    {quote ? `${quote.total}` : "---"}
                  </span>
                  <span className="ml-1 font-mono text-xs text-slate-400 uppercase">{quote?.currency || "AED"}</span>
                </div>
              </div>

              <button
                disabled={!canOrder}
                onClick={handleAddToCart}
                className={`w-full py-5 font-bold tracking-[0.2em] text-[12px] uppercase transition-all duration-500 relative overflow-hidden group ${
                  canOrder ? "bg-black text-white hover:bg-slate-800" : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
              >
                {canOrder ? (
                  <>
                    <span className="relative z-10">Thêm vào bộ sưu tập →</span>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />
                  </>
                ) : (
                  "Vui lòng tải ảnh lên"
                )}
              </button>
              
              <div className="flex justify-center gap-6 font-mono text-[9px] text-slate-300 tracking-[0.2em]">
                <span>✓ MIỄN PHÍ GIAO HÀNG UAE</span>
                <span>✓ KIỂM ĐỊNH TẠI XƯỞNG</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Tải ảnh */}
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
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white font-mono text-[10px] px-8 py-3 tracking-widest shadow-2xl"
            >
              {error.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  );
}
