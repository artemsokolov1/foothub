import { MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { CHANNELS } from "../data/bookmakers";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/6 bg-ink-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 pb-28 sm:px-6 sm:py-12 sm:pb-12">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Logo compact className="rounded-lg" />
            <span className="text-base font-extrabold tracking-tight">
              FootHub
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-extrabold text-white/50">
            <Link to="/" className="flex min-h-11 items-center hover:text-neon">
              Главная
            </Link>
            <Link to="/football" className="flex min-h-11 items-center hover:text-neon">
              Футбол
            </Link>
            <Link to="/hockey" className="flex min-h-11 items-center hover:text-neon">
              Хоккей
            </Link>
            <Link to="/esports" className="flex min-h-11 items-center hover:text-neon">
              Кибер
            </Link>
            <Link to="/games" className="flex min-h-11 items-center hover:text-neon">
              Игры
            </Link>
            <Link to="/#bonuses" className="flex min-h-11 items-center hover:text-neon">
              Бонусы
            </Link>
          </nav>

          <nav className="flex items-center gap-3">
            <a
              href={CHANNELS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram-канал"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-white/75 transition-colors hover:border-neon/45 hover:text-neon"
            >
              <Send className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
            </a>
            <a
              href={CHANNELS.max}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Канал на MAX"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-white/75 transition-colors hover:border-flame/45 hover:text-flame"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
            </a>
          </nav>
        </div>

        {/* Дисклеймер обязателен и не должен теряться: рамка и отдельный
            блок, а не серая строчка десятым кеглем. */}
        <p className="rounded-xl border border-white/8 bg-ink-900/60 px-4 py-3.5 text-xs leading-relaxed text-white/45 sm:text-sm">
          <span className="font-extrabold text-white/70">18+.</span> Сайт носит
          исключительно информационный характер. Азартные игры могут вызывать
          зависимость. Играйте ответственно.
        </p>
      </div>
    </footer>
  );
}
