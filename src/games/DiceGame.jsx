import { useEffect, useRef, useState } from "react";

const PIPS = {
  1: ["c"],
  2: ["tl", "br"],
  3: ["tl", "c", "br"],
  4: ["tl", "tr", "bl", "br"],
  5: ["tl", "tr", "c", "bl", "br"],
  6: ["tl", "tr", "ml", "mr", "bl", "br"],
};

const SPOT = {
  tl: "top-2.5 left-2.5",
  tr: "top-2.5 right-2.5",
  ml: "top-1/2 left-2.5 -translate-y-1/2",
  mr: "top-1/2 right-2.5 -translate-y-1/2",
  c: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  bl: "bottom-2.5 left-2.5",
  br: "bottom-2.5 right-2.5",
};

export default function DiceGame({ status }) {
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const spinRef = useRef(0);

  useEffect(() => () => window.clearInterval(spinRef.current), []);

  useEffect(() => {
    if (status !== "playing") {
      window.clearInterval(spinRef.current);
      setValue(1);
      setRolling(false);
    }
  }, [status]);

  if (status !== "playing") {
    return <div className="h-full bg-ink-950" />;
  }

  function roll() {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    window.clearInterval(spinRef.current);
    spinRef.current = window.setInterval(() => {
      setValue(1 + Math.floor(Math.random() * 6));
      ticks += 1;
      if (ticks >= 10) {
        window.clearInterval(spinRef.current);
        setValue(1 + Math.floor(Math.random() * 6));
        setRolling(false);
      }
    }, 70);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-ink-950 px-4">
      <p className="mb-8 text-center text-sm font-semibold text-white/50">
        Нажми на кубик
      </p>
      <button
        type="button"
        onClick={roll}
        disabled={rolling}
        aria-label="Бросить кубик"
        className={`relative h-36 w-36 rounded-3xl bg-white shadow-[0_16px_0_#c9cdd6,0_22px_40px_-18px_rgba(0,0,0,0.7)] ${
          rolling ? "siuuu-yell" : ""
        }`}
      >
        {(PIPS[value] || []).map((spot) => (
          <span
            key={spot}
            className={`absolute h-6 w-6 rounded-full bg-ink-950 ${SPOT[spot]}`}
          />
        ))}
      </button>
      <p className="mt-8 text-4xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-4 text-xs text-white/35">18+. Для развлечения.</p>
    </div>
  );
}
