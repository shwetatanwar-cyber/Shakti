import { useRef, useState, useEffect } from 'react';

const reflections = [
  { day: "Mon", title: "The Unraveling", text: "Sat with discomfort for 40 minutes. The ego tried to negotiate. I let it speak, then let it dissolve." },
  { day: "Tue", title: "Electric Dawn", text: "Movement session at 5am. The body became liquid. There is a frequency between effort and surrender — I found it." },
  { day: "Wed", title: "Hollow Bone", text: "Became a channel today. The words that came through during breathwork were not mine. I wrote them down anyway." },
  { day: "Thu", title: "The Forge", text: "Resistance is the raw material. Today I met it with curiosity instead of force. The alchemy happened on its own." },
  { day: "Fri", title: "Tessellation", text: "Patterns within patterns. The mandala practice revealed a geometry I have been carrying in my ribcage." },
  { day: "Sat", title: "Still Water", text: "No practice today. Sometimes the deepest work is allowing yourself to be completely ordinary." },
  { day: "Sun", title: "The Return", text: "Closed the week with a fire ceremony. Everything I released turned to light before it turned to ash." },
];

const WeeklyPulse = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

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

      {/* Progress bar */}
      <div className="mx-4 md:mx-8 mb-6 h-px bg-muted relative">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-150"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, hsl(270 76% 53%), hsl(270 76% 53% / 0.3))',
          }}
        />
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="horizontal-scroll-container flex overflow-x-auto gap-0 pl-4 md:pl-8 pr-4 md:pr-8"
      >
        {reflections.map((reflection, index) => (
          <div
            key={reflection.day}
            className="flex-shrink-0 w-[300px] md:w-[380px] py-6 px-6 relative"
            style={{
              borderLeft: index > 0 ? '1px solid hsl(270 76% 53% / 0.3)' : 'none',
            }}
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-accent">
              {reflection.day}
            </span>
            <h3 className="font-display text-xl md:text-2xl font-light italic mt-2 mb-3">
              {reflection.title}
            </h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {reflection.text}
            </p>
          </div>
        ))}
        {/* Spacer */}
        <div className="flex-shrink-0 w-8" />
      </div>
    </section>
  );
};

export default WeeklyPulse;
