import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ShaktiBackground from '@/components/ShaktiBackground';
import HeroSection from '@/components/HeroSection';
import PillarsGrid from '@/components/PillarsGrid';
import WeeklyPulse from '@/components/WeeklyPulse';
import ConnectForm from '@/components/ConnectForm';
import oraclePortrait from '@/assets/oracle-portrait.jpg';
import { useProfileSettings } from '@/hooks/useProfileSettings';

const Index = () => {
  const { data: profile } = useProfileSettings();

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

        {/* Founder portrait */}
        <section className="max-w-[1400px] mx-auto mt-16 md:mt-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <div
              className="absolute -inset-6 rounded-full opacity-40 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(var(--violet)/0.4), hsl(var(--saffron)/0.2), transparent)' }}
            />
            <img
              src={oraclePortrait}
              alt="The Founder — vector portrait"
              width={1024}
              height={1024}
              loading="lazy"
              className="relative rounded-3xl border border-border w-full"
            />
          </div>
          <div className="space-y-5">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
              The Architect
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light italic leading-tight">
              The hardware behind the oracle.
            </h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              Eight pillars. One living system. This is the configuration that runs underneath the interface — every practice, every experiment, every line of code that compiled the Digital Shadow.
            </p>
          </div>
        </section>
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
