import { useEffect, useRef } from "react";

/**
 * Вешает three.js-игру на canvas. Колбэки читаются из ref, чтобы
 * игровой цикл не пересоздавался на каждый setState из HUD.
 */
export function useGame(create, { statusRef, onWin, onLose, onHud, onError }) {
  const canvasRef = useRef(null);
  const callbacks = useRef({ statusRef, onWin, onLose, onHud, onError });
  callbacks.current = { statusRef, onWin, onLose, onHud, onError };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !create) return undefined;

    let disposed = false;
    let game = null;
    let raf = 0;
    let last = performance.now();
    let observer = null;

    try {
      game = create(canvas, {
        getStatus: () => callbacks.current.statusRef.current,
        onWin: () => callbacks.current.onWin?.(),
        onLose: (reason) => callbacks.current.onLose?.(reason),
        onHud: (hud) => callbacks.current.onHud?.(hud),
      });
    } catch (error) {
      callbacks.current.onError?.(error);
      return undefined;
    }

    const parent = canvas.parentElement;
    const resize = () => {
      if (disposed || !parent) return;
      game.resize(parent.clientWidth, parent.clientHeight);
    };
    resize();
    observer = new ResizeObserver(resize);
    observer.observe(parent);

    const loop = (now) => {
      if (disposed) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      try {
        game.update(dt);
        game.render();
      } catch (error) {
        console.error(error);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      game?.dispose();
    };
  }, [create]);

  return canvasRef;
}
