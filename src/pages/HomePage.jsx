import BookmakerGrid from "../components/BookmakerGrid";
import ExpressOfDay, { sportBlock } from "../components/ExpressOfDay";
import Footer from "../components/Footer";
import GamesTeaser from "../components/GamesTeaser";
import Header from "../components/Header";
import Hero from "../components/Hero";
import MatchesOfDay from "../components/MatchesOfDay";
import SportsTeaser from "../components/SportsTeaser";

export default function HomePage() {
  const football = sportBlock("football");
  return (
    <div className="glow-field flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <MatchesOfDay matches={football.matches} />
        <ExpressOfDay data={football} />
        <SportsTeaser />
        <GamesTeaser />
        <BookmakerGrid />
      </main>
      <Footer />
    </div>
  );
}
