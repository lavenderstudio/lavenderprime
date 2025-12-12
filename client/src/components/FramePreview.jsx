// client/src/components/FramePreview.jsx
// ----------------------------------------------------
// Shows image inside a "frame" overlay for reference.
// ----------------------------------------------------


export default function FramePreview({ imageUrl, mount = true }) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow">
        {/* Preview area (keeps proportions nice on mobile) */}
        <div className="relative aspect-[4/3] w-full bg-white">
          {/* "Mount" effect via padding */}
          <div className={`absolute inset-0 ${mount ? "p-10" : "p-4"}`}>
            <img
              src={imageUrl}
              alt="framed preview"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Frame overlay */}
          <img
            src="/frame-black.png"
            alt="frame overlay"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-600">
        Reference preview only (final print may differ slightly).
      </p>
    </div>
  );
}
