/* eslint-disable react-hooks/static-components */
// client/src/components/MultiUploadWizardModal.jsx
// ----------------------------------------------------
// Bulk upload wizard — modernised design, same logic
// 1) Select multiple files (drag-drop zone)
// 2) Review photo grid + upload all to Cloudinary
// ----------------------------------------------------

import { useRef, useState } from "react";
import { uploadToCloudinary } from "../lib/cloudinaryUpload.js";

const ACCENT = "#FF633F";
const DARK   = "#0f172a";

// ─── Drag-drop zone ───────────────────────────────────────────────────────────
function DropZone({ onFiles, label = "Drop photos here, or" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) onFiles(files);
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onFiles(files);
    // reset so same files can be re-added if removed
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        borderColor: dragging ? ACCENT : "#cbd5e1",
        background: dragging ? `${ACCENT}08` : "#f8fafc",
      }}
      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-all duration-200 hover:border-[#FF633F]/70 hover:bg-[#FF633F]/5"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {/* Icon */}
      <div
        style={{ background: `${ACCENT}15` }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke={ACCENT} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">
          {label}{" "}
          <span style={{ color: ACCENT }}>browse files</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">Select multiple images at once · JPG, PNG, WEBP</p>
      </div>
    </div>
  );
}

// ─── Status overlay pill ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "uploading") {
    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
        <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (status === "done") {
    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
          <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" stroke="white" strokeWidth={2.5}>
            <polyline points="2,6 5,9 10,3" />
          </svg>
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 shadow-lg text-white font-bold text-lg">
          !
        </div>
      </div>
    );
  }
  return null;
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function MultiUploadWizardModal({ isOpen, onClose, onComplete }) {
  const [step,          setStep]          = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]); // { file, preview, status }
  const [uploading,     setUploading]     = useState(false);
  const [progress,      setProgress]      = useState({ current: 0, total: 0 });
  const [error,         setError]         = useState("");

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
    if (selectedFiles.length <= 1) setStep(1);
  };

  const handleUploadAll = async () => {
    setUploading(true);
    setError("");
    setProgress({ current: 0, total: selectedFiles.length });

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const item = selectedFiles[i];

      setSelectedFiles((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], status: "uploading" };
        return next;
      });

      try {
        const uploaded = await uploadToCloudinary({ file: item.file });
        results.push({
          originalUrl: uploaded.url,
          fileMeta: uploaded,
          transform: {
            ratio: "original",
            ratioW: uploaded.width,
            ratioH: uploaded.height,
          },
        });
        setSelectedFiles((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: "done" };
          return next;
        });
        successCount++;
      } catch (err) {
        console.error("Upload failed:", item.file.name, err);
        setSelectedFiles((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: "error" };
          return next;
        });
      }

      setProgress({ current: i + 1, total: selectedFiles.length });
    }

    setUploading(false);

    if (successCount > 0) {
      onComplete(results);
      handleClose();
    } else {
      setError("All uploads failed. Please try again.");
    }
  };

  const handleClose = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setStep(1);
    setUploading(false);
    setError("");
    onClose();
  };

  const uploadPercent = progress.total
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
      />

      {/* Modal */}
      <div
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white max-h-[92svh]"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}
      >
        {/* ── Dark header ── */}
        <div style={{ background: DARK }} className="shrink-0 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: ACCENT }}
              >
                Bulk Upload
              </p>
              <h2 className="mt-0.5 text-lg font-extrabold text-white">
                {step === 1
                  ? "Select Your Photos"
                  : `Review Photos (${selectedFiles.length})`}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleClose}
              style={{ background: "rgba(255,255,255,0.1)" }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          {/* Progress bar (only while uploading) */}
          {uploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white/60">
                  Uploading {progress.current} of {progress.total}
                </span>
                <span className="text-xs font-bold" style={{ color: ACCENT }}>
                  {uploadPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadPercent}%`, background: ACCENT }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 border border-red-100">
              <span className="mt-0.5">⚠️</span>
              {error}
            </div>
          )}

          {/* Step 1 — Drop zone */}
          {step === 1 && <DropZone onFiles={addFiles} />}

          {/* Step 2 — Photo grid */}
          {step === 2 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {/* Add more tile */}
              <div
                style={{ borderColor: "#cbd5e1" }}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed bg-slate-50 transition hover:border-[#FF633F]/70 hover:bg-[#FF633F]/5"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) addFiles(files);
                    e.target.value = "";
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
                  <span className="text-3xl font-light leading-none">+</span>
                  <span className="text-[11px] font-bold">Add More</span>
                </div>
              </div>

              {/* Photo tiles */}
              {selectedFiles.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  <img
                    src={item.preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />

                  {/* Upload status overlay */}
                  {uploading && <StatusBadge status={item.status} />}

                  {/* Remove button */}
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-red-500 shadow opacity-0 transition hover:bg-white group-hover:opacity-100 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}

                  {/* Pending dim */}
                  {!uploading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/30 to-transparent py-1.5 px-2 opacity-0 group-hover:opacity-100 transition">
                      <p className="truncate text-[10px] font-semibold text-white">
                        {item.file.name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer (step 2 only) ── */}
        {step === 2 && (
          <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Count / status */}
              <div className="text-sm font-semibold text-slate-500">
                {uploading ? (
                  <span style={{ color: ACCENT }}>
                    Uploading {progress.current} / {progress.total}…
                  </span>
                ) : (
                  <span>
                    <span className="font-extrabold text-slate-800">
                      {selectedFiles.length}
                    </span>{" "}
                    {selectedFiles.length === 1 ? "photo" : "photos"} selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={uploading || selectedFiles.length === 0}
                  style={{ background: !uploading ? ACCENT : undefined }}
                  className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 active:scale-[0.98]"
                >
                  {uploading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                      </svg>
                      Uploading…
                    </>
                  ) : (
                    <>
                      Upload All
                      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                        <polyline points="4,8 12,8 9,5" /><polyline points="9,11 12,8" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
