import BookmakerGrid from "../components/BookmakerGrid";
import ExpressOfDay from "../components/ExpressOfDay";
import Footer from "../components/Footer";
import GamesTeaser from "../components/GamesTeaser";
import Header from "../components/Header";
import Hero from "../components/Hero";

export default function HomePage() {
  return (
    <div className="glow-field flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ExpressOfDay />
        <GamesTeaser />
        <BookmakerGrid />
      </main>
      <Footer />
    </div>
  );
}
