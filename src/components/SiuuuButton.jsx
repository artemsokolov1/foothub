import { useRef } from "react";
import { useLocation } from "react-router-dom";

const SRC = "/sfx/siuuu.mp3";

let shot = null;

function getShot() {
  if (!shot) {
    shot = new Audio(SRC);
    shot.preload = "auto";
    shot.playsInline = true;
    shot.load();
  }
  return shot;
}

/**
 * Один крик, новый тап обрывает старый.
 * preventDefault — иначе iOS при серии тапов зумит страницу.
 */
export default function SiuuuButton() {
  const { pathname } = useLocation();
  const btnRef = useRef(null);
  const lastTap = useRef(0);
  const hideOnGame = /^\/games\/.+/.test(pathname);

  if (hideOnGame) return null;

  function kickAnimation() {
    const el = btnRef.current;
    if (!el) return;
    el.classList.remove("siuuu-yell");
    void el.offsetWidth;
    el.classList.add("siuuu-yell");
  }

  function yell(event) {
    event.preventDefault();
    event.stopPropagation();
    const now = performance.now();
    if (now - lastTap.current < 40) return;
    lastTap.current = now;
    const audio = getShot();
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      /* iOS до первого play */
    }
    const playing = audio.play();
    if (playing && typeof playing.catch === "function") playing.catch(() => {});
    kickAnimation();
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onPointerDown={yell}
      onTouchStart={yell}
      aria-label="SIUUU"
      className="siuuu-btn fixed z-40 flex h-20 w-20 items-end justify-center sm:h-24 sm:w-24"
      style={{
        right: "max(0.75rem, env(safe-area-inset-right))",
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
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
