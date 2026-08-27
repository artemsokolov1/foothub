import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PLAYERS, rubPerSecond } from "../data/players";

const STARTED_KEY = "foothub-visit-start";

function visitStart() {
  try {
    const saved = Number(sessionStorage.getItem(STARTED_KEY));
    if (Number.isFinite(saved) && saved > 0) return saved;
    const now = Date.now();
    sessionStorage.setItem(STARTED_KEY, String(now));
    return now;
  } catch {
    return Date.now();
  }
}

function formatRub(value) {
  if (value < 10) {
    return `${value.toFixed(2).replace(".", ",")} ₽`;
  }
  if (value < 1000) {
    return `${value.toFixed(0)} ₽`;
  }
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(value))} ₽`;
}

function formatRate(value) {
  return `${value.toFixed(0)} ₽/сек`;
}

export default function EarningsWhileHere() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = visitStart();
    let frame = 0;
    const tick = () => {
      setElapsed(Math.max(0, (Date.now() - started) / 1000));
      frame = window.requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        setElapsed(Math.max(0, (Date.now() - started) / 1000));
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl"
      >
        Пока ты{" "}
        <span className="bg-gradient-to-r from-neon to-flame bg-clip-text text-transparent">
          на сайте
        </span>
      </motion.h2>
      <p className="mt-3 max-w-xl text-base text-white/60 sm:text-lg">
        Секунды капают — и у них тоже. Шуточная оценка, сколько успело
        набежать за твоё время здесь. В рублях, по секундам.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {PLAYERS.map((player, index) => {
          const rate = rubPerSecond(player.usdPerYear);
          const earned = rate * elapsed;
          return (
            <motion.li
              key={player.id}
              initial={{ y: 22, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-2xl border border-white/8 bg-ink-900/80"
            >
              <img
                src={player.photo}
                alt=""
                width="480"
                height="480"
                className="aspect-square w-full object-cover"
              />
              <div className="px-4 py-4">
                <p className="text-[10px] font-bold tracking-widest text-neon uppercase">
                  {player.club}
                </p>
                <p className="mt-1 text-lg font-extrabold tracking-tight">
                  {player.name}
                </p>
                <p className="mt-3 text-xs font-semibold text-white/40">уже набежало</p>
                <p className="mt-0.5 font-mono text-2xl font-extrabold tracking-tight text-neon tabular-nums sm:text-3xl">
                  {formatRub(earned)}
                </p>
                <p className="mt-1 text-xs text-white/35">{formatRate(rate)}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-white/35">
        Оценка по открытым обзорам годового дохода, курс ЦБ 84,28 ₽ за доллар.
        Это не точная зарплата и не оферта.
      </p>
    </section>
  );
}
