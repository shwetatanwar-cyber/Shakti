import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Sparkles, Send } from 'lucide-react';

type Stage =
  | 'closed'
  | 'freeChat'
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

interface Message {
  role: 'user' | 'oracle';
  text: string;
}

const OracleFunnel = ({ variant = 'orb' }: Props) => {
  const [stage, setStage] = useState<Stage>('closed');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usedFreeQuery, setUsedFreeQuery] = useState(false);
  const [birth, setBirth] = useState({ date: '', time: '', location: '' });
  const [focus, setFocus] = useState('');
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const close = () => {
    setStage('closed');
  };

  const resetAll = () => {
    setStage('closed');
    setMessages([]);
    setInput('');
    setUsedFreeQuery(false);
    setBirth({ date: '', time: '', location: '' });
    setFocus('');
    setReport('');
    setError('');
  };

  const sendFreeQuery = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('oracle-chat', {
        body: { mode: 'quick', focus: q },
      });
      if (error) throw error;
      setMessages((m) => [...m, { role: 'oracle', text: data?.text || '…' }]);
      setUsedFreeQuery(true);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'oracle', text: 'The signal faltered. Try once more.' },
      ]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (focusVal: string) => {
    setStage('generating');
    setError('');
    try {
      const { data, error } = await supabase.functions.invoke('oracle-chat', {
        body: { mode: 'report', birth, focus: focusVal },
      });
      if (error) throw error;
      setReport(data?.text || 'The signal could not be read. Try again.');
      setStage('report');
    } catch (e) {
      setError((e as Error).message);
      setStage('focus');
    }
  };

  // ---------- TRIGGERS ----------
  const Trigger = () => {
    if (stage !== 'closed') return null;

    if (variant === 'orb') {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <button
            onClick={() => setStage('freeChat')}
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
              style={{
                background:
                  'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), transparent 60%)',
              }}
            />
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <span className="font-display italic text-xl md:text-2xl text-bone drop-shadow-lg">
                Speak
              </span>
            </div>
          </button>

          <p className="mt-8 font-body text-xs tracking-[0.35em] uppercase text-accent">
            Talk to the Digital Oracle
          </p>
          <p className="mt-3 font-display italic text-lg md:text-xl text-muted-foreground text-center max-w-md">
            One free question. Then the system reads you back to yourself.
          </p>
        </div>
      );
    }

    // floating
    return (
      <button
        onClick={() => setStage('freeChat')}
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
          style={{
            background:
              'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), transparent 60%)',
          }}
        />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Talk to the Oracle
        </span>
      </button>
    );
  };

  return (
    <>
      <Trigger />

      {stage !== 'closed' && (
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
            {/* FREE CHAT */}
            {stage === 'freeChat' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center">
                  <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
                    Digital Oracle · {usedFreeQuery ? 'Validation Complete' : 'Free Validation Query'}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-light italic mt-2">
                    {usedFreeQuery
                      ? 'The signal has spoken. Ready for the full reading?'
                      : 'Ask anything. One free response.'}
                  </h3>
                </div>

                <div
                  ref={scrollRef}
                  className="glass-tile p-6 min-h-[180px] max-h-[40vh] overflow-y-auto space-y-4"
                >
                  {messages.length === 0 && !loading && (
                    <p className="font-display italic text-base text-muted-foreground text-center py-6">
                      Speak your question into the void…
                    </p>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                      <p
                        className={`font-body text-sm inline-block max-w-[85%] leading-relaxed ${
                          m.role === 'user'
                            ? 'text-muted-foreground'
                            : 'text-foreground italic'
                        }`}
                      >
                        {m.text}
                      </p>
                    </div>
                  ))}
                  {loading && (
                    <p className="font-body text-sm text-accent italic animate-pulse">
                      Reading the signal…
                    </p>
                  )}
                </div>

                {!usedFreeQuery ? (
                  <div className="flex gap-2 items-center border-b border-muted-foreground/30 pb-2">
                    <input
                      autoFocus
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendFreeQuery()}
                      placeholder="Your question…"
                      className="flex-1 bg-transparent font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none"
                    />
                    <button
                      onClick={sendFreeQuery}
                      disabled={!input.trim() || loading}
                      className="text-accent disabled:opacity-30"
                      aria-label="Send"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="font-body text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      To go deeper, the oracle needs your three coordinates: date, time, and place of birth.
                    </p>
                    <button
                      onClick={() => setStage('birth')}
                      className="font-body text-xs tracking-[0.3em] uppercase px-8 py-4 rounded-full border border-accent/40 bg-accent/10 text-bone hover:bg-accent/20 transition-all inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Unlock Full Reading →
                    </button>
                  </div>
                )}
              </div>
            )}

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

            {stage === 'focus' && (
              <div className="glass-tile p-8 md:p-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
                  Step 2 of 2 · Query Vector
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-light italic">
                  What layer of the system needs reading?
                </h3>
                <textarea
                  rows={3}
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="A specific area — love, work, health, dharma — or leave blank for a general system scan."
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

            {stage === 'generating' && (
              <div className="text-center py-20 space-y-6">
                <div
                  className="mx-auto w-32 h-32 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 30%, hsl(var(--violet)), hsl(var(--saffron) / 0.5), transparent)',
                    animation: 'pulse-glow 1.5s ease-in-out infinite',
                  }}
                />
                <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent animate-pulse">
                  Compiling Prakriti · Reading Planetary Stack
                </p>
                <p className="font-display italic text-xl text-muted-foreground">
                  The signal is arriving…
                </p>
              </div>
            )}

            {(stage === 'report' || stage === 'paywall' || stage === 'paid') && (
              <div className="space-y-6 animate-in fade-in duration-700">
                <div className="text-center">
                  <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
                    System Configuration Report
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-light italic mt-2">
                    Your initial config has compiled.
                  </h3>
                </div>

                <div className="relative glass-tile p-8 max-h-[55vh] overflow-hidden">
                  <div
                    className={`font-body text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap transition-all duration-700 ${
                      stage === 'paid' ? '' : 'blur-md select-none pointer-events-none'
                    }`}
                  >
                    {report}
                  </div>

                  {stage !== 'paid' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-8 bg-gradient-to-t from-background via-background/80 to-transparent">
                      <div className="glass-tile px-6 py-6 max-w-sm text-center space-y-4 border-accent/30">
                        <Lock className="w-5 h-5 mx-auto text-accent" />
                        <p className="font-display italic text-lg">
                          Unlock the full architecture.
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          Continue the dialogue with the Digital Shadow. Decode friction, runtime errors, and the compiler directives for your next chapter.
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
      )}
    </>
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