import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";

function navClass({ isActive }) {
  return (
    "flex h-11 items-center rounded-xl px-3 text-sm font-extrabold tracking-tight " +
    (isActive ? "bg-white/8 text-neon" : "text-white/70 hover:text-white")
  );
}

/**
 * Шапка: слева логотип с названием, справа раздел игр, бонусы, аватарка.
 *
 * compact — на странице игры, чтобы канвасу осталось больше высоты.
 */
export default function Header({ compact = false }) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl"
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 ${
          compact ? "py-2 sm:py-2.5" : "py-3 sm:py-4"
        }`}
      >
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src="/logo.png"
            alt="Логотип FootHub"
            width="44"
            height="44"
            className={`shrink-0 rounded-xl object-cover shadow-[0_6px_20px_-6px_rgba(182,255,60,0.55)] ${
              compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-11 sm:w-11"
            }`}
          />
          <span className="truncate text-lg font-extrabold tracking-tight sm:text-xl">
            Foot
            <span className="bg-gradient-to-r from-neon to-flame bg-clip-text text-transparent">
              Hub
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NavLink to="/games" className={navClass}>
            Игры
          </NavLink>
          <Link
            to="/#bonuses"
            className="flex h-11 items-center rounded-xl px-3 text-sm font-extrabold tracking-tight text-white/70 hover:text-white"
          >
            Бонусы
          </Link>
          <div className="relative ml-1 shrink-0">
            <div
              aria-hidden="true"
              className="absolute -inset-1 rounded-full bg-gradient-to-br from-neon/40 to-flame/30 blur-md"
            />
            <img
              src="/avatar.jpg"
              alt="Аватар канала"
              width="48"
              height="48"
              className={`relative rounded-full object-cover ring-2 ring-white/15 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.9)] ${
                compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-11 w-11 sm:h-12 sm:w-12"
              }`}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
