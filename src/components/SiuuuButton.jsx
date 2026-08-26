import { useRef } from "react";
import { useLocation } from "react-router-dom";

const SRC = "/sfx/siuuu.mp3";

/**
 * Два <audio> по очереди: играем заранее заряженный, предыдущий стопаем.
 * Web Audio на телефоне снова остался немым — не используем.
 */
export default function SiuuuButton() {
  const { pathname } = useLocation();
  const aRef = useRef(null);
  const bRef = useRef(null);
  const useA = useRef(true);
  const lastTap = useRef(0);
  const btnRef = useRef(null);
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
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const now = performance.now();
    // pointerdown + click на одном тапе не должны сыграть дважды
    if (now - lastTap.current < 50) return;
    lastTap.current = now;

    const next = useA.current ? aRef.current : bRef.current;
    const prev = useA.current ? bRef.current : aRef.current;
    useA.current = !useA.current;

    if (prev) {
      prev.pause();
      try {
        prev.currentTime = 0;
      } catch {
        /* iOS */
      }
    }
    if (!next) return;
    try {
      next.currentTime = 0;
    } catch {
      /* iOS */
    }
    const playing = next.play();
    if (playing && typeof playing.catch === "function") playing.catch(() => {});
    kickAnimation();
  }

  return (
    <>
      <audio ref={aRef} src={SRC} preload="auto" playsInline className="hidden" />
      <audio ref={bRef} src={SRC} preload="auto" playsInline className="hidden" />
      <button
        ref={btnRef}
        type="button"
        onPointerDown={yell}
        onClick={yell}
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
    </>
  );
}
