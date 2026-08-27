import { motion } from "framer-motion";

/**
 * Обычные матчи дня с витрины stavka — отдельно от экспресса.
 */
function kickoffMinutes(match) {
  const text = String(match?.kickoff || "");
  const [hours, minutes] = text.replace(".", ":").split(":");
  const hour = Number.parseInt(hours, 10);
  const minute = Number.parseInt(minutes, 10);
  if (!Number.isFinite(hour)) return 24 * 60;
  return hour * 60 + (Number.isFinite(minute) ? minute : 0);
}

export default function MatchesOfDay({ matches, title = "Матчи дня" }) {
  const list = Array.isArray(matches)
    ? [...matches].sort((a, b) => kickoffMinutes(a) - kickoffMinutes(b))
    : [];
  if (!list.length) return null;

  return (
    <section
      id="matches"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-12 sm:px-6 sm:pb-16"
    >
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl"
      >
        {title}
      </motion.h2>
      <ul className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
        {list.map((match, index) => (
          <li
            key={`${match.slug || match.home}-${index}`}
            className="rounded-2xl border border-white/8 bg-ink-900/80 px-4 py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[10px] font-bold tracking-widest text-neon uppercase">
                {match.game || "Матч"}
                {match.league ? ` · ${match.league}` : ""}
              </p>
              {match.kickoff ? (
                <span className="shrink-0 text-xs font-semibold text-white/40">
                  {match.kickoff} МСК
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-lg font-extrabold tracking-tight">
              {match.home} — {match.away}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
