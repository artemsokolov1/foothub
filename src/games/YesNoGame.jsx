import { useEffect, useRef, useState } from "react";

const CLIPS = {
  // labelAt — секунда, с которой в клипе начинается речь (замерено по RMS).
  yes: { src: "/games/ben-yes.mp4", label: "ДА", labelAt: 0.34 },
  no: { src: "/games/ben-no.mp4", label: "НЕТ", labelAt: 0.48 },
};
const POSTER = "/games/ben-idle.jpg";

/**
 * Говорящий Бен: тап — ролик yes или no. Клипы без чёрных полей,
 * звук идёт из видео (жест пользователя, чтобы iOS не глушил).
 * Плашка ДА/НЕТ появляется в момент начала речи, не после ролика.
 * Играть можно сколько угодно: раунд не заканчивается бонусом.
 */
export default function YesNoGame({ status }) {
  const yesRef = useRef(null);
  const noRef = useRef(null);
  const failSafe = useRef(0);
  const labelWait = useRef(0);
  const labelRaf = useRef(0);
  const armedFor = useRef(null);
  const pickRef = useRef(null);
  const saidRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState(null);
  const [said, setSaid] = useState(null);

  function clearWaits() {
    window.clearTimeout(failSafe.current);
    window.clearTimeout(labelWait.current);
    window.cancelAnimationFrame(labelRaf.current);
  }

  function clipEl(key) {
    return key === "yes" ? yesRef.current : noRef.current;
  }

  function reveal(key) {
    if (pickRef.current !== key || saidRef.current) return;
    saidRef.current = CLIPS[key].label;
    setSaid(CLIPS[key].label);
    window.clearTimeout(labelWait.current);
    window.cancelAnimationFrame(labelRaf.current);
  }

  function armLabel(key) {
    const el = clipEl(key);
    if (!el || pickRef.current !== key || saidRef.current) return;
    if (armedFor.current === key) return;
    armedFor.current = key;
    window.clearTimeout(labelWait.current);
    window.cancelAnimationFrame(labelRaf.current);
    const started = performance.now();
    const target = CLIPS[key].labelAt;
    const tick = () => {
      if (pickRef.current !== key || saidRef.current) return;
      const elapsed = (performance.now() - started) / 1000;
      const t = el.currentTime || 0;
      if (t >= target || elapsed >= target || el.ended) {
        reveal(key);
        return;
      }
      labelRaf.current = window.requestAnimationFrame(tick);
    };
    labelRaf.current = window.requestAnimationFrame(tick);
    // Если currentTime на телефоне замирает, плашка всё равно всплывёт по часам от старта воспроизведения.
    labelWait.current = window.setTimeout(() => reveal(key), target * 1000 + 30);
  }

  function finish(key) {
    if (pickRef.current !== key) return;
    reveal(key);
    setBusy(false);
    window.clearTimeout(failSafe.current);
  }

  useEffect(() => () => clearWaits(), []);

  useEffect(() => {
    if (status === "playing") return undefined;
    setBusy(false);
    setPick(null);
    pickRef.current = null;
    armedFor.current = null;
    saidRef.current = null;
    setSaid(null);
    clearWaits();
    for (const el of [yesRef.current, noRef.current]) {
      if (!el) continue;
      el.pause();
      el.currentTime = 0;
    }
    return undefined;
  }, [status]);

  async function ask() {
    if (busy || status !== "playing") return;
    const key = Math.random() < 0.5 ? "yes" : "no";
    const el = clipEl(key);
    if (!el) return;
    setBusy(true);
    saidRef.current = null;
    armedFor.current = null;
    setSaid(null);
    setPick(key);
    pickRef.current = key;
    const other = key === "yes" ? noRef.current : yesRef.current;
    if (other) {
      other.pause();
      other.currentTime = 0;
    }
    el.muted = false;
    el.currentTime = 0;
    try {
      await el.play();
    } catch {
      finish(key);
      return;
    }
    // Плашку вешаем от onPlaying/onTimeUpdate — тогда она совпадает с началом речи, а не с тапом.
    armLabel(key);
    window.clearTimeout(failSafe.current);
    failSafe.current = window.setTimeout(() => finish(key), 2500);
  }

  if (status !== "playing") {
    return <div className="h-full bg-ink-950" />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-ink-950 px-4">
      <p className="mb-4 text-center text-sm font-semibold text-white/50">
        Подумай вопрос и тапни Бена
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={ask}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            ask();
          }
        }}
        aria-label="Спросить Бена"
        aria-disabled={busy}
        className="relative w-full max-w-xs cursor-pointer overflow-hidden rounded-2xl bg-[#1a0f08] [touch-action:manipulation]"
      >
        <img
          src={POSTER}
          alt=""
          width="720"
          height="800"
          draggable={false}
          className={`block w-full ${pick ? "invisible" : ""}`}
        />
        {["yes", "no"].map((key) => (
          <video
            key={key}
            ref={key === "yes" ? yesRef : noRef}
            src={CLIPS[key].src}
            playsInline
            webkit-playsinline="true"
            preload="auto"
            disablePictureInPicture
            controls={false}
            className={`absolute inset-0 h-full w-full object-cover ${
              pick === key ? "visible" : "invisible"
            }`}
            onPlaying={() => armLabel(key)}
            onTimeUpdate={(event) => {
              if (event.currentTarget.currentTime >= CLIPS[key].labelAt) reveal(key);
            }}
            onEnded={() => finish(key)}
            onError={() => {
              if (pickRef.current === key) finish(key);
            }}
          />
        ))}
        {said ? (
          <span className="absolute top-3 left-1/2 -translate-x-1/2 rounded-2xl bg-white px-5 py-2 text-2xl font-extrabold text-ink-950 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]">
            {said}
          </span>
        ) : null}
      </div>
      <p className="mt-6 text-xs text-white/35">18+. Для развлечения.</p>
    </div>
  );
}
