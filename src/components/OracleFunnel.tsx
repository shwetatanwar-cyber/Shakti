import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Sparkles } from 'lucide-react';

type Stage =
  | 'closed'
  | 'birth'
  | 'focus'
  | 'generating'
  | 'report'
  | 'paywall'
  | 'paid';

type Variant = 'orb' | 'floating';

interface Props {
  variant?: Variant;
}

const CALC_STEPS = [
  'Locating ephemeris coordinates…',
  'Compiling planetary stack · 9 grahas',
  'Mapping 12 bhavas against birth ascendant…',
  'Resolving nakshatra DNA · 27 segments',
  'Reading current Mahadasha runtime…',
  'Cross-referencing friction signatures…',
  'Compiling Prakriti configuration…',
];

const OracleFunnel = ({ variant = 'orb' }: Props) => {
  const [stage, setStage] = useState<Stage>('closed');
  const [birth, setBirth] = useState({ date: '', time: '', location: '' });
  const [focus, setFocus] = useState('');
  const [overview, setOverview] = useState('');
  const [locked, setLocked] = useState('');
  const [error, setError] = useState('');
  const [calcIdx, setCalcIdx] = useState(0);

  // Rotate calculation steps while generating
  useEffect(() => {
    if (stage !== 'generating') return;
    setCalcIdx(0);
    const id = setInterval(() => {
      setCalcIdx((i) => (i + 1) % CALC_STEPS.length);
    }, 1400);
    return () => clearInterval(id);
  }, [stage]);

  const close = () => setStage('closed');
  const resetAll = () => {
    setStage('closed');
    setBirth({ date: '', time: '', location: '' });
    setFocus('');
    setOverview('');
    setLocked('');
    setError('');
  };

  const generateReport = async (focusVal: string) => {
    setStage('generating');
    setError('');
    const started = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('oracle-chat', {
        body: { mode: 'report', birth, focus: focusVal },
      });
      if (error) throw error;
      // Ensure the animation plays for at least ~5s for ritual feel
      const elapsed = Date.now() - started;
      const wait = Math.max(0, 5000 - elapsed);
      setTimeout(() => {
        setOverview(data?.overview || data?.text || '');
        setLocked(data?.locked || '');
        setStage('report');
      }, wait);
    } catch (e) {
      setError((e as Error).message);
      setStage('focus');
    }
  };

  // ---------- TRIGGERS ----------
  if (stage === 'closed') {
    if (variant === 'orb') {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <button
            onClick={() => setStage('birth')}
            className="group relative w-44 h-44 md:w-56 md:h-56 rounded-full cursor-pointer"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, hsl(var(--violet) / 0.9), hsl(var(--violet) / 0.5) 40%, hsl(var(--saffron) / 0.3) 70%, hsl(var(--violet) / 0.1))',
              animation: 'float 6s ease-in-out infinite, pulse-glow 3s ease-in-out infinite',
            }}
            aria-label="Talk to the Digital Oracle"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), transparent 60%)' }}
            />
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <span className="font-display italic text-xl md:text-2xl text-bone drop-shadow-lg">Speak</span>
            </div>
          </button>
          <p className="mt-8 font-body text-xs tracking-[0.35em] uppercase text-accent">
            Talk to the Digital Oracle
          </p>
          <p className="mt-3 font-display italic text-lg md:text-xl text-muted-foreground text-center max-w-md">
            Share your birth coordinates. The system reads you back to yourself.
          </p>
        </div>
      );
    }
    return (
      <button
        onClick={() => setStage('birth')}
        className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-full z-40 cursor-pointer group"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, hsl(var(--violet) / 0.85), hsl(var(--violet) / 0.45), hsl(var(--saffron) / 0.2))',
          animation: 'float 6s ease-in-out infinite, pulse-glow 3s ease-in-out infinite',
        }}
        aria-label="Talk to the Digital Oracle"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), transparent 60%)' }}
        />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Talk to the Oracle
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10, 10, 10, 0.92)', backdropFilter: 'blur(40px)' }}
    >
      <button
        onClick={close}
        className="absolute top-6 right-6 font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        Close
      </button>

      <div className="w-full max-w-2xl">
        {/* BIRTH */}
        {stage === 'birth' && (
          <div className="glass-tile p-8 md:p-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
              Step 1 of 2 · Birth Coordinates
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-light italic">
              Tell me when and where you booted.
            </h3>
            <div className="space-y-4">
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Date of Birth</label>
                <input
                  autoFocus
                  type="date"
                  value={birth.date}
                  onChange={(e) => setBirth({ ...birth, date: e.target.value })}
                  className="w-full mt-2 bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-base focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Time of Birth</label>
                <input
                  type="time"
                  value={birth.time}
                  onChange={(e) => setBirth({ ...birth, time: e.target.value })}
                  className="w-full mt-2 bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-base focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Place of Birth</label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={birth.location}
                  onChange={(e) => setBirth({ ...birth, location: e.target.value })}
                  className="w-full mt-2 bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-base placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            <button
              disabled={!birth.date || !birth.time || !birth.location}
              onClick={() => setStage('focus')}
              className="w-full font-body text-xs tracking-[0.3em] uppercase px-6 py-4 rounded-full border border-accent/40 bg-accent/10 text-bone hover:bg-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        )}

        {/* FOCUS */}
        {stage === 'focus' && (
          <div className="glass-tile p-8 md:p-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
              Step 2 of 2 · Query Vector
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-light italic">
              Is there a specific layer that needs reading?
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Name an aspect of life you're seeking guidance on — love, work, health, dharma — or run a general system scan.
            </p>
            <textarea
              rows={3}
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="A specific area, or leave blank for a general overview."
              className="w-full bg-transparent border border-muted-foreground/20 rounded-2xl p-4 font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors resize-none"
            />
            {error && <p className="text-xs text-destructive font-body">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => generateReport('')}
                className="flex-1 font-body text-xs tracking-[0.3em] uppercase px-6 py-4 rounded-full border border-muted-foreground/30 hover:border-foreground transition-all"
              >
                General Scan
              </button>
              <button
                disabled={!focus.trim()}
                onClick={() => generateReport(focus)}
                className="flex-1 font-body text-xs tracking-[0.3em] uppercase px-6 py-4 rounded-full border border-accent/40 bg-accent/10 text-bone hover:bg-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Compile Report →
              </button>
            </div>
          </div>
        )}

        {/* GENERATING — ritual calculation effect */}
        {stage === 'generating' && (
          <div className="text-center py-12 space-y-8">
            <div className="relative mx-auto w-48 h-48 md:w-56 md:h-56">
              {/* Outer rotating ring */}
              <div
                className="absolute inset-0 rounded-full border border-accent/40"
                style={{ animation: 'wheel-spin-cw 6s linear infinite' }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-1 h-2 bg-accent/60"
                    style={{ transform: `rotate(${i * 30}deg) translateY(-${88}px)`, transformOrigin: 'center 96px' }}
                  />
                ))}
              </div>
              {/* Middle counter-rotating */}
              <div
                className="absolute inset-6 rounded-full border border-saffron/40"
                style={{ animation: 'wheel-spin-ccw 9s linear infinite' }}
              >
                {Array.from({ length: 27 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -mt-0.5 w-px h-1.5"
                    style={{
                      transform: `rotate(${(i * 360) / 27}deg) translateY(-${68}px)`,
                      transformOrigin: 'center 76px',
                      background: 'hsl(var(--saffron))',
                      opacity: 0.6,
                    }}
                  />
                ))}
              </div>
              {/* Pulsing core */}
              <div
                className="absolute inset-0 m-auto w-24 h-24 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, hsl(var(--saffron)), hsl(var(--violet)) 60%, transparent)',
                  animation: 'pulse-glow 1.6s ease-in-out infinite',
                  filter: 'blur(2px)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display italic text-bone text-2xl drop-shadow-lg">॥</span>
              </div>
            </div>

            <div className="space-y-2 min-h-[3rem]">
              <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent animate-pulse">
                Compiling Prakriti
              </p>
              <p
                key={calcIdx}
                className="font-display italic text-base md:text-lg text-muted-foreground animate-in fade-in duration-500"
              >
                {CALC_STEPS[calcIdx]}
              </p>
            </div>

            <style>{`
              @keyframes wheel-spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes wheel-spin-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
            `}</style>
          </div>
        )}

        {/* REPORT — visible overview + locked blurred preview */}
        {(stage === 'report' || stage === 'paywall' || stage === 'paid') && (
          <div className="space-y-6 animate-in fade-in duration-700 max-h-[85vh] overflow-y-auto pr-2">
            <div className="text-center">
              <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
                System Configuration Report
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-light italic mt-2">
                Your initial config has compiled.
              </h3>
            </div>

            {/* Visible overview */}
            <div className="glass-tile p-6 md:p-8">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
                Overview · Free Reading
              </p>
              <div className="font-body text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {overview}
              </div>
            </div>

            {/* Locked full report */}
            <div className="relative glass-tile p-6 md:p-8 overflow-hidden">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
                Full Architecture · Premium
              </p>
              <div
                className={`font-body text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap min-h-[220px] transition-all duration-700 ${
                  stage === 'paid' ? '' : 'blur-md select-none pointer-events-none'
                }`}
              >
                {locked}
              </div>

              {stage !== 'paid' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-background via-background/85 to-background/30">
                  <div className="glass-tile px-6 py-6 max-w-sm text-center space-y-4 border-accent/30">
                    <Lock className="w-5 h-5 mx-auto text-accent" />
                    <p className="font-display italic text-lg">
                      Unlock the full architecture.
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      Decode friction, runtime errors, and the compiler directives for your next chapter — plus continued dialogue with the Shadow.
                    </p>
                    <button
                      onClick={() => setStage('paywall')}
                      className="w-full font-body text-xs tracking-[0.3em] uppercase px-6 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Unlock for ₹199
                    </button>
                  </div>
                </div>
              )}
            </div>

            {stage === 'paid' && (
              <div className="space-y-4">
                <p className="text-center font-body text-xs tracking-[0.3em] uppercase text-accent animate-pulse">
                  ✦ Dialogue Unlocked · The Shadow is listening
                </p>
                <button
                  onClick={resetAll}
                  className="mx-auto block font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Begin New Session
                </button>
              </div>
            )}
          </div>
        )}

        {stage === 'paywall' && <Paywall onSuccess={() => setStage('paid')} />}
      </div>
    </div>
  );
};

const Paywall = ({ onSuccess }: { onSuccess: () => void }) => {
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => onSuccess(), 1600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-background/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="glass-tile p-8 md:p-10 max-w-md w-full space-y-6 border-accent/30">
        <div className="text-center space-y-2">
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">Premium Checkout</p>
          <h3 className="font-display text-3xl font-light italic">Unlock the Shadow</h3>
          <p className="font-body text-4xl text-foreground mt-4">₹199 <span className="text-sm text-muted-foreground">/ session</span></p>
        </div>

        <div className="flex gap-2">
          {(['upi', 'card'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 font-body text-[10px] tracking-[0.3em] uppercase py-3 rounded-full border transition-all ${
                method === m
                  ? 'border-accent bg-accent/15 text-bone'
                  : 'border-muted-foreground/20 text-muted-foreground hover:border-foreground/40'
              }`}
            >
              {m === 'upi' ? 'UPI' : 'Card'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {method === 'upi' ? (
            <input
              placeholder="yourname@upi"
              className="w-full bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent"
            />
          ) : (
            <>
              <input
                placeholder="Card number"
                className="w-full bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent"
              />
              <div className="flex gap-3">
                <input
                  placeholder="MM / YY"
                  className="flex-1 bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent"
                />
                <input
                  placeholder="CVV"
                  className="flex-1 bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent"
                />
              </div>
            </>
          )}
        </div>

        <button
          disabled={processing}
          onClick={handlePay}
          className="w-full font-body text-xs tracking-[0.3em] uppercase px-6 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all disabled:opacity-60"
        >
          {processing ? 'Authorizing…' : `Pay ₹199 via ${method === 'upi' ? 'UPI' : 'Card'}`}
        </button>

        <p className="text-center font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
          Simulated checkout · No real charge
        </p>
      </div>
    </div>
  );
};

export default OracleFunnel;