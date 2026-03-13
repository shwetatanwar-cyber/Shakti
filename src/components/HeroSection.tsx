import { useProfileSettings } from '@/hooks/useProfileSettings';
import { format } from 'date-fns';

const HeroSection = () => {
  const { data: profile, isLoading } = useProfileSettings();

  const locationData = profile?.locations && typeof profile.locations === 'object' && !Array.isArray(profile.locations)
    ? (profile.locations as { name: string; city_country: string | null })
    : null;
  const locationName = locationData?.city_country || locationData?.name || null;

  const lastUpdated = profile?.last_updated_at
    ? format(new Date(profile.last_updated_at), 'MMM d, yyyy')
    : null;

  return (
    <div className="glass-tile col-span-12 md:col-span-8 row-span-2 p-8 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col justify-end">
      <div
        className="absolute inset-0 animate-breathe pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 70%, hsl(var(--saffron) / 0.15), transparent 60%)',
        }}
      />

      <div className="relative z-10">
        {locationName && (
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
            📍 {locationName}
          </p>
        )}
        <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Creative Energy · Embodied Practice
          {lastUpdated && <span className="ml-4 opacity-60">Updated {lastUpdated}</span>}
        </p>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight mb-6">
          <span className="italic">{isLoading ? 'Shakti' : (profile?.name || 'Shakti')}</span>
          <br />
          <span className="text-3xl md:text-4xl lg:text-5xl font-light opacity-70">
            {isLoading ? 'flows through the silence' : (profile?.one_liner || 'flows through the silence')}
          </span>
        </h1>

        <p className="font-body text-sm md:text-base max-w-lg text-muted-foreground leading-relaxed">
          I am a vessel for creative energy — weaving movement, sound, and stillness
          into a practice that bridges the ancient and the infinite. This is not a portfolio.
          It is a living record.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
