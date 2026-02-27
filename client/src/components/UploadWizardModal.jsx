/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
// client/src/components/UploadWizardModal.jsx
// ----------------------------------------------------
// 3-step modal — modernised design, same logic
// 1) Choose Ratio  2) Crop & Upload  3) Preview
// ----------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { RATIOS } from "../lib/ratios.js";
import { getCroppedBlob } from "../lib/cropImage.js";
import { uploadToCloudinary } from "../lib/cloudinaryUpload.js";

const ACCENT = "#FF633F";
const DARK   = "#0f172a";

// ─── Step indicator ──────────────────────────────────────────────────────────
function Stepper({ step, totalSteps }) {
  const labels =
    totalSteps === 2
      ? ["Choose Image", "Preview"]
      : ["Orientation", "Crop & Upload", "Preview"];

  return (
    <div className="flex items-center gap-0">
      {labels.map((label, i) => {
        const num     = i + 1;
        const done    = step > num;
        const active  = step === num;
        const pending = step < num;

        return (
          <div key={label} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                style={{
                  background: done ? DARK : active ? ACCENT : "transparent",
                  borderColor: done || active ? "transparent" : "#cbd5e1",
                  color: done || active ? "#fff" : "#94a3b8",
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300"
              >
                {done ? (
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                ) : (
                  num
                )}
              </div>
              <span
                style={{ color: active ? ACCENT : done ? DARK : "#94a3b8" }}
                className="hidden whitespace-nowrap text-[11px] font-semibold sm:block"
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < labels.length - 1 && (
              <div className="mx-2 mb-5 h-0.5 w-10 sm:w-16 rounded-full transition-all duration-500"
                style={{ background: step > num ? DARK : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Ratio card ───────────────────────────────────────────────────────────────
function RatioCard({ ratio, selected, onClick }) {
  const boxW = 44;
  const boxH = Math.max(16, Math.round((boxW * ratio.h) / ratio.w));

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderColor: selected ? ACCENT : "#e2e8f0",
        background: selected ? `${ACCENT}10` : "#fff",
        boxShadow: selected ? `0 0 0 2px ${ACCENT}` : "none",
      }}
      className="group flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-200 hover:border-[#FF633F]/60 active:scale-[0.98]"
    >
      {/* Aspect preview */}
      <div className="flex h-14 w-16 items-center justify-center">
        <div
          style={{
            width: boxW,
            height: boxH,
            borderColor: selected ? ACCENT : "#64748b",
            background: selected ? `${ACCENT}18` : "#f1f5f9",
          }}
          className="rounded border-2 transition-all duration-200"
        />
      </div>

      <span
        style={{
          background: selected ? ACCENT : "#f1f5f9",
          color: selected ? "#fff" : "#475569",
        }}
        className="rounded-full px-2.5 py-0.5 text-xs font-bold transition-all duration-200"
      >
        {ratio.label}
      </span>
    </button>
  );
}

// ─── Drag-drop file zone ───────────────────────────────────────────────────────
function DropZone({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onFile(f);
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
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />

      {/* Cloud upload icon */}
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
          Drop your photo here, or <span style={{ color: ACCENT }}>browse</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP — up to 20 MB</p>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function UploadWizardModal({ isOpen, onClose, onComplete, lockedRatioId = null }) {
  const totalSteps = lockedRatioId ? 2 : 3;

  const [step,            setStep]            = useState(1);
  const [selectedRatioId, setSelectedRatioId] = useState("3:2");
  const [fileMeta,        setFileMeta]        = useState(null);
  const [imageUrl,        setImageUrl]        = useState("");

  const [localSrc,     setLocalSrc]     = useState("");
  const [crop,         setCrop]         = useState({ x: 0, y: 0 });
  const [zoom,         setZoom]         = useState(1);
  const [croppedPixels,setCroppedPixels]= useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState("");

  const effectiveRatioId = useMemo(
    () => (lockedRatioId ? lockedRatioId : selectedRatioId),
    [lockedRatioId, selectedRatioId]
  );

  const selectedRatio = useMemo(
    () => RATIOS.find((r) => r.id === effectiveRatioId) || RATIOS[0],
    [effectiveRatioId]
  );

  const reset = () => {
    setStep(1);
    setSelectedRatioId("3:2");
    setFileMeta(null);
    setImageUrl("");
    if (localSrc) URL.revokeObjectURL(localSrc);
    setLocalSrc("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);
    setUploading(false);
    setUploadError("");
  };

  const close = () => { reset(); onClose(); };

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
  }, [isOpen, lockedRatioId]);

  if (!isOpen) return null;

  const onPickFile = (file) => {
    setUploadError("");
    if (localSrc) URL.revokeObjectURL(localSrc);
    setLocalSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);
  };

  const onCropComplete = (_, croppedAreaPixels) => setCroppedPixels(croppedAreaPixels);

  const saveCropAndUpload = async () => {
    try {
      setUploading(true);
      setUploadError("");
      if (!localSrc || !croppedPixels) {
        setUploadError("Please choose and crop an image first.");
        return;
      }
      const blob       = await getCroppedBlob(localSrc, croppedPixels, "image/jpeg", 0.92);
      const croppedFile= new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
      const uploaded   = await uploadToCloudinary({ file: croppedFile, folder: "user-uploads" });
      setFileMeta(uploaded);
      setImageUrl(uploaded.url);
      if (lockedRatioId) setStep(2); else setStep(3);
    } catch (err) {
      console.error(err);
      setUploadError(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const cropStep = (lockedRatioId && step === 1) || (!lockedRatioId && step === 2);
  const previewStep = (lockedRatioId && step === 2) || (!lockedRatioId && step === 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative flex w-full max-w-[420px] sm:max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[92svh]"
           style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>

        {/* ── Header ── */}
        <div style={{ background: DARK }} className="shrink-0 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Upload Wizard
              </p>
              <h2 className="mt-0.5 text-lg font-extrabold text-white">
                {!lockedRatioId && step === 1 && "Choose Orientation"}
                {cropStep && "Crop Your Photo"}
                {previewStep && "Looking Great!"}
              </h2>
            </div>

            {/* Stepper (desktop) */}
            <div className="hidden sm:block">
              <Stepper step={step} totalSteps={totalSteps} />
            </div>

            {/* Mobile step badge */}
            <div className="sm:hidden flex items-center gap-2">
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white/70">
                {step}/{totalSteps}
              </span>
              <button
                type="button"
                onClick={close}
                style={{ background: "rgba(255,255,255,0.1)" }}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            {/* Desktop close */}
            <button
              type="button"
              onClick={close}
              style={{ background: "rgba(255,255,255,0.1)" }}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          {/* Mobile progress bar */}
          <div className="mt-3 h-1 w-full rounded-full bg-white/10 sm:hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%`, background: ACCENT }}
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7">

          {/* ── STEP 1: Choose ratio ── */}
          {!lockedRatioId && step === 1 && (
            <div>
              <p className="text-sm text-slate-500">
                Select the aspect ratio that matches your desired print format.
              </p>

              {/* Live ratio preview */}
              <div className="my-5 flex justify-center">
                <div
                  style={{ borderColor: ACCENT, background: `${ACCENT}08` }}
                  className="flex h-36 w-48 items-center justify-center rounded-2xl border-2"
                >
                  <div
                    style={{
                      width: 100,
                      height: Math.round((100 * selectedRatio.h) / selectedRatio.w),
                      borderColor: ACCENT,
                      background: `${ACCENT}20`,
                    }}
                    className="rounded border-2 transition-all duration-300 flex items-center justify-center"
                  >
                    <span className="text-[11px] font-bold" style={{ color: ACCENT }}>
                      {selectedRatio.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {RATIOS.map((r) => (
                  <RatioCard
                    key={r.id}
                    ratio={r}
                    selected={r.id === selectedRatioId}
                    onClick={() => setSelectedRatioId(r.id)}
                  />
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ background: ACCENT }}
                  className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                >
                  Continue
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <polyline points="4,8 12,8 9,5" /><polyline points="9,11 12,8" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Crop & Upload ── */}
          {cropStep && (
            <div className="space-y-4">
              {/* Ratio badge */}
              <div className="flex items-center gap-2">
                <span
                  style={{ background: `${ACCENT}15`, color: ACCENT }}
                  className="rounded-full px-3 py-1 text-xs font-bold"
                >
                  {selectedRatio.label}
                </span>
                <span className="text-xs text-slate-400">Aspect ratio locked for your print</span>
              </div>

              {/* Drop zone or Cropper */}
              {!localSrc ? (
                <DropZone onFile={onPickFile} />
              ) : (
                <div className="space-y-3">
                  <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-inner">
                    <Cropper
                      image={localSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={selectedRatio.w / selectedRatio.h}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>

                  {/* Zoom */}
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <circle cx="8" cy="8" r="5" /><line x1="13" y1="13" x2="18" y2="18" />
                    </svg>
                    <input
                      type="range" min={1} max={3} step={0.01}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-[#FF633F]"
                    />
                    <span className="text-xs font-semibold text-slate-500 w-8 text-right">
                      {zoom.toFixed(1)}×
                    </span>
                  </div>

                  {/* Change photo */}
                  <button
                    type="button"
                    onClick={() => { if (localSrc) URL.revokeObjectURL(localSrc); setLocalSrc(""); }}
                    className="text-xs font-semibold text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
                  >
                    Choose a different photo
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                  <span className="mt-0.5">⚠️</span>
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {!lockedRatioId ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    ← Back
                  </button>
                ) : <span />}

                <button
                  type="button"
                  onClick={saveCropAndUpload}
                  disabled={!localSrc || uploading}
                  style={{ background: localSrc && !uploading ? DARK : undefined }}
                  className="flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 active:scale-[0.98]"
                >
                  {uploading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                      </svg>
                      Uploading…
                    </>
                  ) : (
                    <>
                      Save & Continue →
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Preview ── */}
          {previewStep && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-5">
                {/* Image preview */}
                <div className="lg:col-span-3">
                  <div
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
                    style={{ aspectRatio: `${selectedRatio.w} / ${selectedRatio.h}` }}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No image found
                      </div>
                    )}
                  </div>
                </div>

                {/* Details panel */}
                <div className="flex flex-col justify-between lg:col-span-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Details</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                        <span className="text-xs font-semibold text-slate-500">Ratio</span>
                        <span
                          style={{ background: `${ACCENT}15`, color: ACCENT }}
                          className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                        >
                          {selectedRatio.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                        <span className="text-xs font-semibold text-slate-500">Status</span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready to use
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-[#FF633F]/6 border border-[#FF633F]/15 px-4 py-3">
                      <p className="text-xs font-semibold text-[#FF633F]">
                        ✓ Your photo has been cropped and uploaded successfully.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => { if (lockedRatioId) setStep(1); else setStep(2); }}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      ← Use Different Photo
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onComplete({ ratio: selectedRatio, imageUrl, fileMeta });
                        close();
                      }}
                      style={{ background: ACCENT }}
                      className="rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                    >
                      Use This Photo →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}