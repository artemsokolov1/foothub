import { motion } from "framer-motion";
import { Goal, Hand, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { GAMES } from "../games/catalog";

const ICONS = {
  penalty: Goal,
  keepyup: Hand,
  keeper: Shield,
};

export default function GamesTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl"
      >
        Футбольные{" "}
        <span className="bg-gradient-to-r from-neon to-flame bg-clip-text text-transparent">
          игры
        </span>
      </motion.h2>
      <p className="mt-3 max-w-xl text-base text-white/60 sm:text-lg">
        Выиграй бонус у букмекера — пенальти, чеканка, вратарь. С телефона,
        одной рукой.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {GAMES.map((game) => {
          const Icon = ICONS[game.slug] ?? Goal;
          return (
            <li key={game.slug}>
              <Link
                to={`/games/${game.slug}`}
                className="flex min-h-11 items-center gap-3 rounded-2xl border border-white/8 bg-ink-900/80 px-4 py-4 transition-colors hover:border-neon/35"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neon/15 text-neon">
                  <Icon className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-extrabold tracking-tight">
                    {game.title}
                  </span>
                  <span className="block truncate text-sm text-white/50">
                    {game.tagline}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        to="/games"
        className="mt-5 inline-flex min-h-11 items-center text-sm font-extrabold text-neon"
      >
        Все игры
      </Link>
    </section>
  );
}
