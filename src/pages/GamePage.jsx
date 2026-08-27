import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import DiceGame from "../games/DiceGame";
import WinnerGame from "../games/WinnerGame";
import YesNoGame from "../games/YesNoGame";
import { gameBySlug } from "../games/catalog";

const GAMES = {
  yesno: YesNoGame,
  dice: DiceGame,
  winner: WinnerGame,
};

const HOME_TITLE = "FootHub — бонусы букмекеров и прогнозы на спорт";

function OverlayFrame({ children }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-ink-950/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
      {children}
    </div>
  );
}

function Panel({ children }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900/95 p-5 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)]">
      {children}
    </div>
  );
}

export default function GamePage() {
  const { slug } = useParams();
  const game = gameBySlug(slug);
  const Game = GAMES[slug];

  const [status, setStatus] = useState("start");

  useEffect(() => {
    setStatus("start");
  }, [slug]);

  useEffect(() => {
    if (!game) return undefined;
    document.title = `${game.title} — игра | FootHub`;
    document.documentElement.classList.add("game-lock");
    const root = document.getElementById("game-root");
    const viewport = window.visualViewport;
    const fit = () => {
      if (!root) return;
      const height = viewport?.height || window.innerHeight;
      if (height >= 200) root.style.height = `${height}px`;
    };
    fit();
    viewport?.addEventListener("resize", fit);
    viewport?.addEventListener("scroll", fit);
    return () => {
      document.title = HOME_TITLE;
      document.documentElement.classList.remove("game-lock");
      viewport?.removeEventListener("resize", fit);
      viewport?.removeEventListener("scroll", fit);
      if (root) root.style.height = "";
    };
  }, [game]);

  if (!game || !Game) return <Navigate to="/games" replace />;

  return (
    <div id="game-root" className="flex h-dvh min-h-dvh flex-col bg-ink-950">
      <Header compact />
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <Game status={status} />
        </div>

        {status === "start" ? (
          <OverlayFrame>
            <Panel>
              <p className="text-xs font-bold tracking-widest text-neon uppercase">
                18+. Для развлечения
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                {game.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {game.rule}
              </p>
              <p className="mt-2 text-sm font-bold text-white/45">
                Это не прогноз и не ставка. Играй сколько хочешь.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setStatus("playing")}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-b from-neon to-neon-dim text-base font-extrabold text-ink-950"
                >
                  Играть
                </button>
              </div>
              <Link
                to="/games"
                className="mt-3 flex min-h-11 items-center justify-center text-sm font-extrabold text-white/50"
              >
                Назад
              </Link>
            </Panel>
          </OverlayFrame>
        ) : null}
      </div>
    </div>
  );
}
