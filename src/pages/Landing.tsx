import { Link } from "react-router-dom";
import { useState } from "react";
import ShaktiBackground from "@/components/ShaktiBackground";
import OracleFunnel from "@/components/OracleFunnel";
import CosmicWheel from "@/components/CosmicWheel";

const Landing = () => {
  const [bottomFormOpen, setBottomFormOpen] = useState(false);
  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-24 md:space-y-32">
        {/* BLOCK 1: HERO */}
        <section className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="space-y-5 md:space-y-6">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
              Vedic-Tech · The Cosmic Blueprint
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[0.95] tracking-tight">
              Decode your love life with <span className="italic">Tara</span>
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              Most relationship crises aren't personal failures; they are hidden planetary shifts running in the
              background. Align your next move with the ultimate cosmic math.
            </p>

            <div className="pt-2 md:hidden">
              <CosmicWheel />
            </div>

            <div className="pt-2">
              <OracleFunnel
                variant="inline"
                ctaText="Get My Free Reading"
                ctaSubtext="⚡ Private AI. No human eyes. Instant generation."
                ctaPosition="hero_inline"
              />
            </div>
          </div>

          <div className="hidden md:block">
            <CosmicWheel />
          </div>
        </section>

        {/* BLOCK 2: LOGIC LAYER */}
        <section className="space-y-10 md:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">The Logic Layer</p>
            <h2 className="font-display text-4xl md:text-5xl font-light italic leading-tight">
              How Tara decodes the cosmic math
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
              Your birth moment captured 9 cosmic bodies across 12 life areas at one exact timestamp. This creates a
              highly specific 27-point personality map that reveals your mental and emotional wiring.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                sym: "01",
                title: "Raw Inputs",
                body: "Date · Time · City · Coordinates. Four fixed data points cross-referenced with real-time astronomical positions.",
              },
              {
                sym: "02",
                title: "The Calculation",
                body: "9 planets × 12 life zones × 27 traits. No guesswork, no generic horoscopes — pure mathematical probability.",
              },
              {
                sym: "03",
                title: "Mahadashas",
                body: 'Planetary shifts activate different parts of your energy over time. Your "current vibe" or sudden anxiety is just a phase requiring specific handling.',
              },
            ].map((card) => (
              <div key={card.sym} className="glass-tile p-6 space-y-3">
                <p className="font-display italic text-3xl text-accent">{card.sym}</p>
                <h3 className="font-body text-xs tracking-[0.3em] uppercase text-foreground">{card.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BLOCK 3: FINAL CLOSE */}
        <section className="space-y-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">Get Started</p>
            <h2 className="font-display text-4xl md:text-5xl font-light italic leading-tight">
              Claim the love you deserve
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
              Stop guessing why you're stressed, stuck, or repeating the same relationship patterns. Just enter your
              birth details and watch Tara unlock your the best version of your relationship.
            </p>
          </div>

          <div className="pt-2">
            {!bottomFormOpen ? (
              <div className="w-full max-w-md mx-auto space-y-3">
                <button
                  type="button"
                  onClick={() => setBottomFormOpen(true)}
                  className="w-full font-body text-sm font-semibold tracking-[0.18em] uppercase px-6 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/30"
                >
                  Initialize Private Chat →
                </button>
                <p className="text-center font-body text-xs text-muted-foreground">
                  First 5 minutes are on us. Break-even on clarity today.
                </p>
              </div>
            ) : (
              <OracleFunnel
                variant="inline"
                ctaText="Initialize Private Chat"
                ctaSubtext="First 5 minutes are on us. Break-even on clarity instantly."
                ctaPosition="footer_inline"
              />
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-0 px-4 md:px-8 py-12 mt-20 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            © Digital Shadow · A living interface
          </p>
          <Link
            to="/shakti"
            className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors"
          >
            The Founder's Hardware Architecture →
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
