import { motion } from "framer-motion";
import { BOOKMAKERS } from "../data/bookmakers";
import BookmakerCard from "./BookmakerCard";

/**
 * Сетка бонусов: одна колонка на телефоне, две на планшете, три на десктопе.
 * Это и есть весь адаптив — карточка тянется сама, ломать её нечем.
 */
export default function BookmakerGrid() {
  return (
    <section
      id="bonuses"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-24"
    >
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl"
      >
        Топ бонусы от{" "}
        <span className="bg-gradient-to-r from-neon to-flame bg-clip-text text-transparent">
          надёжных БК
        </span>
      </motion.h2>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {BOOKMAKERS.map((bookmaker, index) => (
          <BookmakerCard key={bookmaker.id} bookmaker={bookmaker} index={index} />
        ))}
      </ul>
    </section>
  );
}
