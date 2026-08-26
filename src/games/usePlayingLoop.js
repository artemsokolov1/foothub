import { useEffect, useRef } from "react";

/** Игровой цикл только пока `active`. На паузе время не идёт. */
export function usePlayingLoop(active, callback) {
  const cb = useRef(callback);
  cb.current = callback;

  useEffect(() => {
    if (!active) return undefined;
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cb.current(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
