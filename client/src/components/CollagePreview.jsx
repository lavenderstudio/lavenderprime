/* eslint-disable no-unused-vars */
// client/src/components/CollagePreview.jsx
import { motion, AnimatePresence } from "framer-motion";
import { FRAME_STYLES, MAT_PADDING } from "../lib/frameStyles.js";

function isUrlBackground(bg) {
  return typeof bg === "string" && bg.trim().startsWith("url(");
}

export default function CollagePreview({
  imageUrl,          // optional (single-image mode)
  frame,
  mat = "0px",       // keep your existing mat behavior
  children,          // ✅ NEW: collage/content mode
  className = "",    // optional: allow parent to override sizing
  aspectRatio,       // optional: allow parent to control aspect ratio (collage uses it)
  maxWidthClass = "max-w-md", // optional sizing control
}) {
  const safeFrame = FRAME_STYLES[frame] ? frame : "Black Wood";
  const frameStyle = FRAME_STYLES[safeFrame];
  const matPadding = MAT_PADDING[mat] ?? "0px";
  const FALLBACK_BG = "#ffffff";

  const bg = frameStyle.background;
  const bgIsTexture = isUrlBackground(bg);

  return (
    <div className={`mx-auto w-full ${maxWidthClass} ${className}`}>
      {/* OUTER FRAME */}
      <motion.div
        className="relative overflow-hidden rounded-sm"
        animate={{
          padding: frameStyle.border,
          backgroundColor: bgIsTexture ? FALLBACK_BG : bg,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          // OUTER DROP SHADOW (frame floating)
          boxShadow: "0 18px 35px rgba(0,0,0,0.22), 0 6px 12px rgba(0,0,0,0.12)",
        }}
      >
        {/* TEXTURE BACKGROUND (crossfades) */}
        <AnimatePresence mode="wait">
          {bgIsTexture && (
            <motion.div
              key={bg}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                background: bg,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
        </AnimatePresence>

        {/* CONTENT ABOVE TEXTURE */}
        <div className="relative">
          {/* MAT */}
          <motion.div
            className="bg-white"
            animate={{ padding: matPadding }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              // INNER SHADOW (depth of frame edge)
              boxShadow: `
                inset 0 0 6px rgba(0,0,0,0.22),
                inset 0 1px 2px rgba(255,255,255,0.5),
                inset 0 -3px 4px rgba(0,0,0,0.35),
                inset 2px 0 3px rgba(0,0,0,0.25),
                inset -2px 0 3px rgba(0,0,0,0.25)
              `,
            }}
          >
            {/* CONTENT AREA (either children OR single image) */}
            <div
              className="relative w-full bg-black/5"
              style={{
                // ✅ Allow collage to control the opening aspect ratio
                aspectRatio: aspectRatio || undefined,
              }}
            >
              {/* If children provided, render collage/grid/etc */}
              {children ? (
                <div className="h-full w-full">{children}</div>
              ) : (
                // Else fallback to single image mode (backwards compatible)
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imageUrl}
                    src={imageUrl}
                    alt="Preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="block h-full w-full object-contain"
                  />
                </AnimatePresence>
              )}

              {/* INNER VIGNETTE (gallery realism) */}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.18)]" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <p className="mt-2 text-center text-xs text-gray-500">
        Preview only – final product may vary slightly
      </p>
    </div>
  );
}
