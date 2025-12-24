// client/src/components/CollagePreview.jsx
// ----------------------------------------------------
// CollagePreview (Cart)
// - Renders a square collage grid using assets.items
// - Wraps grid inside FramePreview (real frame + mat)
// ----------------------------------------------------

import FramePreview from "./FramePreview.jsx";

function gridSizeFromCount(n) {
  if (n === 4) return 2;
  if (n === 9) return 3;
  if (n === 16) return 4;
  // fallback
  return 2;
}

export default function CollagePreview({
  frame = "Black Wood",
  mat = "None",
  imageCount = 4,
  assets = [],
  maxWidthClass = "max-w-[260px]",
}) {
  const safeCount = [4, 9, 16].includes(imageCount) ? imageCount : 4;

  const grid = gridSizeFromCount(safeCount);

  return (
    <FramePreview
      frame={frame}
      mat={mat}
      aspectRatio={"1 / 1"} // square opening
      maxWidthClass={maxWidthClass}
    >
      {/* Inner print area */}
      <div className="h-full w-full p-2">
        <div
          className="grid h-full w-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))`,
          }}
        >
          {(assets || []).slice(0, safeCount).map((a, idx) => {
            // prefer previewUrl, fallback to originalUrl
            const url = a?.previewUrl || a?.originalUrl || "";

            return (
              <div
                key={idx}
                className="relative overflow-hidden border border-slate-200 bg-white"
              >
                {url ? (
                  <img
                    src={url}
                    alt={`collage-${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-xs font-semibold text-slate-600">
                    No image
                  </div>
                )}

                <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 text-[11px] font-extrabold text-slate-900">
                  #{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FramePreview>
  );
}
