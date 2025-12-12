// client/src/components/UploadWizardModal.jsx
// ----------------------------------------------------
// 3-step modal:
// 1) Choose Ratio
// 2) Filestack upload (crop locked to ratio)
// 3) Framed preview
//
// Props:
// - isOpen
// - onClose
// - onComplete({ ratio, imageUrl, fileMeta })
// ----------------------------------------------------

import { useMemo, useState } from "react";
import { RATIOS } from "../lib/ratios.js";
import FilestackUpload from "./FilestackUpload.jsx";

function Stepper({ step }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
            step === 1 ? "border-emerald-500 text-emerald-600" : "border-gray-300 text-gray-600"
          }`}
        >
          1
        </div>
        <span className={step === 1 ? "font-semibold text-emerald-600" : "text-gray-600"}>
          Choose Orientation
        </span>
      </div>

      <div className="h-px flex-1 bg-gray-200" />

      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
            step === 2 ? "border-emerald-500 text-emerald-600" : "border-gray-300 text-gray-600"
          }`}
        >
          2
        </div>
        <span className={step === 2 ? "font-semibold text-emerald-600" : "text-gray-600"}>
          Choose Image
        </span>
      </div>

      <div className="h-px flex-1 bg-gray-200" />

      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
            step === 3 ? "border-emerald-500 text-emerald-600" : "border-gray-300 text-gray-600"
          }`}
        >
          3
        </div>
        <span className={step === 3 ? "font-semibold text-emerald-600" : "text-gray-600"}>
          Preview
        </span>
      </div>
    </div>
  );
}

function RatioCard({ ratio, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center justify-center rounded-2xl border p-3 transition active:scale-[0.99]
        ${selected ? "border-emerald-400 bg-emerald-200" : "border-gray-200 bg-white hover:bg-gray-50"}`}
    >
      {/* Simple icon mock */}
      <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-[#00D492]">
        <div
          className="border border-gray-300 bg-white"
          style={{
            width: 40,
            height: Math.max(18, Math.round((40 * ratio.h) / ratio.w)),
          }}
        />
      </div>

      <span
        className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${
          selected ? "bg-emerald-400 text-emerald-900" : "bg-gray-100 text-gray-700"
        }`}
      >
        {ratio.label}
      </span>
    </button>
  );
}

export default function UploadWizardModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedRatioId, setSelectedRatioId] = useState("3:2");

  const [fileMeta, setFileMeta] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const selectedRatio = useMemo(
    () => RATIOS.find((r) => r.id === selectedRatioId) || RATIOS[0],
    [selectedRatioId]
  );

  const reset = () => {
    setStep(1);
    setSelectedRatioId("3:2");
    setFileMeta(null);
    setImageUrl("");
  };

  const close = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative mx-auto mt-10 w-[95%] max-w-4xl rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-full">
            <Stepper step={step} />
          </div>

          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="mt-6">
          {step === 1 && (
            <div>
              <p className="text-center text-sm font-semibold text-gray-900">Ratio reference</p>

              {/* Ratio preview box */}
              <div className="mx-auto mt-4 flex max-w-sm items-center justify-center bg-[#00D492] p-4 rounded-2xl">
                <div className="relative h-44 w-44 rounded-2xl ">
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/90"
                    style={{
                      width: 120,
                      height: Math.round((120 * selectedRatio.h) / selectedRatio.w),
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {selectedRatio.label}
                  </div>
                </div>
              </div>

              {/* Ratio picker */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
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
                  className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99]"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Selected ratio</p>
                <p className="mt-1 text-sm text-gray-700">
                  {selectedRatio.label} (locked crop)
                </p>

                <div className="mt-4">
                  <FilestackUpload
                    ratio={selectedRatio}
                    onDone={(meta) => {
                      setFileMeta(meta);
                      setImageUrl(meta.url);
                      setStep(3);
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-gray-600">
                  After you crop and press “Save”, you’ll see a framed preview.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Why ratio matters</p>
                <p className="mt-2 text-sm text-gray-700">
                  Picking a ratio first ensures the crop matches your print format and prevents
                  unexpected trimming at checkout.
                </p>

                <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                  Tip: Later we’ll map these ratios to your product variants (A4, A3 etc.).
                </div>
              </div>

              <div className="lg:col-span-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">Preview</p>
                  <div className="mt-3">
                    <img
                      src={imageUrl}
                      alt="framed preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Details</p>
                  <div className="mt-2 space-y-2 text-sm text-gray-800">
                    <div>
                      <b>Ratio:</b> {selectedRatio.label}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                    >
                      Choose another image
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onComplete({
                          ratio: selectedRatio,
                          imageUrl,
                          fileMeta,
                        });
                        close();
                      }}
                      className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-start">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
