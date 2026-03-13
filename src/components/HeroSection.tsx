import { useState } from 'react';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { format } from 'date-fns';

const HeroSection = () => {
  const { data: profile, isLoading } = useProfileSettings();
  const [showDescription, setShowDescription] = useState(false);

  const locationData = profile?.locations && typeof profile.locations === 'object' && !Array.isArray(profile.locations)
    ? (profile.locations as { name: string; city_country: string | null; description: string | null })
    : null;

  // Display logic: "{name}, {city_country}" — fallback if name is null or same as city_country
  const getLocationDisplay = () => {
    if (!locationData) return null;
    const { name, city_country } = locationData;
    if (!name && !city_country) return null;
    if (!name || name === city_country) return city_country;
    if (!city_country) return name;
    return `${name}, ${city_country}`;
  };

  const locationDisplay = getLocationDisplay();
  const locationDescription = locationData?.description || null;

  const lastUpdated = profile?.last_updated_at
    ? format(new Date(profile.last_updated_at), 'MMM d, yyyy')
    : null;

  return (
    <div className="glass-tile col-span-12 row-span-2 p-8 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col justify-end">
      <div
        className="absolute inset-0 animate-breathe pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 70%, hsl(var(--saffron) / 0.15), transparent 60%)',
        }}
      />

      <div className="relative z-10">
        {locationDisplay && (
          <div className="mb-2 inline-block relative">
            <button
              className="group font-body text-[10px] tracking-[0.3em] uppercase text-accent flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:bg-accent/10 cursor-pointer"
              onMouseEnter={() => setShowDescription(true)}
              onMouseLeave={() => setShowDescription(false)}
              onClick={() => setShowDescription((prev) => !prev)}
              aria-expanded={showDescription}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              📍 {locationDisplay}
              <span className="block w-0 group-hover:w-full h-px bg-accent/40 transition-all duration-500 absolute bottom-0.5 left-3" />
            </button>

            {/* Glassmorphism description tooltip */}
            <div
              className={`absolute top-full left-0 mt-2 max-w-sm z-20 transition-all duration-400 ease-out ${
                showDescription && locationDescription
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-1 pointer-events-none'
              }`}
            >
              <div className="px-4 py-3 rounded-xl border border-border bg-card/80 backdrop-blur-xl shadow-lg shadow-accent/5">
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  {locationDescription}
                </p>
              </div>
            </div>
          </div>
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
