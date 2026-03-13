import { useRef, useState, useEffect } from 'react';
import { useWeeklyPulse } from '@/hooks/useProfileSettings';
import { format } from 'date-fns';

const WeeklyPulse = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const { data: entries, isLoading } = useWeeklyPulse();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;
      setProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <section className="w-full py-16 md:py-24 relative">
      <div className="px-4 md:px-8 mb-8">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-accent mb-2">
          Weekly Pulse
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-light italic">
          Last 7 Day Reflections
        </h2>
      </div>

      <div className="mx-4 md:mx-8 mb-6 h-px bg-muted relative">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-150"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, hsl(var(--violet)), hsl(var(--violet) / 0.3))',
          }}
        />
      </div>

      <div
        ref={scrollRef}
        className="horizontal-scroll-container flex overflow-x-auto gap-0 pl-4 md:pl-8 pr-4 md:pr-8"
      >
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[300px] md:w-[380px] py-6 px-6 animate-pulse">
              <div className="h-3 w-10 bg-muted rounded mb-4" />
              <div className="h-6 w-40 bg-muted rounded mb-3" />
              <div className="h-16 w-full bg-muted rounded" />
            </div>
          ))
        ) : entries && entries.length > 0 ? (
          entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex-shrink-0 w-[300px] md:w-[380px] py-6 px-6 relative"
              style={{
                borderLeft: index > 0 ? '1px solid hsl(var(--violet) / 0.3)' : 'none',
              }}
            >
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-accent">
                {entry.reflection_date
                  ? `${dayLabels[new Date(entry.reflection_date).getDay()]} · ${format(new Date(entry.reflection_date), 'MMM d')}`
                  : `Day ${index + 1}`}
              </span>
              {entry.mood_score !== null && (
                <span className="ml-3 font-body text-[10px] text-muted-foreground">
                  Mood: {entry.mood_score}/10
                </span>
              )}
              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3">
                {entry.content}
              </p>
            </div>
          ))
        ) : (
          <div className="flex-shrink-0 py-6 px-6">
            <p className="font-body text-sm text-muted-foreground italic">No reflections yet.</p>
          </div>
        )}
        <div className="flex-shrink-0 w-8" />
      </div>
    </section>
  );
};

export default WeeklyPulse;
