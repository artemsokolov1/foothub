import { motion } from "framer-motion";
import { Dices, HelpCircle, Swords } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import TiltCard from "../components/TiltCard";
import { GAMES } from "../games/catalog";

const ICONS = {
  yesno: HelpCircle,
  dice: Dices,
  winner: Swords,
};

export default function GamesHubPage() {
  useEffect(() => {
    document.title = "Игры — FootHub";
    return () => {
      document.title = "FootHub — бонусы букмекеров и прогнозы на спорт";
    };
  }, []);

  return (
    <div className="glow-field flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-10 pb-28 sm:px-6 sm:pt-14 sm:pb-24">
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-neon/25 bg-neon/10 px-3.5 py-1.5 text-xs font-bold tracking-wide text-neon uppercase"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-neon" />
          18+. Для развлечения, не ставка
        </motion.p>
        <motion.h1
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl"
        >
          Игры на{" "}
          <span className="bg-gradient-to-br from-neon via-neon to-flame bg-clip-text text-transparent">
            удачу
          </span>
        </motion.h1>
        <motion.p
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-xl"
        >
          Говорящий Бен, кубик и кто выиграет. Без регистрации, играй
          сколько хочешь.
        </motion.p>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
          {GAMES.map((game, index) => {
            const Icon = ICONS[game.slug] ?? HelpCircle;
            return (
              <motion.li
                key={game.slug}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 + index * 0.06 }}
              >
                <TiltCard className="h-full">
                  <Link
                    to={`/games/${game.slug}`}
                    className="edge-glow flex h-full min-h-44 flex-col rounded-2xl border border-white/8 bg-ink-900/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon/15 text-neon">
                      <Icon className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                      {game.title}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-white/45">
                      {game.tagline}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">
                      {game.rule}
                    </p>
                    <span className="mt-5 flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-neon to-neon-dim text-sm font-extrabold text-ink-950">
                      Играть
                    </span>
                  </Link>
                </TiltCard>
              </motion.li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
