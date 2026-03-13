import ShaktiBackground from '@/components/ShaktiBackground';
import HeroSection from '@/components/HeroSection';
import PillarsGrid from '@/components/PillarsGrid';
import WeeklyPulse from '@/components/WeeklyPulse';
import DigitalShadow from '@/components/DigitalShadow';
import ConnectForm from '@/components/ConnectForm';
import { useProfileSettings } from '@/hooks/useProfileSettings';

const Index = () => {
  const { data: profile } = useProfileSettings();

  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />

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

      <DigitalShadow />
    </div>
  );
};

export default Index;
