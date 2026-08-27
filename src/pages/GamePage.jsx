import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
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

export default function GamePage() {
  const { slug } = useParams();
  const game = gameBySlug(slug);
  const Game = GAMES[slug];

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
          <Game status="playing" />
        </div>
      </div>
    </div>
  );
}
