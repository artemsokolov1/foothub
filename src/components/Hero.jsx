import { motion } from "framer-motion";
import { ArrowDown, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { CHANNELS } from "../data/bookmakers";

const rise = {
  hidden: { y: 22, opacity: 0 },
  show: (delay = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * Кнопка с объёмом. Объём делается не тенью вокруг, а сдвигом самой кнопки
 * вниз при нажатии: палец должен чувствовать, что кнопка проминается.
 */
function ChannelButton({ href, icon: Icon, children, primary = false }) {
  const base =
    "group relative flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 " +
    "text-base font-extrabold tracking-tight transition-transform duration-150 " +
    "active:translate-y-[3px] sm:w-auto sm:px-8 sm:py-4.5 sm:text-lg " +
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon";

  const skin = primary
    ? "bg-gradient-to-b from-neon to-neon-dim text-ink-950 " +
      "shadow-[0_10px_0_-2px_#4f7a10,0_18px_34px_-12px_rgba(182,255,60,0.65)] " +
      "active:shadow-[0_6px_0_-2px_#4f7a10,0_12px_24px_-14px_rgba(182,255,60,0.6)]"
    : "bg-ink-800 text-white ring-1 ring-white/12 " +
      "shadow-[0_10px_0_-2px_#0b0d12,0_18px_34px_-16px_rgba(255,122,26,0.5)] " +
      "active:shadow-[0_6px_0_-2px_#0b0d12,0_12px_24px_-18px_rgba(255,122,26,0.45)]";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${skin}`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
      {children}
    </a>
  );
}

export default function Hero() {
  return (
    <section
      id="forecasts"
      className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24"
    >
      <motion.p
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/10 px-3.5 py-1.5 text-xs font-bold tracking-wide text-neon uppercase sm:text-sm"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-neon" />
        Бонусы, игры и прогнозы каждый день
      </motion.p>

      <motion.h1
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0.08}
        className="max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
      >
        Забирай лучшие{" "}
        <span className="bg-gradient-to-br from-neon via-neon to-flame bg-clip-text text-transparent">
          бонусы и прогнозы
        </span>{" "}
        на спорт
      </motion.h1>

      <motion.p
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0.16}
        className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:mt-6 sm:text-xl"
      >
        Эксклюзивные фрибеты и актуальная информация в наших каналах.
      </motion.p>

      <motion.div
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0.24}
        className="mt-9 flex flex-col gap-3 sm:mt-11 sm:flex-row sm:flex-wrap sm:gap-4"
      >
        <ChannelButton href={CHANNELS.telegram} icon={Send} primary>
          Телеграм канал
        </ChannelButton>
        <ChannelButton href={CHANNELS.max} icon={MessageCircle}>
          Канал в MAX
        </ChannelButton>
      </motion.div>

      <motion.div
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0.34}
        className="mt-10 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:items-center sm:gap-6"
      >
        <Link
          to="/football"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/45 transition-colors hover:text-neon"
        >
          Футбол — матчи и экспресс
        </Link>
        <Link
          to="/games"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/45 transition-colors hover:text-neon"
        >
          Игры — да/нет, кубик
        </Link>
        <a
          href="#bonuses"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/45 transition-colors hover:text-neon"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
          Смотреть бонусы БК
        </a>
      </motion.div>
    </section>
  );
}
