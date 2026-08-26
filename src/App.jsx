import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ScrollManager from "./components/ScrollManager";
import SiuuuButton from "./components/SiuuuButton";
import HomePage from "./pages/HomePage";
import SportPage from "./pages/SportPage";

const GamesHubPage = lazy(() => import("./pages/GamesHubPage"));
const GamePage = lazy(() => import("./pages/GamePage"));

function PageFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 text-sm font-semibold text-white/45">
      Загрузка…
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <SiuuuButton />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hockey" element={<SportPage kind="hockey" />} />
          <Route path="/esports" element={<SportPage kind="esports" />} />
          <Route path="/games" element={<GamesHubPage />} />
          <Route path="/games/:slug" element={<GamePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </>
  );
}
