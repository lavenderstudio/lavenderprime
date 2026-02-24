// client/src/components/PageLoader.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen branded loading screen shown while lazy page chunks are fetching.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";

const ACCENT = "#FF633F";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 55%, ${ACCENT}18 0%, transparent 70%)`,
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center"
      >
        <img
          src="/logo.png"
          alt="Golden Art Frames"
          className="h-14 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
        />

        {/* Spinner ring */}
        <div className="mt-8 relative h-10 w-10">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          {/* Rotating arc */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{ borderTopColor: ACCENT }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          />
        </div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-xs font-bold uppercase tracking-widest text-white/30"
        >
          Loading…
        </motion.p>
      </motion.div>
    </div>
  );
}
