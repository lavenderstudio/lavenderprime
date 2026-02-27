// Adapted from ReactBits (reactbits.dev) — RotatingText
// Cycles through an array of words with a spring slide-up/down animation.
// Uses framer-motion only — fully self-contained.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RotatingText({
  texts,
  interval = 2500,
  transition = { type: "spring", damping: 25, stiffness: 300 },
  initial = { y: "110%", opacity: 0 },
  animate = { y: 0, opacity: 1 },
  exit = { y: "-110%", opacity: 0 },
  className = "",       // applied to each word motion.span
  mainClassName = "",   // applied to the outer container span
  style = {},           // extra inline styles on the container
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % texts.length), interval);
    return () => clearInterval(id);
  }, [texts.length, interval]);

  return (
    <span
      className={mainClassName}
      style={{
        display: "inline-flex",
        overflow: "hidden",
        verticalAlign: "bottom",
        ...style,
      }}
    >
      {/* Screen reader only */}
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
        aria-live="polite"
      >
        {texts[idx]}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={idx}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          className={className}
          aria-hidden
          style={{ display: "inline-block" }}
        >
          {texts[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
