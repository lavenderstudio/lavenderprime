// Adapted from ReactBits (reactbits.dev) — TiltCard
// 3-D perspective tilt on hover, driven by Framer Motion springs.
// Strips the imageSrc/caption API — instead accepts `children` so it
// can wrap any card content.

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SPRING = { damping: 30, stiffness: 100, mass: 2 };

export default function TiltCard({
  children,
  className = "",
  rotateAmplitude = 10,
  scaleOnHover = 1.03,
  style = {},
}) {
  const ref = useRef(null);
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale   = useSpring(1, SPRING);
  const [lastY, setLastY] = useState(0);

  function handleMouse(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width  / 2;
    const offsetY = e.clientY - rect.top  - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width  / 2)) *  rotateAmplitude);
    setLastY(offsetY);
  }

  function handleMouseEnter() { scale.set(scaleOnHover); }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 800, ...style }}
    >
      <motion.div
        className={className}
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
