import { motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";

function itemClass(active) {
  return (
    "flex h-11 shrink-0 items-center rounded-xl px-3 text-sm font-extrabold tracking-tight " +
    (active ? "bg-white/8 text-neon" : "text-white/70 hover:text-white")
  );
}

function navClass({ isActive }) {
  return itemClass(isActive);
}

function Brand({ compact }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-3">
      <img
        src="/logo.png"
        alt="Логотип FootHub"
        width="44"
        height="44"
        className={`shrink-0 rounded-xl object-cover shadow-[0_6px_20px_-6px_rgba(182,255,60,0.55)] ${
          compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-11 sm:w-11"
        }`}
      />
      <span className="text-lg font-extrabold tracking-tight whitespace-nowrap sm:text-xl">
        Foot
        <span className="bg-gradient-to-r from-neon to-flame bg-clip-text text-transparent">
          Hub
        </span>
      </span>
    </Link>
  );
}

function SportNav() {
  const { pathname, hash } = useLocation();
  const bonuses = pathname === "/" && hash === "#bonuses";
  const home = pathname === "/" && !bonuses;

  return (
    <nav
      aria-label="Разделы"
      className="nav-scroll flex items-center gap-1 overflow-x-auto sm:justify-end"
    >
      <NavLink
        to={{ pathname: "/", hash: "" }}
        end
        className={() => itemClass(home)}
      >
        Главная
      </NavLink>
      <NavLink to="/football" className={navClass}>
        Футбол
      </NavLink>
      <NavLink to="/hockey" className={navClass}>
        Хоккей
      </NavLink>
      <NavLink to="/esports" className={navClass}>
        Кибер
      </NavLink>
      <NavLink to="/games" className={navClass}>
        Игры
      </NavLink>
      <Link to="/#bonuses" className={itemClass(bonuses)}>
        Бонусы
      </Link>
    </nav>
  );
}

/**
 * На телефоне два ряда: название никогда не режется разделами.
 * На десктопе всё в одну строку.
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
        className={`mx-auto max-w-6xl px-4 sm:px-6 ${
          compact ? "py-2 sm:py-2.5" : "py-3 sm:py-3"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <Brand compact={compact} />
          <div className="hidden min-w-0 flex-1 sm:block">
            {compact ? null : <SportNav />}
          </div>
        </div>
        {compact ? null : (
          <div className="mt-1 sm:hidden">
            <SportNav />
          </div>
        )}
      </div>
    </motion.header>
  );
}
