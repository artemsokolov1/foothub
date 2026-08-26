import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const SRC = "/sfx/siuuu.mp3";

/**
 * Каждый тап сразу орёт. Один <audio> на телефоне не успевает
 * перемотаться — держим пул и на новый тап берём свободный или новый.
 * Web Audio здесь не используем: контекст, созданный без жеста, на iOS
 * остаётся немым.
 */
export default function SiuuuButton() {
  const { pathname } = useLocation();
  const poolRef = useRef([]);
  const btnRef = useRef(null);
  const hideOnGame = /^\/games\/.+/.test(pathname);

  useEffect(() => {
    const first = new Audio(SRC);
    first.preload = "auto";
    first.load();
    poolRef.current = [first];
    return () => {
      poolRef.current = [];
    };
  }, []);

  if (hideOnGame) return null;

  function kickAnimation() {
    const el = btnRef.current;
    if (!el) return;
    el.classList.remove("siuuu-yell");
    void el.offsetWidth;
    el.classList.add("siuuu-yell");
  }

  function nextShot() {
    const pool = poolRef.current;
    const free = pool.find((a) => a.paused || a.ended);
    if (free) return free;
    const extra = new Audio(SRC);
    pool.push(extra);
    return extra;
  }

  function yell(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const shot = nextShot();
    try {
      shot.currentTime = 0;
    } catch {
      /* iOS иногда не даёт мотать, пока не сыграло — тогда просто play. */
    }
    const playing = shot.play();
    if (playing && typeof playing.catch === "function") playing.catch(() => {});
    kickAnimation();
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onPointerDown={yell}
      aria-label="SIUUU"
      className="fixed z-40 flex h-20 w-20 touch-manipulation items-end justify-center select-none sm:h-24 sm:w-24"
      style={{
        right: "max(0.75rem, env(safe-area-inset-right))",
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <img
        src="/ronaldo-siuuu.png"
        alt=""
        width="96"
        height="98"
        draggable="false"
        className="pointer-events-none h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.65)]"
      />
    </button>
  );
}
