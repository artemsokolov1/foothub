import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

/**
 * Карточка, которая наклоняется вслед за курсором.
 *
 * Наклон считается на CSS-трансформациях, без WebGL: страница должна
 * открываться мгновенно, а не грузить сцену ради подсветки.
 *
 * На тач-устройствах эффект выключен намеренно. Наклон там нечем вызвать —
 * курсора нет, — а «залипшее» наведение после тапа выглядит поломкой.
 */
export default function TiltCard({ children, className = "", max = 9 }) {
  const ref = useRef(null);
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Доли от -0.5 до 0.5: позиция курсора внутри карточки.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const spring = { stiffness: 220, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), spring);

  function onMove(event) {
    if (!enabled || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    x.set((event.clientX - box.left) / box.width - 0.5);
    y.set((event.clientY - box.top) / box.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        enabled
          ? { rotateX, rotateY, transformStyle: "preserve-3d", perspective: 900 }
          : undefined
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
