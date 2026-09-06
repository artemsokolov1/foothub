import BookmakerGrid from "../components/BookmakerGrid";
import EarningsWhileHere from "../components/EarningsWhileHere";
import Footer from "../components/Footer";
import GamesTeaser from "../components/GamesTeaser";
import Header from "../components/Header";
import Hero from "../components/Hero";
import NewsOfDay from "../components/NewsOfDay";
import SportsTeaser from "../components/SportsTeaser";

export default function HomePage() {
  return (
    <div className="glow-field flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <SportsTeaser />
        <NewsOfDay />
        <GamesTeaser />
        <BookmakerGrid />
        <EarningsWhileHere />
      </main>
      <Footer />
    </div>
  );
}
