/* eslint-disable no-unused-vars */
// client/src/components/WeddingFramePreview.jsx
import { motion, AnimatePresence } from "framer-motion";
import { FRAME_STYLES, MAT_PADDING } from "../lib/frameStyles.js";

function isUrlBackground(bg) {
  return typeof bg === "string" && bg.trim().startsWith("url(");
}

/**
 * WeddingFramePreview
 * - Shows framed image + mount + a wedding text block UNDER the photo (like your screenshot)
 * - Text block sits INSIDE the white mount area (below the opening)
 */
export default function WeddingFramePreview({
  imageUrl,
  frame,
  mat,

  // ✅ NEW: wedding text inputs (from personalization)
  groomName = "",
  brideName = "",
  locationText = "", // e.g. "Dubai, United Arab Emirates"
  weddingDateText = "", // e.g. "December 27, 2025"
  message = "", // optional line

  children,
  aspectRatio,
  maxWidthClass = "max-w-md",
  className = "",
}) {
  const safeFrame = FRAME_STYLES[frame] ? frame : "White Wood";
  const frameStyle = FRAME_STYLES[safeFrame];

  const matPadding = MAT_PADDING[mat] ?? "30px";
  const FALLBACK_BG = "#ffffff";

  const bg = frameStyle.background;
  const bgIsTexture = isUrlBackground(bg);

  // ✅ Build title like: "ALI & MARYAM"
  const title = [String(groomName || "").trim(), String(brideName || "").trim()]
    .filter(Boolean)
    .join(" & ");

  const subtitle = String(locationText || "").trim();
  const dateLine = String(weddingDateText || "").trim();
  const msg = String(message || "").trim();

  // If nothing provided, show a neutral placeholder so layout is stable
  const showText = title || subtitle || dateLine || msg;

  return (
    <div className={`mx-auto w-full ${maxWidthClass} ${className}`}>
      {/* OUTER FRAME */}
      <motion.div
        className="relative overflow-hidden rounded-sm"
        animate={{
          padding: "9px",
          backgroundColor: bgIsTexture ? FALLBACK_BG : bg,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
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
          {/* MAT / MOUNT */}
          <motion.div
            className="bg-white"
            animate={{ padding: matPadding }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            
          >
            {/* ✅ A vertical layout: [image opening] then [text block] */}
            <div className="flex flex-col">
              {/* OPENING (photo area) */}
              <div
                className="relative w-full bg-black/5"
                style={{
                  aspectRatio: aspectRatio || undefined,
                }}
              >
                {/* Children mode (collage/grid/etc) */}
                {children ? (
                  <div className="h-full w-full">{children}</div>
                ) : (
                  <motion.img
                    src={imageUrl}
                    alt="Preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="block h-full w-full object-contain"
                  />
                )}

                {/* INNER VIGNETTE */}
                <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.18)]" />
              </div>

              {/* ✅ TEXT BLOCK under the photo (inside mount) */}
              <div className="px-4 pt-5 text-center">
                {showText ? (
                  <>
                    {/* Names: spaced like screenshot */}
                    {title ? (
                      <div
                        className="text-[13px] font-bold text-slate-900"
                        style={{
                          letterSpacing: "0.28em", // wide tracking like the photo
                          textTransform: "uppercase",
                        }}
                      >
                        {title}
                      </div>
                    ) : (
                      <div
                        className="text-[13px] font-semibold text-slate-500"
                        style={{ letterSpacing: "0.38em", textTransform: "uppercase" }}
                      >
                        YOUR NAMES
                      </div>
                    )}

                    {/* City / venue */}
                    {subtitle ? (
                      <div 
                        className="mt-2 text-[12px]    text-slate-600"
                        style={{ letterSpacing: "0.18em" }}
                      >
                        {subtitle}
                      </div>
                    ) : (
                      <div className="mt-2 text-[10px] font-medium text-slate-400">
                        City, Country
                      </div>
                    )}

                    {/* Date */}
                    {dateLine ? (
                      <div className="mt-1 text-[13px] font-semibold text-slate-700">
                        {dateLine}
                      </div>
                    ) : (
                      <div className="mt-1 text-[10px] font-semibold text-slate-400">
                        Wedding date
                      </div>
                    )}

                    {/* Optional message */}
                    {msg ? (
                      <div className=" text-[10px] font-medium text-slate-600">
                        {msg}
                      </div>
                    ) : null}
                  </>
                ) : (
                  // fallback if everything empty (rare)
                  <div className="text-[10px] font-semibold text-slate-400">
                    Add your names, location and date to see the preview.
                  </div>
                )}
              </div>
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
