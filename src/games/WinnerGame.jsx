import { useEffect, useRef, useState } from "react";

export default function WinnerGame({ status }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [busy, setBusy] = useState(false);
  const [winner, setWinner] = useState("");
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (status !== "playing") {
      window.clearTimeout(timer.current);
      setBusy(false);
      setWinner("");
    }
  }, [status]);

  if (status !== "playing") {
    return <div className="h-full bg-ink-950" />;
  }

  const a = home.trim() || "Команда 1";
  const b = away.trim() || "Команда 2";

  function pick() {
    if (busy) return;
    if (!home.trim() || !away.trim()) return;
    setBusy(true);
    setWinner("");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setWinner(Math.random() < 0.5 ? a : b);
      setBusy(false);
    }, 900);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-ink-950 px-4">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <label className="text-xs font-bold tracking-widest text-white/40 uppercase">
          Хозяева
          <input
            value={home}
            onChange={(event) => setHome(event.target.value)}
            placeholder="Спартак"
            maxLength={40}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-base font-extrabold text-white outline-none placeholder:text-white/25 focus:border-neon/50"
          />
        </label>
        <p className="text-center text-sm font-extrabold text-white/35">против</p>
        <label className="text-xs font-bold tracking-widest text-white/40 uppercase">
          Гости
          <input
            value={away}
            onChange={(event) => setAway(event.target.value)}
            placeholder="Зенит"
            maxLength={40}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-base font-extrabold text-white outline-none placeholder:text-white/25 focus:border-neon/50"
          />
        </label>
        <button
          type="button"
          onClick={pick}
          disabled={busy || !home.trim() || !away.trim()}
          className="mt-2 min-h-12 rounded-xl bg-gradient-to-b from-neon to-neon-dim text-base font-extrabold text-ink-950 disabled:opacity-40"
        >
          {busy ? "Считаем…" : "Кто выиграет"}
        </button>
        {winner ? (
          <p className="mt-3 text-center text-2xl font-extrabold tracking-tight text-neon">
            {winner}
          </p>
        ) : null}
        <p className="text-center text-xs text-white/35">
          18+. Случайный выбор, не прогноз.
        </p>
      </div>
    </div>
  );
}
