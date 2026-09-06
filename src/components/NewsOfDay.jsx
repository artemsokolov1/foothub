import { motion } from "framer-motion";
import news from "../data/news.json";

/**
 * Лента новостей футбола. Живёт только на сайте: в канал новости не идут,
 * там прогнозы (ADR-158).
 *
 * Заголовки чужие, поэтому каждый — ссылка на первоисточник: пересказывать
 * их своими словами мы не будем, а отдавать без ссылки нечестно.
 */
export default function NewsOfDay({ limit = 6 }) {
  const items = Array.isArray(news?.items) ? news.items.slice(0, limit) : [];
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl"
      >
        Новости футбола
      </motion.h2>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.url || index}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-white/8 bg-ink-900/80 px-4 py-4 transition-colors hover:border-neon/35"
            >
              <p className="text-[10px] font-bold tracking-widest text-neon uppercase">
                {item.source}
                {Number.isFinite(item.hours) ? ` · ${formatAge(item.hours)}` : ""}
              </p>
              <p className="mt-1 text-base leading-snug font-bold tracking-tight">
                {item.title}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** «40 минут назад» читается лучше, чем «0.7 ч». */
function formatAge(hours) {
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(hours * 60));
    return `${minutes} мин назад`;
  }
  const whole = Math.round(hours);
  const tail = whole % 10 === 1 && whole % 100 !== 11 ? "час"
    : [2, 3, 4].includes(whole % 10) && ![12, 13, 14].includes(whole % 100) ? "часа"
    : "часов";
  return `${whole} ${tail} назад`;
}
