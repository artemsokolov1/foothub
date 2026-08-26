import { useEffect, useRef, useState } from "react";

/**
 * Говорящий пёс: тап — да или нет. Как Бен, только без голоса.
 */
export default function YesNoGame({ status, onWin }) {
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [shake, setShake] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (status !== "playing") {
      setAnswer(null);
      setBusy(false);
      done.current = false;
    }
  }, [status]);

  if (status !== "playing") {
    return <div className="h-full bg-ink-950" />;
  }

  function ask() {
    if (busy) return;
    setBusy(true);
    setAnswer(null);
    setShake(true);
    window.setTimeout(() => {
      setShake(false);
      const yes = Math.random() < 0.5;
      setAnswer(yes ? "ДА" : "НЕТ");
      setBusy(false);
      if (!done.current) {
        done.current = true;
        window.setTimeout(() => onWin?.(), 900);
      }
    }, 700);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-ink-950 px-4">
      <p className="mb-6 text-center text-sm font-semibold text-white/50">
        Подумай вопрос и тапни пса
      </p>
      <button
        type="button"
        onClick={ask}
        disabled={busy}
        aria-label="Спросить пса"
        className={`relative flex h-56 w-56 items-center justify-center ${
          shake ? "siuuu-yell" : ""
        }`}
      >
        <DogFace talking={busy} />
        {answer ? (
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-2xl bg-white px-5 py-2 text-2xl font-extrabold text-ink-950 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]">
            {answer}
          </span>
        ) : null}
      </button>
      <p className="mt-8 text-xs text-white/35">18+. Для развлечения.</p>
    </div>
  );
}

function DogFace({ talking }) {
  return (
    <span className="relative block h-44 w-44" aria-hidden="true">
      <span className="absolute top-2 left-3 h-16 w-12 -rotate-12 rounded-full bg-[#6b4423]" />
      <span className="absolute top-2 right-3 h-16 w-12 rotate-12 rounded-full bg-[#6b4423]" />
      <span className="absolute inset-x-4 top-8 bottom-2 rounded-[42%] bg-[#c4a574] shadow-[inset_0_-12px_0_#b08f5e]" />
      <span className="absolute top-16 left-12 h-5 w-5 rounded-full bg-ink-950" />
      <span className="absolute top-16 right-12 h-5 w-5 rounded-full bg-ink-950" />
      <span className="absolute top-[5.5rem] left-1/2 h-6 w-8 -translate-x-1/2 rounded-full bg-[#5a3418]" />
      <span
        className={`absolute left-1/2 h-3 w-10 -translate-x-1/2 rounded-full bg-[#3a2212] ${
          talking ? "top-[8.2rem] w-12" : "top-32"
        }`}
      />
    </span>
  );
}
