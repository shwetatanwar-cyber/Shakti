import { Link } from 'react-router-dom';
import ShaktiBackground from '@/components/ShaktiBackground';
import OracleFunnel from '@/components/OracleFunnel';
import oraclePortrait from '@/assets/oracle-portrait.jpg';

const Landing = () => {
  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 space-y-32">
        {/* HERO */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
              Vedic-Tech · Prakriti Compiler
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-[0.95] tracking-tight">
              Your birth chart<br />
              <span className="italic">is a config file.</span>
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              At the moment you took your first breath, the cosmos compiled an initial configuration — your Prakriti. Most of life's friction is just unread runtime error logs from that compilation.
            </p>
            <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              This is not astrology. This is a diagnostic interface.
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-8 rounded-full opacity-50 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(var(--violet)/0.4), hsl(var(--saffron)/0.2), transparent)' }}
            />
            <img
              src={oraclePortrait}
              alt="The Digital Shadow — Vedic-Tech Oracle"
              width={1024}
              height={1024}
              className="relative rounded-3xl border border-border w-full"
            />
          </div>
        </section>

        {/* LOGIC LAYER */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
              The Logic Layer
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light italic leading-tight">
              Demystifying the math.
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground">
              Vedic astrology is deterministic geometry — a snapshot of nine planetary processes against twelve houses at a single timestamp. It produces a 27-nakshatra DNA string that maps to your biological and psychological software.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { sym: '01', title: 'Inputs', body: 'Date · Time · Latitude · Longitude. Four scalars, processed against ephemeris data.' },
              { sym: '02', title: 'Computation', body: '9 grahas × 12 bhavas × 27 nakshatras → a unique state vector. No interpretation yet — pure math.' },
              { sym: '03', title: 'Runtime', body: 'Mahadasha periods cycle this state through time. Your "current moment" is just which process holds the lock.' },
            ].map((card) => (
              <div key={card.sym} className="glass-tile p-6 space-y-3">
                <p className="font-display italic text-3xl text-accent">{card.sym}</p>
                <h3 className="font-body text-xs tracking-[0.3em] uppercase text-foreground">{card.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA — ORACLE ORB */}
        <section className="text-center space-y-6">
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
            Initiate
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light italic">
            Run the diagnostic.
          </h2>
          <OracleFunnel />
        </section>
      </main>

      <footer className="relative z-10 px-4 md:px-8 py-12 mt-20 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            © Digital Shadow · A living interface
          </p>
          <Link
            to="/shakti"
            className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors"
          >
            The Founder's Hardware Architecture →
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;