/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
// client/src/components/UploadWizardModal.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { RATIOS } from "../lib/ratios.js";
import { getCroppedBlob } from "../lib/cropImage.js";
import { uploadToCloudinary } from "../lib/cloudinaryUpload.js";

// ─── Bảng màu đồng bộ trang chủ ─────────────────────────────────────────────
const C  = "#00e5ff";   // Cyan thuần
const M  = "#e040fb";   // Magenta thuần
const DARK = "#020617"; // Slate 950

// ─── Stepper: Tối giản kiểu bảo tàng ────────────────────────────────────────
function Stepper({ step, totalSteps }) {
  const labels =
    totalSteps === 2
      ? ["Chọn Ảnh", "Hoàn Tất"]
      : ["Định Dạng", "Cắt & Tải Lên", "Xem Trước"];

  return (
    <div className="flex items-center gap-6">
      {labels.map((label, i) => {
        const num = i + 1;
        const active = step === num;
        const done = step > num;

        return (
          <div key={label} className="flex items-center gap-3">
            <span 
              className="font-mono text-[10px] tracking-widest transition-colors duration-300"
              style={{ color: active ? M : done ? C : "#475569" }}
            >
              {String(num).padStart(2, "0")}
            </span>
            <span 
              className="hidden lg:block font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300"
              style={{ color: active ? "white" : "#475569" }}
            >
              {label}
            </span>
            {i < labels.length - 1 && <div className="h-px w-4 bg-slate-800" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Ratio Card: Đẳng cấp Gallery ──────────────────────────────────────────
function RatioCard({ ratio, selected, onClick }) {
  const boxW = 40;
  const boxH = Math.max(16, Math.round((boxW * ratio.h) / ratio.w));

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center border-r border-slate-100 py-8 last:border-r-0 transition-all hover:bg-slate-50"
    >
      {selected && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: C }} />
      )}
      <div className="mb-4 flex h-16 items-center justify-center">
        <div
          style={{
            width: boxW,
            height: boxH,
            borderColor: selected ? C : "#cbd5e1",
            background: selected ? `${C}10` : "transparent",
          }}
          className="border-2 transition-all duration-300"
        />
      </div>
      <span className={`font-mono text-[10px] tracking-widest uppercase ${selected ? "font-bold text-slate-900" : "text-slate-400"}`}>
        {ratio.label}
      </span>
    </button>
  );
}

// ─── DropZone ──────────────────────────────────────────────────────────────
function DropZone({ onFile }) {
  const inputRef = useRef(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="group flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-200 py-16 transition-all hover:border-cyan-400 hover:bg-cyan-50/30"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="mb-4 text-3xl opacity-40 group-hover:opacity-100 transition-opacity">[ ◉¯]</div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
        Kéo thả hoặc <span className="text-slate-900 font-bold underline">Chọn ảnh</span>
      </p>
      <p className="mt-2 text-[10px] text-slate-300">JPG, PNG, WEBP (Tối đa 20MB)</p>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────
export default function UploadWizardModal({ isOpen, onClose, onComplete, lockedRatioId = null }) {
  const totalSteps = lockedRatioId ? 2 : 3;
  const [step, setStep] = useState(1);
  const [selectedRatioId, setSelectedRatioId] = useState("3:2");
  const [fileMeta, setFileMeta] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [localSrc, setLocalSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const effectiveRatioId = useMemo(() => lockedRatioId || selectedRatioId, [lockedRatioId, selectedRatioId]);
  const selectedRatio = useMemo(() => RATIOS.find((r) => r.id === effectiveRatioId) || RATIOS[0], [effectiveRatioId]);

  const reset = () => {
    setStep(1); setSelectedRatioId("3:2"); setFileMeta(null); setImageUrl("");
    if (localSrc) URL.revokeObjectURL(localSrc);
    setLocalSrc(""); setCrop({ x: 0, y: 0 }); setZoom(1); setUploading(false);
  };

  const close = () => { reset(); onClose(); };
  useEffect(() => { if (isOpen) setStep(1); }, [isOpen]);
  if (!isOpen) return null;

  const onPickFile = (file) => {
    if (localSrc) URL.revokeObjectURL(localSrc);
    setLocalSrc(URL.createObjectURL(file));
  };

  const saveCropAndUpload = async () => {
    try {
      setUploading(true);
      const blob = await getCroppedBlob(localSrc, croppedPixels, "image/jpeg", 0.95);
      const croppedFile = new File([blob], `art-${Date.now()}.jpg`, { type: "image/jpeg" });
      const uploaded = await uploadToCloudinary({ file: croppedFile, folder: "gallery-prints" });
      setFileMeta(uploaded);
      setImageUrl(uploaded.url);
      setStep(lockedRatioId ? 2 : 3);
    } catch (err) {
      setUploadError("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const cropStep = (lockedRatioId && step === 1) || (!lockedRatioId && step === 2);
  const previewStep = (lockedRatioId && step === 2) || (!lockedRatioId && step === 3);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" onClick={close} />

      <div className="relative flex h-full w-full max-w-5xl flex-col bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] sm:h-[85vh] sm:border sm:border-slate-100">
        
        {/* Header: Thanh điều hướng tối tối giản */}
        <div className="flex shrink-0 items-center justify-between bg-slate-950 px-6 py-4 sm:px-10">
          <div className="flex items-center gap-8">
            <h2 className="font-extrabold tracking-tighter text-white text-xl">
              ART <span style={{ color: C }}>WIZARD</span>
            </h2>
            <div className="h-4 w-px bg-slate-800" />
            <Stepper step={step} totalSteps={totalSteps} />
          </div>
          <button onClick={close} className="text-white/40 hover:text-white transition-colors font-mono text-xs tracking-widest">
            [ ĐÓNG ]
          </button>
        </div>

        {/* Body: Tràn viền và kẻ ô */}
        <div className="flex-1 overflow-y-auto">
          
          {/* STEP 1: Chọn tỉ lệ */}
          {!lockedRatioId && step === 1 && (
            <div className="h-full flex flex-col">
              <div className="p-10 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-500">Giai đoạn 01</span>
                <h3 className="mt-2 text-3xl font-extrabold tracking-tighter text-slate-900">Chọn Định Dạng Khung</h3>
              </div>
              <div className="grid flex-1 grid-cols-2 border-t border-b border-slate-100 lg:grid-cols-3">
                {RATIOS.map((r) => (
                  <RatioCard key={r.id} ratio={r} selected={r.id === selectedRatioId} onClick={() => setSelectedRatioId(r.id)} />
                ))}
              </div>
              <div className="p-8 flex justify-center">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-slate-950 px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:scale-105 active:scale-95"
                >
                  Tiếp Tục →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Cắt ảnh */}
          {cropStep && (
            <div className="h-full flex flex-col p-6 sm:p-10">
              {!localSrc ? (
                <DropZone onFile={onPickFile} />
              ) : (
                <div className="flex h-full flex-col gap-6 lg:flex-row">
                  <div className="relative flex-1 min-h-[300px] border border-slate-200 bg-slate-50">
                    <Cropper
                      image={localSrc} crop={crop} zoom={zoom}
                      aspect={selectedRatio.w / selectedRatio.h}
                      onCropChange={setCrop} onZoomChange={setZoom}
                      onCropComplete={(_, pix) => setCroppedPixels(pix)}
                    />
                  </div>
                  <div className="w-full lg:w-72 space-y-6">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Độ Phóng Đại</label>
                      <input 
                        type="range" min={1} max={3} step={0.01} value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="mt-2 w-full accent-cyan-400"
                      />
                    </div>
                    <div className="border-l-2 border-cyan-400 pl-4 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider">Tỉ lệ đã chọn</p>
                      <p className="text-2xl font-black text-slate-900">{selectedRatio.label}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={saveCropAndUpload}
                        disabled={uploading}
                        className="w-full bg-slate-950 py-4 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-cyan-500"
                      >
                        {uploading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN & TẢI LÊN"}
                      </button>
                      <button onClick={() => setLocalSrc("")} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
                        Thay đổi ảnh khác
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Xem trước */}
          {previewStep && (
            <div className="h-full flex flex-col items-center justify-center p-10">
               <div className="relative mb-10 max-w-lg shadow-2xl border-[12px] border-white shadow-slate-200">
                  <img src={imageUrl} alt="Final" className="max-h-[50vh] w-auto object-contain" />
                  <div className="absolute -bottom-6 -right-6 bg-magenta-500 p-4 text-white" style={{ background: M }}>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-tighter">Verified Art</p>
                  </div>
               </div>
               <div className="text-center">
                 <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Tác phẩm đã sẵn sàng</h3>
                 <p className="mt-2 font-mono text-[11px] text-slate-400 uppercase tracking-widest">Chất lượng in: Fine Art Archive</p>
                 <div className="mt-8 flex gap-4 justify-center">
                    <button onClick={() => setStep(lockedRatioId ? 1 : 2)} className="border border-slate-200 px-8 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">Làm lại</button>
                    <button 
                      onClick={() => { onComplete({ ratio: selectedRatio, imageUrl, fileMeta }); close(); }}
                      className="bg-cyan-400 px-8 py-3 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-cyan-200"
                    >
                      Sử dụng ảnh này →
                    </button>
                 </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer: Đường kẻ mảnh bảo tàng */}
        <div className="h-px w-full bg-slate-100" />
      </div>
    </div>
  );
}
