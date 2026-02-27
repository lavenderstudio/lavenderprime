// Adapted from ReactBits (reactbits.dev) — BlurText
// Animates each word in from a blurred / offset state on scroll-in.
// Uses framer-motion only — fully self-contained.

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function BlurText({
  text,
  tag = "p",
  className = "",
  delay = 60,            // ms stagger between words
  duration = 0.65,
  ease = [0.22, 1, 0.36, 1],
  threshold = 0.1,
  rootMargin = "-60px",
  animateBy = "words",   // "words" | "chars"
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: rootMargin });
  const Tag = tag;

  const elements =
    animateBy === "words"
      ? text.split(" ")
      : text.split("");

  return (
    <Tag ref={ref} className={className} style={{ display: "block" }}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(12px)", y: 14 }}
          animate={
            inView
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : {}
          }
          transition={{
            duration,
            delay: i * (delay / 1000),
            ease,
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {el}
          {animateBy === "words" && i < elements.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
