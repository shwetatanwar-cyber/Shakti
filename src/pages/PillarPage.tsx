import { useParams, Link } from 'react-router-dom';
import ShaktiBackground from '@/components/ShaktiBackground';

const pillarData: Record<string, { title: string; subtitle: string; description: string }> = {
  evolution: { title: "Evolution", subtitle: "Growth as practice", description: "The spiral of becoming. Each cycle refines, each iteration deepens the pattern." },
  vision: { title: "The Vision", subtitle: "Artist · Seeing beyond sight", description: "The third eye does not look outward. It looks inward, and finds infinity." },
  flow: { title: "The Flow", subtitle: "Dance · Movement as meditation", description: "The body remembers what the mind forgets. Through movement, we return to the source." },
  vibrations: { title: "The Vibration", subtitle: "Music · Sound as architecture", description: "Every frequency is a doorway. We build cathedrals from resonance." },
  stillness: { title: "The Stillness", subtitle: "Yoga · Silence as power", description: "In the pause between breaths, the universe whispers its secrets." },
  alchemy: { title: "The Alchemy", subtitle: "Nutrition · Transformation as art", description: "We transmute the raw material of experience into gold. Lead into light." },
  pilgrimage: { title: "The Pilgrimage", subtitle: "Travel · Journey as destination", description: "Every step is an arrival. The path and the pilgrim are one." },
  resonance: { title: "Resonance", subtitle: "Inspiration · Echoes of influence", description: "We are shaped by what moves us. These are the frequencies that formed this vessel." },
};

const PillarPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const pillar = slug ? pillarData[slug] : null;

  if (!pillar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Pillar not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />
      <main className="relative z-10 px-4 md:px-8 py-16 max-w-4xl mx-auto">
        <Link
          to="/"
          className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors mb-12 inline-block"
        >
          ← Back
        </Link>

        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
          {pillar.subtitle}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-light italic mb-8">
          {pillar.title}
        </h1>
        <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {pillar.description}
        </p>

        <div className="mt-16 glass-tile p-8 md:p-12">
          <p className="font-body text-sm text-muted-foreground italic">
            Content for this pillar is coming soon. This space will hold creative works, practices, and reflections.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PillarPage;
