// client/src/components/CanvasGalleryWrapPreview.jsx
// ----------------------------------------------------
// Realistic "gallery wrap" preview (production-style)
// - Front image stays flat
// - Right edge shows wrapped image slice
// - No 3D transforms that distort the photo
// ----------------------------------------------------

export default function Canvas3DPreview({
  imageUrl,
  depth = 12,
  maxWidth = 440,
  tilt = -20,        // 👈 subtle tilt (degrees)
}) {
  return (
    <div
      className="mx-auto relative"
      style={{
        maxWidth,
        perspective: "2200px", // 👈 important for realism
      }}
    >
      {/* SCENE */}
      <div
        className="relative"
        style={{
          transform: `rotateY(${tilt}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* FRONT CANVAS */}
        <div className="relative bg-white shadow-[0_20px_45px_rgba(0,0,0,0.22)]">
          <img
            src={imageUrl}
            alt="Canvas preview"
            className="block w-full object-cover"
          />

          {/* Inner canvas texture shadow */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_25px_rgba(0,0,0,0.18)]" />
        </div>

        {/* RIGHT WRAPPED EDGE */}
        <div
          className="absolute top-0"
          style={{
            right: `-${depth}px`,
            width: `${depth}px`,
            height: "100%",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "right center",
            boxShadow:
              "inset 0 0 0 1px rgba(0,0,0,0.15), 6px 0 10px rgba(0,0,0,0.25)",
            transform: "skewY(-6deg)",
          }}
        />

        {/* TOP LIGHT */}
        <div
          className="pointer-events-none absolute top-0 left-0 w-full"
          style={{
            height: "20px",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)",
          }}
        />
      </div>
    </div>
  );
}