import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import ExpressOfDay, { formatDate, sportBlock } from "../components/ExpressOfDay";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MatchesOfDay from "../components/MatchesOfDay";

const COPY = {
  football: {
    badge: "Футбол",
    title: "Футбол",
    accent: "сегодня",
    lead: "Матчи дня и экспресс.",
    empty: "Футбольных матчей на сегодня пока нет. Как появятся — страница обновится сама.",
  },
  hockey: {
    // Не «КХЛ»: раздел не ограничен одной лигой — НХЛ и другие тоже.
    badge: "Хоккей",
    title: "Хоккей",
    accent: "сегодня",
    lead: "Матчи дня и экспресс.",
    empty: "Хоккейных матчей и экспресса на сегодня пока нет. Как появятся — страница обновится сама.",
  },
  esports: {
    badge: "CS2 и Dota",
    title: "Киберспорт",
    accent: "сегодня",
    lead: "Матчи дня и экспресс.",
    empty: "Киберматчей на сегодня пока нет. Как появятся — страница обновится сама.",
  },
};

const HOME_TITLE = "FootHub — бонусы букмекеров и прогнозы на спорт";

export default function SportPage({ kind }) {
  const meta = COPY[kind];
  const data = sportBlock(kind);
  const parlays = Array.isArray(data.parlays) ? data.parlays : [];
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const dateLabel = formatDate(data.date);

  useEffect(() => {
    if (!meta) return undefined;
    document.title = `${meta.title} — FootHub`;
    return () => {
      document.title = HOME_TITLE;
    };
  }, [meta]);

  if (!meta) return <Navigate to="/" replace />;

  const empty = !parlays.length && !matches.length;

  return (
    <div className="glow-field flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/10 px-3.5 py-1.5 text-xs font-bold tracking-wide text-neon uppercase"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-neon" />
            {meta.badge}
          </motion.p>
          <motion.h1
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl"
          >
            {meta.title}{" "}
            <span className="bg-gradient-to-br from-neon via-neon to-flame bg-clip-text text-transparent">
              {meta.accent}
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-xl"
          >
            {meta.lead}
          </motion.p>
          {dateLabel ? (
            <p className="mt-3 text-sm font-semibold text-white/40">на {dateLabel}</p>
          ) : null}
        </section>

        <MatchesOfDay matches={matches} />
        {parlays.length ? (
          <ExpressOfDay data={data} kicker="Экспресс" accent="дня" />
        ) : null}

        {empty ? (
          <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <p className="rounded-2xl border border-white/8 bg-ink-900/80 px-5 py-6 text-base text-white/60">
              {meta.empty}
            </p>
            <Link to="/" className="mt-5 inline-flex min-h-11 items-center text-sm font-extrabold text-neon">
              На главную
            </Link>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
