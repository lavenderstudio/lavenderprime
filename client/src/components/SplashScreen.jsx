// client/src/components/SplashScreen.jsx
// ─────────────────────────────────────────────────────────────────────────────
// First-visit intro animation.
//
// Phase 1 (0 → 0.6 s)  : Full-screen dark overlay fades in; logo fades up
//                         from centre, big and prominent.
// Phase 2 (1.6 → 2.4 s): Logo shrinks + flies to the navbar's centred logo
//                         position while the overlay fades out.
// After ~2.6 s          : Component unmounts; normal site is visible.
//
// Only shown once per browser session (sessionStorage flag).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "gaf_intro_shown";

// Easing curves
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const EASE_IN_OUT  = [0.45, 0, 0.55, 1];

// Duration constants (seconds)
const HOLD_DELAY  = 1.4;   // how long logo sits in the centre before moving
const FLY_DUR    = 0.75;   // how long the fly-to-navbar animation takes
const FADE_DUR   = 0.35;   // overlay fade-out duration

export default function SplashScreen() {
  // Skip entirely if already shown this session
  const alreadyShown = sessionStorage.getItem(SESSION_KEY);
  const [visible, setVisible] = useState(!alreadyShown);
  const [phase, setPhase]     = useState("enter"); // "enter" | "fly" | "done"

  // Ref for the logo element so we can measure it if needed
  const logoRef = useRef(null);

  useEffect(() => {
    if (alreadyShown) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    // Lock body scroll while splash is up
    document.body.style.overflow = "hidden";

    // After hold delay → start fly-out phase
    const flyTimer = setTimeout(() => setPhase("fly"), HOLD_DELAY * 1000);

    // After fly is done → hide overlay
    const doneTimer = setTimeout(
      () => {
        setPhase("done");
        setVisible(false);
        document.body.style.overflow = "";
      },
      (HOLD_DELAY + FLY_DUR + FADE_DUR) * 1000
    );

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const isFly = phase === "fly";

  return (
    <AnimatePresence>
      {/* ── Full-screen overlay ─────────────────────────────────────────── */}
      <motion.div
        key="splash-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: isFly ? 0 : 1 }}
        transition={{ duration: FADE_DUR, ease: EASE_IN_OUT, delay: isFly ? FLY_DUR * 0.6 : 0 }}
        className="fixed inset-0 z-9999 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #1a0a00 100%)" }}
        aria-hidden="true"
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 35% at 50% 55%, rgba(255,99,63,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Decorative ring */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: isFly ? 0.3 : 1, opacity: isFly ? 0 : 0.12 }}
          transition={{ duration: isFly ? FLY_DUR : 0.8, ease: EASE_OUT_EXPO }}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            border: "1px solid rgba(255,99,63,0.5)",
          }}
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: isFly ? 0.3 : 1, opacity: isFly ? 0 : 0.07 }}
          transition={{ duration: isFly ? FLY_DUR : 0.9, ease: EASE_OUT_EXPO, delay: 0.05 }}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 460,
            height: 460,
            border: "1px solid rgba(255,99,63,0.35)",
          }}
        />

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <motion.div
          ref={logoRef}
          // Enter: fade + rise from below
          initial={{ opacity: 0, y: 28, scale: 0.88 }}
          animate={
            isFly
              ? {
                  // Fly to navbar logo position: top-center, scaled down to ~h-11 / h-24 ratio
                  opacity: 0,
                  y: "-46vh",
                  scale: 0.38,
                  filter: "brightness(1)",
                }
              : {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "brightness(0) invert(1)",
                }
          }
          transition={
            isFly
              ? { duration: FLY_DUR, ease: EASE_OUT_EXPO }
              : { duration: 0.65, ease: EASE_OUT_EXPO }
          }
          className="relative flex flex-col items-center gap-6"
        >
          <img
            src="/logo.png"
            alt="Golden Art Frames"
            className="h-24 w-auto object-contain select-none"
            draggable={false}
          />

          {/* Tagline — only visible during enter phase */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isFly ? 0 : 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-white/35"
          >
            Premium Photo Prints &amp; Art Frames
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: isFly ? 1 : 1, opacity: isFly ? 0 : 1 }}
            transition={
              isFly
                ? { duration: 0.2, opacity: { duration: 0.2 } }
                : { scaleX: { duration: HOLD_DELAY * 0.9, ease: "linear", delay: 0.3 }, opacity: { duration: 0.4, delay: 0.3 } }
            }
            className="h-0.5 w-20 origin-left rounded-full"
            style={{ background: "#FF633F" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
