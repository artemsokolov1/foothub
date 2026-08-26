import { useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import ExpressOfDay, { formatDate, sportBlock } from "../components/ExpressOfDay";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CHANNELS } from "../data/bookmakers";

const COPY = {
  hockey: {
    badge: "КХЛ",
    title: "Хоккей",
    accent: "экспресс",
    lead: "Разбор дня по клубам КХЛ. Ставку собирай в Телеграме — на сайте только информация.",
    empty: "Хоккейного экспресса на сегодня пока нет. Как появится на stavka — карточка обновится сама.",
  },
  esports: {
    badge: "CS2 и Dota",
    title: "Киберспорт",
    accent: "дня",
    lead: "Матчи из топа дня. Ролики по киберу не собираем: без платного API и без чужих клипов со стримов.",
    empty: "В топе дня сейчас нет CS2 и Dota. Как появятся — будут здесь.",
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

        {parlays.length ? (
          <ExpressOfDay data={data} kicker="Экспресс" accent="дня" />
        ) : null}

        {kind === "esports" && matches.length ? (
          <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Матчи дня
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {matches.map((match, index) => (
                <li
                  key={`${match.slug || match.home}-${index}`}
                  className="rounded-2xl border border-white/8 bg-ink-900/80 px-4 py-4"
                >
                  <p className="text-[10px] font-bold tracking-widest text-neon uppercase">
                    {match.game || "Киберспорт"}
                    {match.league ? ` · ${match.league}` : ""}
                  </p>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">
                    {match.home} — {match.away}
                  </p>
                  {match.kickoff ? (
                    <p className="mt-1 text-sm text-white/50">{match.kickoff} МСК</p>
                  ) : null}
                </li>
              ))}
            </ul>
            <a
              href={CHANNELS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-neon to-neon-dim px-6 py-3.5 text-base font-extrabold text-ink-950 shadow-[0_8px_0_-2px_#4f7a10]"
            >
              <Send className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
              Разбор в Телеграм
            </a>
          </section>
        ) : null}

        {!parlays.length && !(kind === "esports" && matches.length) ? (
          <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <p className="rounded-2xl border border-white/8 bg-ink-900/80 px-5 py-6 text-base text-white/60">
              {meta.empty}
            </p>
            <Link to="/" className="mt-5 inline-flex min-h-11 items-center text-sm font-extrabold text-neon">
              На главную — футбол
            </Link>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
