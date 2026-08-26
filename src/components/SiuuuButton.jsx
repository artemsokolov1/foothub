import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Голова из мема в углу: тап — тот же SIUUU, что в конце ролика
 * (assets/sfx/siuuu.mp3). На страницах игр прячем, чтобы не перекрывать канвас.
 */
export default function SiuuuButton() {
  const { pathname } = useLocation();
  const audioRef = useRef(null);
  const [yelling, setYelling] = useState(false);
  const hideOnGame = /^\/games\/.+/.test(pathname);

  useEffect(() => {
    const audio = new Audio("/sfx/siuuu.mp3");
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  if (hideOnGame) return null;

  async function yell() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch {
      /* без жеста браузер может зажать звук — повторный тап пройдёт. */
    }
    setYelling(true);
    window.setTimeout(() => setYelling(false), 700);
  }

  return (
    <button
      type="button"
      onClick={yell}
      aria-label="SIUUU"
      className={`fixed z-40 flex h-20 w-20 items-end justify-center sm:h-24 sm:w-24 ${
        yelling ? "siuuu-yell" : ""
      }`}
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
        className="h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.65)]"
      />
    </button>
  );
}
