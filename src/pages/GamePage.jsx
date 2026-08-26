import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import BonusScreen from "../games/BonusScreen";
import KeeperGame from "../games/KeeperGame";
import KeepyUpGame from "../games/KeepyUpGame";
import PenaltyGame from "../games/PenaltyGame";
import { gameBySlug } from "../games/catalog";

const GAMES = {
  penalty: PenaltyGame,
  keepyup: KeepyUpGame,
  keeper: KeeperGame,
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

function BigButton({ onClick, children, primary = true }) {
  const skin = primary
    ? "bg-gradient-to-b from-neon to-neon-dim text-ink-950 shadow-[0_8px_0_-2px_#4f7a10] active:translate-y-[3px] active:shadow-[0_5px_0_-2px_#4f7a10]"
    : "bg-ink-800 text-white ring-1 ring-white/12";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-base font-extrabold transition-transform duration-150 ${skin}`}
    >
      {children}
    </button>
  );
}

export default function GamePage() {
  const { slug } = useParams();
  const game = gameBySlug(slug);
  const Game = GAMES[slug];

  const [status, setStatus] = useState("start");
  const [playKey, setPlayKey] = useState(0);
  const [loseReason, setLoseReason] = useState("");
  const winTimer = useRef(0);

  useEffect(() => {
    setStatus("start");
    setLoseReason("");
  }, [slug]);

  useEffect(() => {
    if (!game) return undefined;
    document.title = `${game.title} — футбольная игра | FootHub`;
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

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        setStatus((current) => (current === "playing" ? "paused" : current));
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => () => window.clearTimeout(winTimer.current), []);

  const onWin = useCallback(() => {
    window.clearTimeout(winTimer.current);
    winTimer.current = window.setTimeout(() => setStatus("won"), 500);
  }, []);

  const onLose = useCallback((reason) => {
    setLoseReason(reason || "Не вышло");
    window.clearTimeout(winTimer.current);
    winTimer.current = window.setTimeout(() => setStatus("lost"), 450);
  }, []);

  const retry = useCallback(() => {
    window.clearTimeout(winTimer.current);
    setLoseReason("");
    setStatus("playing");
    setPlayKey((key) => key + 1);
  }, []);

  if (!game || !Game) return <Navigate to="/games" replace />;

  const playing = status === "playing";

  return (
    <div id="game-root" className="flex h-dvh min-h-dvh flex-col bg-ink-950">
      <Header compact />
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <Game
            key={`${slug}-${playKey}`}
            status={status}
            onWin={onWin}
            onLose={onLose}
          />
        </div>

        {playing || status === "paused" ? (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-start justify-end px-3">
            {playing ? (
              <button
                type="button"
                onClick={() => setStatus("paused")}
                aria-label="Пауза"
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-900/80 text-white"
              >
                <Pause className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}

        {status === "start" ? (
          <OverlayFrame>
            <Panel>
              <p className="text-xs font-bold tracking-widest text-neon uppercase">
                Футбольная игра
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                {game.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {game.rule}
              </p>
              <p className="mt-2 text-sm font-bold text-white/45">
                Цель: {game.goal}. Победа открывает бонус букмекера с сайта.
              </p>
              <div className="mt-5">
                <BigButton onClick={() => setStatus("playing")}>Играть</BigButton>
              </div>
              <Link
                to="/games"
                className="mt-3 flex min-h-11 items-center justify-center text-sm font-extrabold text-white/50"
              >
                К играм
              </Link>
            </Panel>
          </OverlayFrame>
        ) : null}

        {status === "paused" ? (
          <OverlayFrame>
            <Panel>
              <h2 className="text-2xl font-extrabold tracking-tight">Пауза</h2>
              <div className="mt-5 flex flex-col gap-3">
                <BigButton onClick={() => setStatus("playing")}>
                  <span className="inline-flex items-center gap-2">
                    <Play className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
                    Продолжить
                  </span>
                </BigButton>
                <Link
                  to="/games"
                  className="flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-sm font-extrabold text-white/80"
                >
                  К играм
                </Link>
              </div>
            </Panel>
          </OverlayFrame>
        ) : null}

        {status === "lost" ? (
          <OverlayFrame>
            <Panel>
              <p className="text-xs font-bold tracking-widest text-flame uppercase">
                Поражение
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                {loseReason || "Не вышло"}
              </h2>
              <p className="mt-2 text-sm text-white/55">
                Бонус за проигрыш не выдаём — можно сразу сыграть ещё раз.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <BigButton onClick={retry}>Ещё раз</BigButton>
                <Link
                  to="/#forecasts"
                  className="flex min-h-11 items-center justify-center text-sm font-extrabold text-white/55"
                >
                  Смотреть прогнозы
                </Link>
              </div>
            </Panel>
          </OverlayFrame>
        ) : null}

        {status === "won" ? (
          <OverlayFrame>
            <BonusScreen onRetry={retry} />
          </OverlayFrame>
        ) : null}
      </div>
    </div>
  );
}
