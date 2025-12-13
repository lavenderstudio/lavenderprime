// client/src/components/FramePreview.jsx
import { FRAME_STYLES, MAT_PADDING } from "../lib/frameStyles";

export default function FramePreview({ imageUrl, frame, mat }) {
  const frameStyle = FRAME_STYLES[frame] || FRAME_STYLES["Black Wood"];
  const matPadding = MAT_PADDING[mat] || "0px";

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Outer frame */}
      <div
        className="relative rounded-sm shadow-lg"
        style={{
          padding: frameStyle.border,
          background: frameStyle.background,
          backgroundSize: "cover",
        }}
      >
        {/* Mat */}
        <div
          className="bg-white"
          style={{
            padding: matPadding,
          }}
        >
          {/* Image */}
          <img
            src={imageUrl}
            alt="Preview"
            className="block w-full h-full object-contain bg-black/5"
          />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-500">
        Preview only – final product may vary slightly
      </p>
    </div>
  );
}
