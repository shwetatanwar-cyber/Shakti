import ShaktiBackground from '@/components/ShaktiBackground';
import HeroSection from '@/components/HeroSection';
import PillarsGrid from '@/components/PillarsGrid';
import WeeklyPulse from '@/components/WeeklyPulse';
import DigitalOracle from '@/components/DigitalOracle';

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />

      {/* Bento Grid */}
      <main className="relative z-10 px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-12 gap-3 md:gap-4 max-w-[1400px] mx-auto">
          <HeroSection />

          {/* Right column small tiles */}
          <div className="glass-tile col-span-12 md:col-span-4 row-span-1 p-6 md:p-8 flex flex-col justify-between">
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-accent">
              Current Phase
            </span>
            <p className="font-display text-2xl md:text-3xl font-light italic mt-2">
              Dissolution
            </p>
            <p className="font-body text-xs text-muted-foreground mt-2">
              Waning Crescent · Day 26
            </p>
          </div>

          <div className="glass-tile col-span-12 md:col-span-4 row-span-1 p-6 md:p-8 flex flex-col justify-center items-center text-center">
            <p className="font-display text-4xl md:text-5xl font-light italic">
              108
            </p>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">
              Days of Practice
            </p>
          </div>

          {/* Pillars */}
          <PillarsGrid />
        </div>
      </main>

      {/* Weekly Pulse - Full bleed */}
      <WeeklyPulse />

      {/* Footer */}
      <footer className="relative z-10 px-4 md:px-8 py-16 text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">
          This is a living document · It breathes with me
        </p>
      </footer>

      {/* Digital Oracle */}
      <DigitalOracle />
    </div>
  );
};

export default Index;
