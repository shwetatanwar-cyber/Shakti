import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Pillar {
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  span: string;
}

const pillars: Pillar[] = [
  {
    title: "Evolution",
    subtitle: "Growth as practice",
    description: "The spiral of becoming. Each cycle refines, each iteration deepens the pattern.",
    slug: "evolution",
    span: "col-span-12 sm:col-span-6 md:col-span-4 row-span-2",
  },
  {
    title: "The Vision",
    subtitle: "Artist · Seeing beyond sight",
    description: "The third eye does not look outward. It looks inward, and finds infinity.",
    slug: "vision",
    span: "col-span-12 sm:col-span-6 md:col-span-4 row-span-1",
  },
  {
    title: "The Flow",
    subtitle: "Dance · Movement as meditation",
    description: "The body remembers what the mind forgets. Through movement, we return to the source.",
    slug: "flow",
    span: "col-span-12 sm:col-span-6 md:col-span-4 row-span-1",
  },
  {
    title: "The Vibration",
    subtitle: "Music · Sound as architecture",
    description: "Every frequency is a doorway. We build cathedrals from resonance.",
    slug: "vibrations",
    span: "col-span-12 sm:col-span-6 md:col-span-4 row-span-2",
  },
  {
    title: "The Stillness",
    subtitle: "Yoga · Silence as power",
    description: "In the pause between breaths, the universe whispers its secrets.",
    slug: "stillness",
    span: "col-span-12 sm:col-span-6 md:col-span-4 row-span-1",
  },
  {
    title: "The Alchemy",
    subtitle: "Nutrition · Transformation as art",
    description: "We transmute the raw material of experience into gold. Lead into light.",
    slug: "alchemy",
    span: "col-span-12 sm:col-span-6 md:col-span-4 row-span-1",
  },
  {
    title: "The Pilgrimage",
    subtitle: "Travel · Journey as destination",
    description: "Every step is an arrival. The path and the pilgrim are one.",
    slug: "pilgrimage",
    span: "col-span-12 sm:col-span-6 md:col-span-4 row-span-1",
  },
  {
    title: "Resonance",
    subtitle: "Inspiration · Echoes of influence",
    description: "We are shaped by what moves us. These are the frequencies that formed this vessel.",
    slug: "resonance",
    span: "col-span-12 sm:col-span-6 md:col-span-4 row-span-1",
  },
];

const PillarTile = ({ pillar, index }: { pillar: Pillar; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={`/pillar/${pillar.slug}`}
      className={`glass-tile ${pillar.span} p-6 md:p-8 relative overflow-hidden cursor-pointer group block`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--saffron) / 0.2), hsl(var(--umber) / 0.1), transparent 70%)',
          opacity: isHovered ? 1 : 0,
        }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-accent opacity-60">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="font-display text-2xl md:text-3xl font-light italic mt-2 mb-1">
            {pillar.title}
          </h3>
          <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
            {pillar.subtitle}
          </p>
        </div>

        <p
          className="font-body text-sm text-muted-foreground leading-relaxed mt-4 transition-all duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {pillar.description}
        </p>
      </div>
    </Link>
  );
};

const PillarsGrid = () => {
  return (
    <>
      {pillars.map((pillar, index) => (
        <PillarTile key={pillar.slug} pillar={pillar} index={index} />
      ))}
    </>
  );
};

export default PillarsGrid;
