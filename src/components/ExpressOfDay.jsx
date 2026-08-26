import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { CHANNELS } from "../data/bookmakers";
import express from "../data/express.json";

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function formatDate(iso) {
  if (!iso) return "";
  const [year, month, day] = String(iso).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${MONTHS[month - 1]}`;
}

export function formatOdd(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 1) return "—";
  return n.toFixed(2);
}

export function sportBlock(kind) {
  const nested = express?.[kind];
  if (nested && (Array.isArray(nested.parlays) || Array.isArray(nested.matches))) {
    return nested;
  }
  if (kind === "football" && Array.isArray(express?.parlays)) return express;
  return { parlays: [], matches: [] };
}

/**
 * Сколько экспрессов пришло со stavka — столько карточек.
 * Подписи фиксированные: «Экспресс дня №1», «Экспресс дня №2».
 */
export default function ExpressOfDay({
  data,
  kicker = "Экспресс",
  accent = "дня",
  showCta = true,
}) {
  const source = data || sportBlock("football");
  const parlays = Array.isArray(source?.parlays) ? source.parlays : [];
  if (!parlays.length) return null;

  const dateLabel = formatDate(source.date);

  return (
    <section
      id="express"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-14 sm:px-6 sm:pb-20"
    >
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl"
      >
        {kicker}{" "}
        <span className="bg-gradient-to-r from-neon to-flame bg-clip-text text-transparent">
          {accent}
        </span>
      </motion.h2>
      {dateLabel ? (
        <p className="mt-3 text-base text-white/60 sm:text-lg">на {dateLabel}</p>
      ) : null}

      <ul
        className={`mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:gap-5 ${
          parlays.length > 1 ? "lg:grid-cols-2" : ""
        }`}
      >
        {parlays.map((parlay, index) => (
          <li key={parlay.number ?? index}>
            <article className="edge-glow flex h-full flex-col rounded-2xl border border-white/8 bg-ink-900/80 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  {parlay.title || `Экспресс дня №${parlay.number ?? index + 1}`}
                </h3>
                <p className="shrink-0 text-right">
                  <span className="block text-[10px] font-bold tracking-widest text-white/40 uppercase">
                    кф
                  </span>
                  <span className="block text-2xl font-extrabold text-neon sm:text-3xl">
                    {formatOdd(parlay.total_odd)}
                  </span>
                </p>
              </div>

              <ol className="mt-5 flex flex-col gap-3">
                {(parlay.legs || []).map((leg, legIndex) => (
                  <li
                    key={`${leg.home}-${leg.away}-${legIndex}`}
                    className="rounded-xl border border-white/6 bg-ink-950/50 px-3.5 py-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 text-sm font-extrabold tracking-tight sm:text-base">
                        {leg.home} — {leg.away}
                      </p>
                      {leg.kickoff ? (
                        <span className="shrink-0 text-xs font-semibold text-white/40">
                          {leg.kickoff}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-white/70">{leg.pick}</p>
                      <p className="font-mono text-sm font-extrabold text-flame">
                        {formatOdd(leg.odd)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          </li>
        ))}
      </ul>

      {showCta ? (
        <a
          href={CHANNELS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-neon to-neon-dim px-6 py-3.5 text-base font-extrabold text-ink-950 shadow-[0_8px_0_-2px_#4f7a10] transition-transform duration-150 active:translate-y-[3px] active:shadow-[0_5px_0_-2px_#4f7a10] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-neon sm:w-auto sm:px-8"
        >
          <Send className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          Собрать в Телеграм
        </a>
      ) : null}

      {showCta ? (
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-white/40 sm:text-sm">
          18+. Прогноз носит информационный характер и не является призывом к ставке.
        </p>
      ) : null}
    </section>
  );
}
