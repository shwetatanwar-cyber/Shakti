import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ShaktiBackground from '@/components/ShaktiBackground';
import HeroSection from '@/components/HeroSection';
import PillarsGrid from '@/components/PillarsGrid';
import WeeklyPulse from '@/components/WeeklyPulse';
import ConnectForm from '@/components/ConnectForm';

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />

      {/* Back to landing */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-40 group flex items-center gap-2 px-4 py-2 rounded-full glass-tile border border-border/40 hover:border-accent/50 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-accent group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">
          Back to Oracle
        </span>
      </Link>

      <main className="relative z-10 px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-12 gap-3 md:gap-4 max-w-[1400px] mx-auto">
          <HeroSection />
          <PillarsGrid />
        </div>
      </main>

      <WeeklyPulse />

      <ConnectForm />

      <footer className="relative z-10 px-4 md:px-8 py-16 text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">
          This is a living document · It breathes with me
        </p>
      </footer>
    </div>
  );
};

export default Index;
