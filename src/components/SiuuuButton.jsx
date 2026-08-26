import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const SRC = "/sfx/siuuu.mp3";

/**
 * Один крик за раз: новый тап обрывает предыдущий, а не наслаивается.
 * Web Audio не используем — на телефоне он часто остаётся немым.
 */
export default function SiuuuButton() {
  const { pathname } = useLocation();
  const audioRef = useRef(null);
  const btnRef = useRef(null);
  const hideOnGame = /^\/games\/.+/.test(pathname);

  useEffect(() => {
    const audio = new Audio(SRC);
    audio.preload = "auto";
    audio.load();
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
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

  function yell(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      /* iOS иногда не даёт мотать до первого play — тогда просто play. */
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
