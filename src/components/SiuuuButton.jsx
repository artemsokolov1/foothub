import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Голова из мема: каждый тап сразу кричит. На телефоне один <audio>
 * не успевает перезапуститься — Web Audio играет поверх, без очереди.
 */
export default function SiuuuButton() {
  const { pathname } = useLocation();
  const ctxRef = useRef(null);
  const bufferRef = useRef(null);
  const btnRef = useRef(null);
  const hideOnGame = /^\/games\/.+/.test(pathname);

  useEffect(() => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return undefined;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    let cancelled = false;
    fetch("/sfx/siuuu.mp3")
      .then((res) => res.arrayBuffer())
      .then((raw) => ctx.decodeAudioData(raw))
      .then((buf) => {
        if (!cancelled) bufferRef.current = buf;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      ctx.close().catch(() => {});
      ctxRef.current = null;
      bufferRef.current = null;
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
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    const ctx = ctxRef.current;
    const buffer = bufferRef.current;
    if (ctx && buffer) {
      if (ctx.state === "suspended") ctx.resume();
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start(0);
    } else {
      const shot = new Audio("/sfx/siuuu.mp3");
      shot.play().catch(() => {});
    }
    kickAnimation();
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onPointerDown={yell}
      onClick={(event) => event.preventDefault()}
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
