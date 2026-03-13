import ShaktiBackground from '@/components/ShaktiBackground';
import HeroSection from '@/components/HeroSection';
import PillarsGrid from '@/components/PillarsGrid';
import WeeklyPulse from '@/components/WeeklyPulse';
import DigitalShadow from '@/components/DigitalShadow';
import ConnectForm from '@/components/ConnectForm';
import { useProfileSettings, useActivePracticesCount } from '@/hooks/useProfileSettings';

const Index = () => {
  const { data: profile, isLoading: profileLoading } = useProfileSettings();
  const { data: practicesCount, isLoading: practicesLoading } = useActivePracticesCount();

  const locationData = profile?.locations && typeof profile.locations === 'object' && !Array.isArray(profile.locations)
    ? (profile.locations as { name: string; city_country: string | null })
    : null;
  const locationName = locationData?.city_country || locationData?.name || null;

  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />

      <main className="relative z-10 px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-12 gap-3 md:gap-4 max-w-[1400px] mx-auto">
          <HeroSection />

          {/* Current Location tile */}
          <div className="glass-tile col-span-12 md:col-span-4 row-span-1 p-6 md:p-8 flex flex-col justify-between">
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-accent">
              Current Location
            </span>
            <p className="font-display text-2xl md:text-3xl font-light italic mt-2">
              {profileLoading ? '...' : (locationName || 'Unknown')}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-2">
              {profile?.last_updated_at
                ? new Date(profile.last_updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : ''}
            </p>
          </div>

          {/* Active Practices tile */}
          <div className="glass-tile col-span-12 md:col-span-4 row-span-1 p-6 md:p-8 flex flex-col justify-center items-center text-center">
            <p className="font-display text-4xl md:text-5xl font-light italic">
              {practicesLoading ? '...' : (practicesCount ?? 0)}
            </p>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">
              Active Practices
            </p>
          </div>

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
