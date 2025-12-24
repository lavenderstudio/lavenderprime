/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
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
// - lockedRatioId (optional): if provided, Step 1 is skipped and ratio is forced
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { RATIOS } from "../lib/ratios.js";
import FilestackUpload from "./FilestackUpload.jsx";

function Stepper({ step, totalSteps = 3 }) {
  // NOTE: if lockedRatioId is used, totalSteps becomes 2 (Choose Image -> Preview)
  const step1Label = totalSteps === 2 ? "Choose Image" : "Choose Orientation";
  const step2Label = totalSteps === 2 ? "Preview" : "Choose Image";
  const step3Label = "Preview";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
            step === 1 ? "border-blue-500 text-blue-700" : "border-gray-300 text-gray-600"
          }`}
        >
          1
        </div>
        <span className={step === 1 ? "font-semibold text-blue-600" : "text-gray-600"}>
          {step1Label}
        </span>
      </div>

      <div className="h-px flex-1 bg-gray-200" />

      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
            step === 2 ? "border-blue-500 text-blue-700" : "border-gray-300 text-gray-600"
          }`}
        >
          2
        </div>
        <span className={step === 2 ? "font-semibold text-blue-600" : "text-gray-600"}>
          {step2Label}
        </span>
      </div>

      {totalSteps === 3 && (
        <>
          <div className="h-px flex-1 bg-gray-200" />

          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                step === 3 ? "border-blue-500 text-blue-700" : "border-gray-300 text-gray-600"
              }`}
            >
              3
            </div>
            <span className={step === 3 ? "font-semibold text-blue-600" : "text-gray-600"}>
              {step3Label}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function RatioCard({ ratio, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center justify-center rounded-2xl border p-3 transition active:scale-[0.99]
        ${selected ? "border-blue-400 bg-blue-100" : "border-gray-200 bg-white hover:bg-gray-50"}`}
    >
      <div className="flex h-16 w-20 items-center justify-center rounded-xl">
        <div
          className="border border-gray-600 bg-white"
          style={{
            width: 40,
            height: Math.max(18, Math.round((40 * ratio.h) / ratio.w)),
          }}
        />
      </div>

      <span
        className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${
          selected ? "bg-blue-400 text-white" : "bg-gray-100 text-gray-700"
        }`}
      >
        {ratio.label}
      </span>
    </button>
  );
}

export default function UploadWizardModal({ isOpen, onClose, onComplete, lockedRatioId = null }) {
  // If lockedRatioId is present: steps become:
  // Step 1 = Choose Image
  // Step 2 = Preview
  const totalSteps = lockedRatioId ? 2 : 3;

  const [step, setStep] = useState(1);
  const [selectedRatioId, setSelectedRatioId] = useState("3:2");

  const [fileMeta, setFileMeta] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // If locked, force ratio selection from prop (and fall back safely)
  const effectiveRatioId = useMemo(() => {
    if (!lockedRatioId) return selectedRatioId;
    return lockedRatioId;
  }, [lockedRatioId, selectedRatioId]);

  const selectedRatio = useMemo(
    () => RATIOS.find((r) => r.id === effectiveRatioId) || RATIOS[0],
    [effectiveRatioId]
  );

  const reset = () => {
    // Reset to defaults (but if lockedRatioId exists, we’ll re-force it on open)
    setStep(1);
    setSelectedRatioId("3:2");
    setFileMeta(null);
    setImageUrl("");
  };

  const close = () => {
    reset();
    onClose();
  };

  // ✅ When modal opens with lockedRatioId, jump to Choose Image directly
  useEffect(() => {
    if (!isOpen) return;

    if (lockedRatioId) {
      // Step 1 becomes "Choose Image" in locked flow
      setStep(1);
    } else {
      // Normal flow starts with ratio chooser
      setStep(1);
    }
  }, [isOpen, lockedRatioId]);

  if (!isOpen) return null;

  function MobileStepHeader({ step }) {
    const title = lockedRatioId
      ? step === 1
        ? "Choose Image"
        : "Preview"
      : step === 1
      ? "Choose Orientation"
      : step === 2
      ? "Choose Image"
      : "Preview";

    return (
      <div className="sm:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{title}</p>

          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700">
            Step {step}/{totalSteps}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative w-full max-w-105 sm:max-w-4xl rounded-2xl bg-white shadow-xl max-h-[90svh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 p-3 sm:p-6 flex items-start justify-between gap-3 border-b border-gray-100">
          <div className="w-full">
            <MobileStepHeader step={step} />
            <div className="hidden sm:block">
              <Stepper step={step} totalSteps={totalSteps} />
            </div>
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {/* STEP 1 (normal flow only): choose ratio */}
          {!lockedRatioId && step === 1 && (
            <div>
              <p className="text-center text-sm font-semibold text-gray-900">Ratio reference</p>

              <div className="mx-auto mt-4 flex max-w-sm items-center justify-center bg-white p-4 rounded-2xl">
                <div className="relative h-44 w-44 rounded-2xl">
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black"
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

              <div className="mt-6 grid grid-cols-3 gap-3">
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
                  className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 active:scale-[0.99]"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 (locked flow) OR STEP 2 (normal flow): choose image */}
          {((lockedRatioId && step === 1) || (!lockedRatioId && step === 2)) && (
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

                      // ✅ Go to preview
                      if (lockedRatioId) setStep(2);
                      else setStep(3);
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-gray-600">
                  After you crop and press “Save”, you’ll see a preview.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Why ratio matters</p>
                <p className="mt-2 text-sm text-gray-700">
                  Picking a ratio ensures the crop matches your print format and prevents unexpected trimming.
                </p>

                <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                  Tip: For collage products we lock this ratio automatically.
                </div>
              </div>

              <div className="lg:col-span-2 flex justify-between">
                {!lockedRatioId && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PREVIEW STEP */}
          {((lockedRatioId && step === 2) || (!lockedRatioId && step === 3)) && (
            <div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">Preview</p>
                  <div className="mt-3">
                    <img src={imageUrl} alt="preview" className="h-full w-full object-contain" />
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
                      onClick={() => {
                        // back to choose image step
                        if (lockedRatioId) setStep(1);
                        else setStep(2);
                      }}
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
                  onClick={() => {
                    // back to choose image step
                    if (lockedRatioId) setStep(1);
                    else setStep(2);
                  }}
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
