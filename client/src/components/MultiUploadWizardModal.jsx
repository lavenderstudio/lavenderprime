/* eslint-disable react-hooks/static-components */
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToCloudinary } from "../lib/cloudinaryUpload.js";

// ─── Bảng màu đồng bộ trang chủ ──────────────────────────────────────────
const C = "#00e5ff"; // cyan
const M = "#e040fb"; // magenta
const DARK = "#020617";

// ─── Thành phần đường kẻ bảo tàng ─────────────────────────────────────────
function Hairline() {
  return <div className="h-px w-full bg-slate-100" />;
}

// ─── DropZone: Thiết kế tối giản, typography mạnh ──────────────────────────
function DropZone({ onFiles }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
        if (files.length) onFiles(files);
      }}
      onClick={() => inputRef.current?.click()}
      className="relative flex min-h-[400px] cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-all duration-500"
      style={{
        borderColor: dragging ? C : "#e2e8f0",
        backgroundColor: dragging ? `${C}05` : "transparent",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      
      <div className="flex flex-col items-center text-center">
        <span className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-4">
          Phòng Lưu Trữ Kỹ Thuật Số
        </span>
        <h3 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
          Kéo ảnh vào <br />
          <span style={{ color: "transparent", WebkitTextStroke: `1px ${DARK}` }}>hoặc chọn file</span>
        </h3>
        <p className="mt-6 text-xs font-bold tracking-widest text-slate-400 uppercase">
          JPG · PNG · WEBP (Max 20MB)
        </p>
      </div>

      {/* Góc trang trí kiểu khung tranh */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-200" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-200" />
    </motion.div>
  );
}

// ─── Status Badge: Tối giản hóa ──────────────────────────────────────────
function StatusOverlay({ status }) {
  if (status === "uploading") return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
      <div className="h-4 w-4 border-2 border-slate-200 border-t-slate-900 animate-spin rounded-full" />
    </div>
  );
  if (status === "done") return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
      <span className="text-[10px] font-bold tracking-tighter text-white px-2 py-1" style={{ background: C }}>✓ HOÀN TẤT</span>
    </div>
  );
  if (status === "error") return (
    <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
      <span className="text-[10px] font-bold text-red-600 bg-white px-2 py-1 border border-red-600">LỖI</span>
    </div>
  );
  return null;
}

// ─── Main Modal ────────────────────────────────────────────────────────────
export default function MultiUploadWizardModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const addFiles = (files) => {
    const newEntries = files.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: "pending",
    }));
    setSelectedFiles((prev) => [...prev, ...newEntries]);
    setStep(2);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
    if (selectedFiles.length <= 1 && selectedFiles.length - 1 === 0) setStep(1);
  };

  const handleUploadAll = async () => {
    setUploading(true);
    setError("");
    setProgress({ current: 0, total: selectedFiles.length });

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      setSelectedFiles(prev => {
        const next = [...prev];
        next[i].status = "uploading";
        return next;
      });

      try {
        const uploaded = await uploadToCloudinary({ file: selectedFiles[i].file });
        results.push({
          originalUrl: uploaded.url,
          fileMeta: uploaded,
          transform: { ratio: "original", ratioW: uploaded.width, ratioH: uploaded.height },
        });
        setSelectedFiles(prev => {
          const next = [...prev];
          next[i].status = "done";
          return next;
        });
        successCount++;
      } catch (err) {
        setSelectedFiles(prev => {
          const next = [...prev];
          next[i].status = "error";
          return next;
        });
      }
      setProgress(p => ({ ...p, current: i + 1 }));
    }

    setUploading(false);
    if (successCount > 0) {
      setTimeout(() => { onComplete(results); handleClose(); }, 800);
    } else {
      setError("Không thể tải ảnh lên. Vui lòng kiểm tra kết nối.");
    }
  };

  const handleClose = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setStep(1);
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-white/95 backdrop-blur-md" 
        onClick={handleClose} 
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative flex h-full w-full max-w-5xl flex-col bg-white shadow-[0_0_100px_rgba(0,0,0,0.1)] sm:h-[90vh]"
      >
        {/* Header - Tràn viền, Font Mono */}
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-px w-6" style={{ background: C }} />
              <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase">
                {step === 1 ? "Giai đoạn 01" : "Giai đoạn 02"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tighter text-slate-900 uppercase">
              {step === 1 ? "Nhập Tác Phẩm" : "Kiểm Duyệt Nội Dung"}
            </h2>
          </div>
          
          <button onClick={handleClose} className="group flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
            ĐÓNG <span className="text-lg">✕</span>
          </button>
        </div>

        <Hairline />

        {/* Progress Bar Kỹ thuật */}
        {uploading && (
          <div className="h-1 w-full bg-slate-50 overflow-hidden">
            <motion.div 
              className="h-full" 
              style={{ background: `linear-gradient(90deg, ${C}, ${M})` }}
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-10">
          {error && (
            <div className="mb-8 border-l-4 border-red-500 bg-red-50 p-4 font-mono text-[11px] text-red-600 uppercase tracking-tight">
              Lỗi hệ thống: {error}
            </div>
          )}

          {step === 1 ? (
            <DropZone onFiles={addFiles} />
          ) : (
            <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 lg:grid-cols-4">
              {/* Add more tile */}
              <div className="relative aspect-square bg-white group cursor-pointer transition-colors hover:bg-slate-50">
                <input
                  type="file" multiple accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) addFiles(files);
                    e.target.value = "";
                  }}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                <div className="flex h-full flex-col items-center justify-center">
                   <span className="text-4xl font-light text-slate-300 group-hover:text-slate-900 transition-colors">+</span>
                   <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-2">Thêm ảnh</span>
                </div>
              </div>

              {/* Photo tiles */}
              {selectedFiles.map((item, idx) => (
                <div key={idx} className="relative aspect-square bg-white overflow-hidden group">
                  <img src={item.preview} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  <StatusOverlay status={item.status} />

                  {!uploading && (
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 h-6 w-6 bg-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform bg-white/90">
                    <p className="font-mono text-[9px] truncate text-slate-500 uppercase">{item.file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Tràn viền */}
        {step === 2 && (
          <div className="border-t border-slate-100 bg-white px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">Trạng thái hàng chờ</span>
                <p className="text-sm font-bold text-slate-900">
                  {uploading 
                    ? `Đang xử lý tài liệu ${progress.current}/${progress.total}` 
                    : `${selectedFiles.length} Tác phẩm được chọn`}
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  disabled={uploading}
                  onClick={handleClose}
                  className="flex-1 sm:flex-none border border-slate-200 px-8 py-3 font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-slate-50 transition-colors disabled:opacity-30"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={uploading || selectedFiles.length === 0}
                  onClick={handleUploadAll}
                  className="flex-1 sm:flex-none relative overflow-hidden px-10 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-white transition-all active:scale-[0.98] disabled:bg-slate-200"
                  style={{ background: !uploading ? DARK : "#cbd5e1" }}
                >
                  {uploading ? "Đang tải..." : "Bắt đầu tải lên →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
