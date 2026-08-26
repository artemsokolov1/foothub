import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SPORTS } from "../data/sports";

export default function SportsTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl"
      >
        Три вида{" "}
        <span className="bg-gradient-to-r from-neon to-flame bg-clip-text text-transparent">
          спорта
        </span>
      </motion.h2>
      <p className="mt-3 max-w-xl text-base text-white/60 sm:text-lg">
        Футбол — основной. Хоккей и киберспорт — свои разделы, без отдельного
        канала и без чужих ставок.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {SPORTS.map((sport) => (
          <li key={sport.id}>
            <Link
              to={sport.path}
              className="flex min-h-11 flex-col rounded-2xl border border-white/8 bg-ink-900/80 px-4 py-4 transition-colors hover:border-neon/35"
            >
              <span className="text-[10px] font-bold tracking-widest text-neon uppercase">
                {sport.accent}
              </span>
              <span className="mt-1 text-lg font-extrabold tracking-tight">
                {sport.title}
              </span>
              <span className="mt-1 text-sm text-white/50">{sport.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
