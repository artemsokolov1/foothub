import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const SRC = "/sfx/siuuu.mp3";

/**
 * Крик без паузы: буфер заранее в памяти, новый тап стопает старый источник
 * и стартует сразу. pause()+currentTime на <audio> даёт тишину на телефоне.
 */
export default function SiuuuButton() {
  const { pathname } = useLocation();
  const ctxRef = useRef(null);
  const bufferRef = useRef(null);
  const sourceRef = useRef(null);
  const fallbackRef = useRef(null);
  const btnRef = useRef(null);
  const hideOnGame = /^\/games\/.+/.test(pathname);

  useEffect(() => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      const audio = new Audio(SRC);
      audio.preload = "auto";
      audio.load();
      fallbackRef.current = audio;
      return () => {
        audio.pause();
        fallbackRef.current = null;
      };
    }

    const ctx = new Ctx();
    ctxRef.current = ctx;
    let cancelled = false;
    fetch(SRC)
      .then((res) => res.arrayBuffer())
      .then((raw) => (cancelled ? null : ctx.decodeAudioData(raw)))
      .then((buf) => {
        if (!cancelled && buf) bufferRef.current = buf;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      try {
        sourceRef.current?.stop();
      } catch {
        /* уже остановлен */
      }
      sourceRef.current = null;
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

  function startSource() {
    const ctx = ctxRef.current;
    const buf = bufferRef.current;
    if (!ctx || !buf) return;
    if (sourceRef.current) {
      try {
        sourceRef.current.stop(0);
      } catch {
        /* уже остановлен */
      }
      sourceRef.current = null;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    sourceRef.current = src;
  }

  function yell(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    kickAnimation();

    const ctx = ctxRef.current;
    if (ctx && bufferRef.current) {
      if (ctx.state === "running") {
        startSource();
        return;
      }
      // resume обязан вызваться в том же жесте, иначе iOS молчит.
      ctx.resume().then(startSource).catch(() => {});
      return;
    }

    const audio = fallbackRef.current;
    if (!audio) return;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      /* первый play на iOS */
    }
    const playing = audio.play();
    if (playing && typeof playing.catch === "function") playing.catch(() => {});
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
