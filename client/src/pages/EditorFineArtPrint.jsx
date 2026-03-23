/* eslint-disable no-unused-vars */
// client/src/pages/EditorFineArtPrint.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Tường bảo tàng · PrintPreview full-bleed trên tường thật
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionId } from "../lib/session.js";
import UploadWizardModal from "../components/UploadWizardModal.jsx";
import PrintPreview from "../components/PrintPreview.jsx";
const C = "#00e5ff";
const M = "#e040fb";
const RELATED = [
  { name: "In & Đóng Khung", desc: "Khung thủ công cao cấp, sẵn treo tường.", price: "từ 89 AED", img: "/feature/11.avif", href: "/editor/print-frame", tag: "Phổ biến nhất", accent: C },
  { name: "In Canvas", desc: "Canvas bọc gallery, chất lượng triển lãm.", price: "từ 149 AED", img: "/feature/8.avif", href: "/editor/canvas", tag: "Bán chạy", accent: M },
  { name: "In Thông Thường", desc: "Bản in chất lượng cao, giao hàng nhanh.", price: "từ 29 AED", img: "/feature/12.avif", href: "/editor/print", tag: "Tiết kiệm", accent: C },
];
const MATERIALS_INFO = {
  Matte: { icon: "◻", desc: "Không phản sáng, màu sắc sâu và trầm lắng" },
  Glossy: { icon: "◼", desc: "Bề mặt bóng, màu rực rỡ và tươi sáng" },
  Pearl: { icon: "◈", desc: "Ánh kim nhẹ, sang trọng và đặc biệt" },
  Fine: { icon: "◇", desc: "Giấy nghệ thuật bề mặt nhám, như tranh vẽ tay" },
};
function parseCmSize(s) {
  if (!s) return null;
  const [w, h] = s.toLowerCase().replace("cm","").replace("×","x").trim().split("x").map(Number);
  return Number.isFinite(w) && Number.isFinite(h) ? { w, h } : null;
}
// ─── Upload Placeholder ───────────────────────────────────────────────────────
function UploadPlaceholder({ onUpload }) {
  return (
    <motion.button
      type="button"
      onClick={onUpload}
      className="group relative flex flex-col items-center justify-center gap-5 cursor-pointer w-full"
      style={{
        minHeight: 360,
        border: `1px dashed ${C}40`,
        background: `${C}03`,
      }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${C}70`; e.currentTarget.style.background = `${C}06`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${C}40`; e.currentTarget.style.background = `${C}03`; }}
    >
      <div className="relative flex items-center justify-center h-16 w-16">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px dashed ${C}55` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
        <div
          className="h-11 w-11 flex items-center justify-center rounded-full bg-white shadow-sm"
          style={{ border: `1px solid ${C}35` }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"
            stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-extrabold text-slate-800 tracking-tight">Tải ảnh của bạn lên</p>
        <p className="mt-1 text-xs text-slate-600">Chọn tỷ lệ · Cắt ảnh · Xem trước trên tường gallery</p>
      </div>
      <motion.span
        className="px-6 py-2.5 text-xs font-bold text-white"
        style={{ background: C, color: "#0a0a0a", borderRadius: 2, boxShadow: `0 4px 20px ${C}25` }}
        whileHover={{ scale: 1.04 }}
      >
        Chọn Ảnh
      </motion.span>
      <span className="absolute bottom-4 right-5 font-mono text-[10px] text-slate-400">01</span>
    </motion.button>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// TRANG CHÍNH
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
  useEffect(() => { document.title = "In Nghệ Thuật — Golden Art Frames"; }, []);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products/fine-art-print");
        setProduct(res.data);
        const f = res.data.options?.materials?.[0];
        if (f) setMaterial(f.name);
      } catch (err) { setError(err?.response?.data?.message || err.message); }
    };
    load();
  }, []);
  const materialOptions = useMemo(() => product?.options?.materials || [], [product]);
  const portraitVariants = useMemo(
    () => (product?.variants || []).filter((v) => v.orientation === "portrait"),
    [product],
  );
  useEffect(() => {
    if (!variantSku) return;
    const run = async () => {
      try {
        const res = await api.post("/pricing/quote", {
          productSlug: "fine-art-print",
          variantSku,
          options: { material },
          quantity,
        });
        setQuote(res.data);
      } catch (err) { setQuote(null); setError(err?.response?.data?.message || err.message); }
    };
    run();
  }, [variantSku, material, quantity]);
  const selectedVariant = portraitVariants.find((v) => v.sku === variantSku);
  const parsedPrint = parseCmSize(selectedVariant?.size);
  const canOrder = !!(originalUrl && quote && selectedRatio);
  const matInfo = MATERIALS_INFO[material] || {};
  const handleAddToCart = async () => {
    try {
      setError("");
      if (!originalUrl || !quote || !selectedVariant || !selectedRatio)
        return setError("Vui lòng tải ảnh lên và chọn đầy đủ tuỳ chọn.");
      const sessionId = getSessionId();
      await api.post("/cart/items", {
        sessionId,
        item: {
          productSlug: "fine-art-print",
          variantSku,
          config: {
            orientation: "portrait",
            size: selectedVariant.size,
            material,
            quantity,
            transform: { ratio: selectedRatio.id, ratioW: selectedRatio.w, ratioH: selectedRatio.h }
          },
          assets: { originalUrl, previewUrl: "" },
          price: { unit: quote.unit, total: quote.total, currency: quote.currency },
        },
      });
      navigate("/cart");
    } catch (err) { setError(err?.response?.data?.message || err.message); }
  };
  return (
    <>
      <div className="w-full min-h-screen bg-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Accent top */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${C}, ${M})` }} />
        {/* Breadcrumb */}
        <div className="w-full flex items-center justify-between px-6 sm:px-10 lg:px-14 py-3.5"
          style={{ borderBottom: "1px solid #e2e8f0" }}>
          <Link to="/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Sản phẩm
          </Link>
          <span className="hidden sm:block font-mono text-[9px] tracking-[0.3em] text-slate-500">IN NGHỆ THUẬT</span>
        </div>
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-6 py-3 text-sm"
            style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca", color: "#dc2626" }}>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
        {/* Layout chính */}
        {!product ? (
          <div className="w-full p-8 space-y-4">
            {[1,2,3].map(i => <div key={i} className="animate-pulse h-16 rounded-lg bg-slate-100" />)}
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]"
            style={{ minHeight: "calc(100vh - 112px)" }}>
            {/* Cột trái: Tường bảo tàng */}
            <div className="relative flex flex-col" style={{ borderRight: "1px solid #f1f5f9" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 sm:px-10 lg:px-14 py-4"
                style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div className="flex items-center gap-3">
                  <motion.span className="h-2 w-2 rounded-full" style={{ background: C }}
                    animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-600">Xem trước trực tiếp</span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedVariant && (
                    <span className="hidden sm:block font-mono text-[9px] tracking-widest text-slate-600">
                      {selectedVariant.size} · {material}
                    </span>
                  )}
                  {originalUrl && (
                    <button onClick={() => setIsUploadWizardOpen(true)}
                      className="px-3 py-1.5 text-xs font-bold border transition-all hover:bg-cyan-50"
                      style={{ borderColor: C, color: C, borderRadius: 6 }}>
                      ↺ Đổi ảnh
                    </button>
                  )}
                </div>
              </div>
              {/* Vùng tường */}
              <div
                className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  minHeight: 520,
                  background: "linear-gradient(180deg, #f4f1eb 0%, #ece8df 50%, #e2ddd4 100%)",
                }}
              >
                <div className="absolute inset-0 opacity-[0.025]" style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Crect width='1' height='1' fill='%23000'/%3E%3C/svg%3E\")",
                }} />
                <div className="absolute top-8 left-0 right-0 flex items-center px-10 pointer-events-none opacity-20">
                  <div className="h-px flex-1 bg-slate-500" />
                  <span className="mx-5 font-mono text-[8px] tracking-[0.35em] text-slate-600">GALLERY I</span>
                  <div className="h-px flex-1 bg-slate-500" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-7"
                  style={{ background: "linear-gradient(0deg, #ccc7ba 0%, #ddd8cc 100%)", borderTop: "1px solid #bfbab0" }} />
                <div className="absolute top-4 right-6 font-mono text-[9px] tracking-[0.3em] text-slate-600 opacity-25">PHÒNG 01</div>
                <div className="relative z-10 w-full flex items-center justify-center px-6 sm:px-10 lg:px-14 py-12">
                  {!originalUrl ? (
                    <div className="w-full max-w-md">
                      <UploadPlaceholder onUpload={() => setIsUploadWizardOpen(true)} />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className="relative flex flex-col items-center w-full max-w-xl"
                    >
                      <div className="relative flex justify-center w-full mb-0" style={{ height: 28 }}>
                        <div className="w-px h-full bg-slate-500 opacity-20" />
                        <div className="absolute top-0 w-2.5 h-2.5 rounded-full -translate-x-1/2"
                          style={{ background: "#a09880", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                      </div>
                      <div className="absolute pointer-events-none"
                        style={{
                          top: -40, left: "50%", transform: "translateX(-50%)",
                          width: "60%", height: 100,
                          background: "radial-gradient(ellipse at 50% 0%, rgba(255,248,210,0.5) 0%, transparent 75%)",
                        }}
                      />
                      {/* Khung tranh - loại bỏ boxShadow, giữ padding 12px */}
                      <div
                        className="relative"
                        style={{
                          padding: "12px",
                          background: "transparent",
                          width: "100%",
                          borderRadius: "3px",
                        }}
                      >
                        <PrintPreview imageUrl={originalUrl} />
                      </div>
                      <div style={{
                        width: "70%", height: 24, marginTop: 8,
                        background: "radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%)",
                        filter: "blur(12px)",
                      }} />
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 text-center"
                        style={{
                          background: "rgba(255,255,255,0.85)",
                          border: "1px solid rgba(0,0,0,0.08)",
                          backdropFilter: "blur(10px)",
                          padding: "10px 24px",
                          minWidth: 240,
                          borderRadius: "6px",
                        }}
                      >
                        <p className="font-mono text-[8px] tracking-[0.3em] text-slate-600 uppercase mb-1">In Nghệ Thuật</p>
                        <p className="text-xs font-bold text-slate-800">{selectedVariant?.size || "Chưa chọn kích thước"}</p>
                        <p className="font-mono text-[8px] text-slate-600 mt-0.5">{material} · Golden Art Frames</p>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
              {originalUrl && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 flex-wrap px-6 sm:px-10 lg:px-14 py-3.5 bg-white"
                  style={{ borderTop: "1px solid #f1f5f9" }}>
                  {selectedRatio && (
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                      Tỷ lệ {selectedRatio.id}
                    </span>
                  )}
                  {parsedPrint && (
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                      {parsedPrint.w}×{parsedPrint.h}cm
                    </span>
                  )}
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full"
                    style={{ background: `${C}12`, color: C }}>
                    {material}
                  </span>
                  <span className="ml-auto font-mono text-[8px] tracking-widest text-slate-500">
                    GAF © {new Date().getFullYear()}
                  </span>
                </motion.div>
              )}
            </div>
            {/* Cột phải: Panel tùy chỉnh */}
            <div className="lg:sticky lg:top-[72px] lg:self-start lg:max-h-[calc(100vh-72px)] lg:overflow-y-auto bg-white">
              <div className="px-8 py-8" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-6" style={{ background: C }} />
                  <span className="font-mono text-[9px] tracking-[0.25em] uppercase" style={{ color: C }}>Nghệ thuật in ấn</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tighter text-slate-900 leading-tight">
                  In Nghệ Thuật<br />
                  <span style={{ color: "transparent", WebkitTextStroke: `1.5px ${C}` }}>Premium</span>
                </h1>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Mực archival lưu 100+ năm · Giấy gallery cao cấp · Màu sắc chuẩn xác tuyệt đối
                </p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-3xl font-black tracking-tighter text-slate-900">
                    {quote ? `${quote.total}` : "—"}
                  </span>
                  {quote && <span className="text-xs text-slate-600 pb-1">{quote.currency}</span>}
                </div>
              </div>
              <div className="px-8 py-6" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Kích thước</p>
                  {parsedPrint && (
                    <span className="font-mono text-xs text-cyan-600">
                      {parsedPrint.w}×{parsedPrint.h}cm
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {portraitVariants.map((v) => {
                    const active = v.sku === variantSku;
                    return (
                      <motion.button key={v.sku} type="button" onClick={() => setVariantSku(v.sku)}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200"
                        style={{
                          background: active ? "#0f172a" : "#f8fafc",
                          color: active ? "#ffffff" : "#64748b",
                          border: active ? "1.5px solid #0f172a" : "1.5px solid #e2e8f0",
                        }}>
                        {v.size}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <div className="px-8 py-6" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 mb-4">Chất liệu giấy</p>
                <div className="grid grid-cols-2 gap-2">
                  {materialOptions.map((opt) => {
                    const active = opt.name === material;
                    const info = MATERIALS_INFO[opt.name] || {};
                    return (
                      <motion.button key={opt.name} type="button" onClick={() => setMaterial(opt.name)}
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col items-start p-3.5 text-left transition-all duration-200"
                        style={{
                          background: active ? `${C}08` : "#f8fafc",
                          border: active ? `1.5px solid ${C}` : "1.5px solid #e2e8f0",
                          borderRadius: 8,
                        }}>
                        <span className="text-base mb-1" style={{ color: active ? C : "#cbd5e1" }}>
                          {info.icon || "◻"}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{opt.name}</span>
                        {opt.price > 0 && (
                          <span className="text-[10px] text-slate-500 mt-0.5">+{opt.price}</span>
                        )}
                        <span className="text-[10px] text-slate-600 leading-snug mt-0.5 line-clamp-2">
                          {info.desc || ""}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence mode="wait">
                  {matInfo.desc && (
                    <motion.div key={material} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-3 px-3 py-2.5 flex items-start gap-2"
                      style={{ background: `${C}06`, border: `1px solid ${C}18`, borderRadius: 8 }}>
                      <span style={{ color: C }} className="text-xs mt-0.5 shrink-0">✦</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{matInfo.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="px-8 py-5" style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 mb-3">Tóm tắt đơn hàng</p>
                {[
                  ["Kích thước", selectedVariant?.size || "—"],
                  ["Chất liệu", material],
                  ["Số lượng", "1"],
                  ["Tổng cộng", quote ? `${quote.total} ${quote.currency}` : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-slate-600">{k}</span>
                    <span className="text-xs font-bold text-slate-800"
                      style={{ color: k === "Tổng cộng" ? C : "#475569" }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              {/* CTA - Nút xanh thuần, không gradient */}
              <div className="px-8 py-6 sticky bottom-0 bg-white" style={{ borderTop: "1px solid #f1f5f9" }}>
                {!originalUrl ? (
                  <motion.button type="button" onClick={() => setIsUploadWizardOpen(true)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 text-sm font-extrabold tracking-wide text-slate-900"
                    style={{
                      background: C, // Chỉ xanh cyan thuần
                      borderRadius: 12,
                      boxShadow: `0 8px 32px ${C}30`,
                    }}>
                    Tải Ảnh Lên Để Bắt Đầu
                  </motion.button>
                ) : (
                  <motion.button disabled={!canOrder} onClick={handleAddToCart}
                    whileTap={{ scale: canOrder ? 0.98 : 1 }}
                    whileHover={{ scale: canOrder ? 1.02 : 1 }}
                    className="w-full py-4 text-sm font-extrabold tracking-wide transition-all duration-300"
                    style={canOrder ? {
                      background: C, // Chỉ xanh cyan thuần
                      color: "#0a0a0a",
                      borderRadius: 12,
                      boxShadow: `0 8px 32px ${C}40`,
                    } : {
                      background: "#e2e8f0",
                      color: "#64748b",
                      borderRadius: 12,
                      cursor: "not-allowed",
                    }}>
                    {canOrder
                      ? `Thêm vào giỏ · ${quote?.total ?? ""} ${quote?.currency ?? ""}`
                      : "Chọn kích thước để tiếp tục"}
                  </motion.button>
                )}
                {originalUrl && (
                  <button type="button" onClick={() => setIsUploadWizardOpen(true)}
                    className="w-full mt-2 py-2.5 text-xs font-bold text-cyan-600 hover:text-cyan-800 transition-colors">
                    ↺ Đổi ảnh khác
                  </button>
                )}
                <p className="mt-3 text-center text-[10px] text-slate-500">
                  🔒 Bảo mật &nbsp;·&nbsp; Đóng gói cao cấp &nbsp;·&nbsp; Giao tận cửa
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Sản phẩm liên quan */}
        <div className="w-full" style={{ borderTop: "1px solid #f1f5f9" }}>
          <div className="px-6 sm:px-10 lg:px-14 py-14">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8" style={{ background: M }} />
                  <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: M }}>Bộ sưu tập</span>
                </div>
                <h2 className="font-extrabold tracking-tighter text-slate-900"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
                  Tác phẩm khác của bạn
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Mỗi cách thể hiện mang đến một cảm xúc khác nhau.
                </p>
              </div>
              <Link to="/products"
                className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
                Tất cả <span>→</span>
              </Link>
            </div>
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-3"
            style={{ borderTop: "1px solid #f1f5f9" }}>
            {RELATED.map((p, i) => (
              <Link key={p.name} to={p.href}
                className="group relative flex flex-col overflow-hidden bg-white transition-all duration-300"
                style={{ borderRight: i < RELATED.length - 1 ? "1px solid #f1f5f9" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: p.accent }} />
                <div className="relative overflow-hidden bg-slate-50" style={{ height: 220 }}>
                  <img src={p.img} alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{ background: p.accent }} />
                  <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold"
                    style={{ background: p.accent, color: "#0a0a0a", borderRadius: 1 }}>
                    {p.tag}
                  </span>
                  <span className="absolute bottom-4 right-4 font-mono text-xs text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <p className="text-base font-extrabold text-slate-900 tracking-tight">{p.name}</p>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{p.desc}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-extrabold" style={{ color: p.accent }}>{p.price}</span>
                    <span className="text-xs font-bold px-3 py-1.5 border transition-all duration-200"
                      style={{ borderColor: p.accent, color: p.accent, borderRadius: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = p.accent; e.currentTarget.style.color = "#0a0a0a"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = p.accent; }}>
                      Thiết kế →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="w-full h-px bg-slate-100" />
          <div className="px-6 sm:px-10 lg:px-14 py-16 text-center">
            <p className="font-serif italic text-slate-500 max-w-2xl mx-auto"
              style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.9 }}>
              "Một bức ảnh được in đẹp không chỉ là kỷ niệm —<br className="hidden sm:block" />
              đó là tác phẩm nghệ thuật sống trong không gian của bạn."
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-px w-16" style={{ background: `${C}30` }} />
              <span className="font-mono text-[9px] tracking-[0.35em] text-slate-500">GOLDEN ART FRAMES</span>
              <div className="h-px w-16" style={{ background: `${M}30` }} />
            </div>
          </div>
        </div>
      </div>
      <UploadWizardModal
        isOpen={isUploadWizardOpen}
        onClose={() => setIsUploadWizardOpen(false)}
        onComplete={({ ratio, imageUrl }) => { setSelectedRatio(ratio); setOriginalUrl(imageUrl); }}
      />
    </>
  );
}
