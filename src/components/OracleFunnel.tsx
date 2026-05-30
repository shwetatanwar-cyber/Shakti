import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Sparkles } from 'lucide-react';
import { trackGAEvent, trackMetaEvent } from '@/utils/analytics';
import { toast } from '@/hooks/use-toast';
import CityAutocomplete from '@/components/CityAutocomplete';

const IST_OFFSET = 5.5;

type Stage =
  | 'closed'
  | 'birth'
  | 'focus'
  | 'generating'
  | 'report'
  | 'paywall'
  | 'paid'
  | 'whatsapp_success';

type Variant = 'orb' | 'floating' | 'inline';

interface Props {
  variant?: Variant;
  ctaText?: string;
  ctaSubtext?: string;
  ctaPosition?: string;
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

type QueryCategory = 'RELATIONSHIP' | 'CAREER' | 'GENERAL_PEACE';

const RELATIONSHIP_KEYWORDS = [
  'love', 'partner', 'marriage', 'third person', 'cheat', 'husband',
  'wife', 'boyfriend', 'girlfriend', 'break', 'split',
];
const CAREER_KEYWORDS = [
  'job', 'career', 'money', 'boss', 'promotion', 'salary', 'business',
  'wealth', 'success',
];

const classifyQuery = (q: string): QueryCategory => {
  const text = (q || '').toLowerCase();
  if (!text.trim()) return 'GENERAL_PEACE';
  if (RELATIONSHIP_KEYWORDS.some((k) => text.includes(k))) return 'RELATIONSHIP';
  if (CAREER_KEYWORDS.some((k) => text.includes(k))) return 'CAREER';
  return 'GENERAL_PEACE';
};

const capitalizeName = (raw: string) => {
  const s = (raw || '').trim();
  if (!s) return 'friend';
  return s
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const LOCKED_SECTIONS: Record<
  QueryCategory,
  { num: string; tag: string; firstLine: (name: string) => string; bullets: string[] }[]
> = {
  RELATIONSHIP: [
    {
      num: '02',
      tag: 'THE TIMELINE',
      firstLine: (n) =>
        `${n}, I see a major shift from your current planetary alignment in the next…`,
      bullets: [
        'The exact dates when the fights, distance, or silence between you two will stop.',
        'The true reasons or outside energies causing misunderstandings or secrets right now.',
      ],
    },
    {
      num: '03',
      tag: 'THE PATTERN',
      firstLine: (n) =>
        `${n}, your chart reveals a repetitive emotional cycle that was triggered during…`,
      bullets: [
        'Why you get hurt so easily and keep overthinking every little detail about your partner.',
        'The hidden habits or actions you need to change today to save your bond from cracking.',
      ],
    },
    {
      num: '04',
      tag: 'THE RESOLUTION',
      firstLine: (n) =>
        `${n}, to shift this heavy energy, there is a specific, simple daily action that…`,
      bullets: [
        'An easy daily routine to bring back trust, peace, and deep attraction between you two.',
        'Exactly what to say or do next to remove negative thoughts and feel safe again.',
      ],
    },
  ],
  CAREER: [
    {
      num: '02',
      tag: 'THE TIMELINE',
      firstLine: (n) =>
        `${n}, I have good news. A major, heavy Mahadasha phase is ending for you in the next…`,
      bullets: [
        'The exact dates for your next big job change, promotion, or salary hike.',
        'Dangerous months ahead where you must protect your money and avoid risky steps.',
      ],
    },
    {
      num: '03',
      tag: 'THE BLOCK',
      firstLine: (n) =>
        `${n}, your 10th house shows a very specific professional block that explains why…`,
      bullets: [
        'Why your hard work is not being noticed by your bosses or managers.',
        'An unconscious mental block that is stopping you from reaching your true power.',
      ],
    },
    {
      num: '04',
      tag: 'THE RESOLUTION',
      firstLine: (n) =>
        `${n}, to unlock your financial flow, your chart alignment requires a clean morning…`,
      bullets: [
        'An easy morning ritual tailored to your birth chart to attract money and luck.',
        'Clear, step-by-step guidance on how to fix your confusion and pick the right path.',
      ],
    },
  ],
  GENERAL_PEACE: [
    {
      num: '02',
      tag: 'THE TIMELINE',
      firstLine: (n) =>
        `Looking at your chart, ${n}, the heavy mental fog you are carrying is preparing to…`,
      bullets: [
        'The exact dates when your heavy stress, sadness, and anxiety will finally end.',
        'Beautiful, positive cycles ahead for your health, peace of mind, and happiness.',
      ],
    },
    {
      num: '03',
      tag: 'THE ROOT',
      firstLine: (n) =>
        `${n}, your moon placement indicates a deeply rooted pattern from your past that…`,
      bullets: [
        'The exact placement in your chart that causes your mind to constantly fear the worst.',
        'A deep pattern from your past that is secretly draining your energy every single day.',
      ],
    },
    {
      num: '04',
      tag: 'THE RESOLUTION',
      firstLine: (n) =>
        `${n}, your immediate path to peace requires shifting your energy hours during…`,
      bullets: [
        'A short 5-minute daily breathing or mindfulness exercise unique to your birth stars.',
        'How to alter your daily sleep and morning hours to clear your confusion instantly.',
      ],
    },
  ],
};

const BLUR_LOREM = [
  'Saturn at 24°12′ in your 7th house forms a tight square with natal Venus, while Jupiter retrograde across the Rohini pada quietly reshapes the lagna lord placement and its dasha pivot into the next quarter.',
  'The Vimshottari progression now moves from Rahu mahadasha into a Jupiter antardasha lasting eleven months, with Saturn pratyantar overlaying your natal Mars in the 4th house through the spring transit window.',
  'Your Ashtakavarga score of 28 with a strong Bhinnashtakavarga of Jupiter in the 5th, paired with the closing pada of Sade Sati, points to clear relief markers between the 14th and 22nd lunar nights of the coming cycle.',
  'Moon in Rohini conjunct natal Mercury triggers a soft nakshatra exchange with the 11th house gains line, easing accumulated friction across the bhava axis and opening a calmer mental field for new decisions.',
  'A subtle yoga between Venus and the 5th lord activates as outer Saturn unwinds its square, gradually thinning the emotional fog and restoring confidence across the karaka houses of your chart.',
  'The transit cluster across the 10th and 11th houses gathers momentum toward a stationing point, after which a long-pending decision finds its natural resolution without the usual delay or interference.',
];

const OracleFunnel = ({
  variant = 'orb',
  ctaText = 'Get My Free Reading',
  ctaSubtext = '⚡ Private AI. No human eyes. Instant generation.',
  ctaPosition = 'hero_inline',
}: Props) => {
  const [stage, setStage] = useState<Stage>('closed');
  const [birth, setBirth] = useState<{
    name: string;
    gender: string;
    date: string;
    time: string;
    location: string;
    lat: number | null;
    lng: number | null;
    timezoneOffset: number;
  }>({
    name: '',
    gender: '',
    date: '',
    time: '',
    location: '',
    lat: null,
    lng: null,
    timezoneOffset: IST_OFFSET,
  });
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partner, setPartner] = useState<{
    name: string;
    gender: string;
    dob: string;
    time: string;
    location: string;
    lat: number | null;
    lng: number | null;
    timezoneOffset: number;
  }>({
    name: '',
    gender: '',
    dob: '',
    time: '',
    location: '',
    lat: null,
    lng: null,
    timezoneOffset: IST_OFFSET,
  });
  const [focus, setFocus] = useState('');
  const [overview, setOverview] = useState('');
  const [locked, setLocked] = useState('');
  const [error, setError] = useState('');
  const [calcIdx, setCalcIdx] = useState(0);
  const [consultationId, setConsultationId] = useState<string | null>(null);

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
    setBirth({
      name: '',
      gender: '',
      date: '',
      time: '',
      location: '',
      lat: null,
      lng: null,
      timezoneOffset: IST_OFFSET,
    });
    setPartner({
      name: '',
      gender: '',
      dob: '',
      time: '',
      location: '',
      lat: null,
      lng: null,
      timezoneOffset: IST_OFFSET,
    });
    setPartnerOpen(false);
    setFocus('');
    setOverview('');
    setLocked('');
    setError('');
    setConsultationId(null);
  };

  const generateReport = async (focusVal: string) => {
    setStage('generating');
    setError('');
    trackGAEvent('oracle_reason_submit', {
      submission_type: focusVal.trim() ? 'specific_custom_text' : 'generic_alignment_scan',
      has_custom_text: focusVal.trim() ? true : false,
    });
    const started = Date.now();

    // ---- Persist consultation to Supabase (schema-aligned) ----
    try {
      const submissionType = focusVal.trim() ? 'specific_custom_text' : 'generic_alignment_scan';
      const rawUserReason = focusVal.trim() ? focusVal.trim() : null;

      // birth.date from <input type="date"> is already YYYY-MM-DD.
      // birth.time from <input type="time"> is HH:MM — pad to HH:MM:SS.
      const formattedDate = birth.date; // YYYY-MM-DD
      const formattedTime =
        birth.time && birth.time.length === 5 ? `${birth.time}:00` : birth.time;

      const sessionId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const payload = {
        birth_date: formattedDate,
        birth_time: formattedTime,
        birth_location: birth.location.trim(),
        submission_type: submissionType,
        raw_user_reason: rawUserReason,
        consultation_category: submissionType,
        session_id: sessionId,
        payment_status: 'pending',
        name: birth.name.trim() || null,
        gender: birth.gender || null,
        partner_name: partnerOpen && partner.name.trim() ? partner.name.trim() : null,
        partner_gender: partnerOpen && partner.gender ? partner.gender : null,
        partner_dob: partnerOpen && partner.dob ? partner.dob : null,
        partner_time_of_birth: partnerOpen && partner.time ? partner.time : null,
        partner_city_of_birth:
          partnerOpen && partner.location.trim() ? partner.location.trim() : null,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('oracle_consultations')
        .insert([payload])
        .select('id, session_id')
        .single();

      if (insertError) {
        console.error('CRITICAL SUPABASE PIPELINE FAILURE:', insertError);
        toast({
          title: 'Could not save your consultation',
          description: insertError.message ?? 'Unknown database error',
          variant: 'destructive',
        });
      } else if (inserted?.id) {
        setConsultationId(inserted.id);
        try {
          localStorage.setItem('oracle_consultation_id', inserted.id);
          localStorage.setItem('oracle_session_id', inserted.session_id ?? sessionId);
        } catch {
          /* ignore storage errors */
        }
      }
    } catch (dbErr) {
      console.error('CRITICAL SUPABASE PIPELINE FAILURE:', dbErr);
      toast({
        title: 'Consultation save failed',
        description: (dbErr as Error).message,
        variant: 'destructive',
      });
    }

    try {
      const birthPayload = {
        date: birth.date,
        time: birth.time,
        location: birth.location,
        lat: birth.lat as number,
        lng: birth.lng as number,
        timezoneOffset: birth.timezoneOffset,
      };
      const partnerProvided =
        partnerOpen &&
        !!partner.dob &&
        !!partner.time &&
        !!partner.location.trim() &&
        partner.lat !== null &&
        partner.lng !== null;
      const partnerPayload = partnerProvided
        ? {
            name: partner.name.trim() || null,
            gender: partner.gender || null,
            date: partner.dob,
            time: partner.time,
            location: partner.location,
            lat: partner.lat as number,
            lng: partner.lng as number,
            timezoneOffset: partner.timezoneOffset,
          }
        : null;
      const { data, error } = await supabase.functions.invoke('oracle-chat', {
        body: {
          mode: 'report',
          birth: birthPayload,
          partner: partnerPayload,
          query: focusVal,
          name: birth.name?.trim() || null,
        },
      });
      if (error) throw error;
      // Ensure the animation plays for at least ~5s for ritual feel
      const elapsed = Date.now() - started;
      const wait = Math.max(0, 5000 - elapsed);
      setTimeout(() => {
        setOverview(data?.text || '');
        setLocked('');
        setStage('report');
      }, wait);
    } catch (e) {
      setError((e as Error).message);
      setStage('focus');
    }
  };

  // ---------- TRIGGERS ----------
  if (stage === 'closed') {
    if (variant === 'inline') {
      const canSubmit =
        !!birth.name.trim() &&
        !!birth.gender &&
        !!birth.date &&
        !!birth.time &&
        !!birth.location.trim() &&
        birth.lat !== null &&
        birth.lng !== null;
      const genderOpts = ['Female', 'Male', 'Other'];
      return (
        <div className="w-full max-w-md mx-auto">
          <div className="glass-tile p-5 md:p-6 space-y-4 border-accent/30 shadow-[0_0_40px_-12px_hsl(var(--violet)/0.5)]">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-accent/90">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arjun"
                  value={birth.name}
                  onChange={(e) => setBirth({ ...birth, name: e.target.value })}
                  maxLength={80}
                  required
                  className="w-full mt-1.5 bg-background/60 border border-accent/30 rounded-lg px-3 py-3 font-body text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent focus:bg-background/80 transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-accent/90">Your Gender</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {genderOpts.map((g) => {
                    const active = birth.gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setBirth({ ...birth, gender: g })}
                        className={`px-3 py-2.5 rounded-lg font-body text-sm border transition-all ${
                          active
                            ? 'border-accent bg-accent/20 text-foreground shadow-[0_0_18px_-6px_hsl(var(--accent)/0.7)]'
                            : 'border-accent/30 bg-background/60 text-muted-foreground hover:border-accent/60 hover:text-foreground'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-accent/90">Date of Birth</label>
                <input
                  type="date"
                  value={birth.date}
                  onChange={(e) => setBirth({ ...birth, date: e.target.value })}
                  className="w-full mt-1.5 bg-background/60 border border-accent/30 rounded-lg px-3 py-3 font-body text-base text-foreground focus:outline-none focus:border-accent focus:bg-background/80 transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-accent/90">Time of Birth</label>
                <input
                  type="time"
                  value={birth.time}
                  onChange={(e) => setBirth({ ...birth, time: e.target.value })}
                  className="w-full mt-1.5 bg-background/60 border border-accent/30 rounded-lg px-3 py-3 font-body text-base text-foreground focus:outline-none focus:border-accent focus:bg-background/80 transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-accent/90">City of Birth</label>
                <CityAutocomplete
                  value={birth.location}
                  onSelect={(c) =>
                    setBirth({
                      ...birth,
                      location: `${c.name}, ${c.state}`,
                      lat: c.lat,
                      lng: c.lng,
                    })
                  }
                  onClear={() =>
                    setBirth((b) => ({ ...b, location: '', lat: null, lng: null }))
                  }
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="mt-1.5"
                  inputClassName="w-full bg-background/60 border border-accent/30 rounded-lg px-3 py-3 font-body text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent focus:bg-background/80 transition-colors"
                />
              </div>
            </div>

            {/* Optional partner accordion */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setPartnerOpen((v) => !v)}
                className="w-full flex items-center justify-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground/80 hover:text-accent transition-colors py-2"
                aria-expanded={partnerOpen}
              >
                <span className="text-base leading-none">{partnerOpen ? '−' : '+'}</span>
                Add Partner's Details (Optional for Compatibility)
              </button>
              {partnerOpen && (
                <div className="mt-2 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div>
                    <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70">Partner's Name</label>
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => setPartner({ ...partner, name: e.target.value })}
                      maxLength={80}
                      className="w-full mt-1.5 bg-background/40 border border-muted-foreground/20 rounded-lg px-3 py-2.5 font-body text-sm text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70">Partner's Gender</label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {genderOpts.map((g) => {
                        const active = partner.gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setPartner({ ...partner, gender: g })}
                            className={`px-3 py-2 rounded-lg font-body text-xs border transition-all ${
                              active
                                ? 'border-accent/70 bg-accent/15 text-foreground/90'
                                : 'border-muted-foreground/20 bg-background/40 text-muted-foreground/80 hover:border-accent/40'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70">Partner's Date of Birth</label>
                    <input
                      type="date"
                      value={partner.dob}
                      onChange={(e) => setPartner({ ...partner, dob: e.target.value })}
                      className="w-full mt-1.5 bg-background/40 border border-muted-foreground/20 rounded-lg px-3 py-2.5 font-body text-sm text-foreground/90 focus:outline-none focus:border-accent/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70">Partner's Time of Birth</label>
                    <input
                      type="time"
                      value={partner.time}
                      onChange={(e) => setPartner({ ...partner, time: e.target.value })}
                      className="w-full mt-1.5 bg-background/40 border border-muted-foreground/20 rounded-lg px-3 py-2.5 font-body text-sm text-foreground/90 focus:outline-none focus:border-accent/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70">Partner's City of Birth</label>
                    <CityAutocomplete
                      value={partner.location}
                      onSelect={(c) =>
                        setPartner({
                          ...partner,
                          location: `${c.name}, ${c.state}`,
                          lat: c.lat,
                          lng: c.lng,
                        })
                      }
                      onClear={() =>
                        setPartner((p) => ({ ...p, location: '', lat: null, lng: null }))
                      }
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="mt-1.5"
                      inputClassName="w-full bg-background/40 border border-muted-foreground/20 rounded-lg px-3 py-2.5 font-body text-sm text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/60 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                trackGAEvent('birth_details_submit', {
                  has_date: !!birth.date,
                  has_time: !!birth.time,
                  location_region: 'processed',
                  positioning: ctaPosition,
                });
                trackMetaEvent('AddToCart');
                try {
                  localStorage.setItem('oracle_user_name', birth.name.trim());
                } catch {
                  /* ignore */
                }
                setStage('focus');
              }}
              className="w-full font-body text-sm font-semibold tracking-[0.18em] uppercase px-6 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/30"
            >
              {ctaText} →
            </button>
            <p className="text-center font-body text-xs text-muted-foreground">
              {ctaSubtext}
            </p>
          </div>
        </div>
      );
    }
    if (variant === 'orb') {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <button
            onClick={() => {
              trackGAEvent('speak_cta_click', { positioning: 'hero_center' });
              setStage('birth');
            }}
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
        onClick={() => {
          trackGAEvent('speak_cta_click', { positioning: 'floating_corner' });
          setStage('birth');
        }}
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
      style={{ background: '#0b0b0f' }}
    >
      <button
        onClick={close}
        className="absolute top-6 right-6 font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        Close
      </button>

      <div
        className={`w-full ${
          stage === 'report' || stage === 'paywall' || stage === 'paid'
            ? 'max-w-3xl h-full md:h-auto md:max-h-[92vh] flex flex-col'
            : 'max-w-2xl'
        }`}
      >
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
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Your Name</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="What should Tara call you?"
                  value={birth.name}
                  onChange={(e) => setBirth({ ...birth, name: e.target.value })}
                  maxLength={80}
                  className="w-full mt-2 bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-base placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Date of Birth</label>
                <input
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
                <CityAutocomplete
                  value={birth.location}
                  onSelect={(c) =>
                    setBirth({
                      ...birth,
                      location: `${c.name}, ${c.state}`,
                      lat: c.lat,
                      lng: c.lng,
                    })
                  }
                  onClear={() =>
                    setBirth((b) => ({ ...b, location: '', lat: null, lng: null }))
                  }
                  placeholder="Start typing your city…"
                  className="mt-2"
                  inputClassName="w-full bg-transparent border-b border-muted-foreground/30 pb-2 font-body text-base placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            <button
              disabled={
                !birth.name.trim() ||
                !birth.date ||
                !birth.time ||
                !birth.location ||
                birth.lat === null ||
                birth.lng === null
              }
              onClick={() => {
                trackGAEvent('birth_details_submit', {
                  has_date: !!birth.date,
                  has_time: !!birth.time,
                  location_region: 'processed',
                });
                trackMetaEvent('AddToCart');
                try {
                  localStorage.setItem('oracle_user_name', birth.name.trim());
                } catch {
                  /* ignore */
                }
                setStage('focus');
              }}
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
              What is your biggest worry or question right now?
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Tell us what is keeping you up at night. The more you share, the more specific your reading will be.
            </p>
            <textarea
              rows={4}
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              required
              placeholder="Type your query here (e.g., Is there a third person impacting my relationship, or when will I find stable love?)..."
              className="w-full bg-transparent border border-muted-foreground/20 rounded-2xl p-4 font-body text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors resize-none"
            />
            {error && <p className="text-xs text-destructive font-body">{error}</p>}
            <button
              disabled={!focus.trim()}
              onClick={() => generateReport(focus)}
              className="w-full font-body text-xs tracking-[0.3em] uppercase px-6 py-4 rounded-full border border-accent/40 bg-accent/10 text-bone hover:bg-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Compile Report →
            </button>
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

        {/* REPORT — single continuous reading + paywall CTA */}
        {(stage === 'report' || stage === 'paywall' || stage === 'paid') && (
          <ReportDossier
            overview={overview}
            query={focus}
            name={capitalizeName(birth.name || '')}
            stage={stage}
            onUnlock={() => {
              trackGAEvent('payment_initiate', {
                price_point: 199,
                currency: 'INR',
                conversion_tier: 'premium_oracle_chat',
              });
              trackMetaEvent('InitiateCheckout');
              setStage('paywall');
            }}
            onReset={resetAll}
          />
        )}

        {stage === 'paywall' && (
          <Paywall
            consultationId={consultationId}
            onSuccess={() => setStage('whatsapp_success')}
          />
        )}

        {stage === 'whatsapp_success' && (
          <div className="glass-tile p-8 md:p-10 max-w-md mx-auto text-center space-y-5 border-accent/30 animate-in fade-in duration-500">
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
              ✦ Confirmed
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-light italic leading-tight">
              Great! Keep a tab on your whatsapp inbox.
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Tara will soon see you there.
            </p>
            <button
              onClick={resetAll}
              className="mx-auto block font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors pt-2"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Paywall = ({
  consultationId,
  onSuccess,
}: {
  consultationId: string | null;
  onSuccess: () => void;
}) => {
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  // Accept 10-digit Indian mobile numbers, optionally prefixed with +91 / 91 / 0.
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.replace(/^(91|091|0)/, '');
  const isValid = /^[6-9]\d{9}$/.test(normalized);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) {
      setTouched(true);
      return;
    }
    setSubmitting(true);

    const fullPhone = `+91${normalized}`;

    // Persist phone_number to the consultation record (non-blocking for UX).
    if (consultationId) {
      try {
        const { error: updateError } = await supabase
          .from('oracle_consultations')
          .update({ phone_number: fullPhone, payment_status: 'link_sent' })
          .eq('id', consultationId);
        if (updateError) {
          console.error('Failed to update consultation with phone:', updateError);
        }
      } catch (err) {
        console.error('Phone update error:', err);
      }
    }

    trackGAEvent('payment_complete', {
      price_point: 199,
      currency: 'INR',
      conversion_tier: 'premium_oracle_chat',
      contact_channel: 'whatsapp',
    });
    trackMetaEvent('Purchase', { value: 199.0, currency: 'INR' });

    try {
      localStorage.setItem('oracle_whatsapp_number', fullPhone);
    } catch {
      /* ignore */
    }

    setTimeout(() => onSuccess(), 800);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-background/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <form
        onSubmit={handleSubmit}
        className="glass-tile p-8 md:p-10 max-w-md w-full space-y-6 border-accent/30"
      >
        <div className="text-center space-y-2">
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
            Final Step · WhatsApp
          </p>
          <h3 className="font-display text-3xl font-light italic leading-tight">
            Where should we send your link?
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed pt-2">
            Enter the WhatsApp number to receive the payment link for your detailed report and a
            free 5-minute chat with Tara.
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-body text-[10px] tracking-[0.3em] uppercase text-accent/90">
            WhatsApp Number
          </label>
          <div className="flex items-center gap-2 bg-background/60 border border-accent/30 rounded-lg px-3 py-3 focus-within:border-accent transition-colors">
            <span className="font-body text-base text-muted-foreground">+91</span>
            <input
              autoFocus
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={15}
              placeholder="98xxxxxx21"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched(true)}
              className="flex-1 bg-transparent font-body text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>
          {touched && !isValid && (
            <p className="font-body text-xs text-destructive">
              Enter a valid 10-digit Indian mobile number.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full font-body text-xs tracking-[0.3em] uppercase px-6 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/30"
        >
          {submitting ? 'Sending Link…' : 'Send My Payment Link →'}
        </button>

        <p className="text-center font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
          ₹199 · Detailed report + 5 min chat with Tara
        </p>
      </form>
    </div>
  );
};

const ReportDossier = ({
  overview,
  query,
  name,
  stage,
  onUnlock,
  onReset,
}: {
  overview: string;
  query: string;
  name: string;
  stage: Stage;
  onUnlock: () => void;
  onReset: () => void;
}) => {
  const category = classifyQuery(query);
  const sections = LOCKED_SECTIONS[category];

  return (
    <div
      className="relative animate-in fade-in duration-700 flex flex-col flex-1 min-h-0"
      style={{ background: '#0b0b0f' }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="px-4 md:px-6 pt-4 pb-10 max-w-2xl mx-auto">
          {/* SECTION 01 — FREE READING (no container, continuous document) */}
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
            01 // YOUR READING
          </p>
          <div className="font-body text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap mt-2">
            {overview}
          </div>

          {/* Trailing blurred continuation of Section 01 — looks like text fades away */}
          <div
            aria-hidden
            className="mt-3 space-y-2 pointer-events-none select-none"
          >
            {BLUR_LOREM.slice(0, 2).map((c, i) => {
              // gradient blur: first paragraph eases in from sharp → soft, second goes fully hazy
              const steps = [
                { blur: 2, opacity: 0.75 },
                { blur: 7, opacity: 0.45 },
              ];
              const { blur, opacity } = steps[i];
              return (
                <p
                  key={i}
                  className="font-body text-sm md:text-base leading-relaxed text-bone"
                  style={{ filter: `blur(${blur}px)`, opacity }}
                >
                  {c}
                </p>
              );
            })}
          </div>

          {/* SECTIONS 02 / 03 / 04 — headers + visible first line + locked bullets + blurred body */}
          {sections.map((sec, idx) => {
            const rotated = BLUR_LOREM
              .slice(idx % BLUR_LOREM.length)
              .concat(BLUR_LOREM.slice(0, idx % BLUR_LOREM.length));
            // Two-line template above bullets with gradient fade (sharp → soft),
            // then bullets in the middle, then fully hazy continuation below.
            const aboveSteps = [
              { blur: 2, opacity: 0.78 },
              { blur: 6, opacity: 0.5 },
            ];
            const belowParas = rotated.slice(2, 4);
            return (
              <div key={sec.num} className="mt-4">
                <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent">
                  {sec.num} // {sec.tag}
                </p>
                <p className="font-body text-sm md:text-base text-foreground/90 leading-relaxed mt-2">
                  {sec.firstLine(name)}
                </p>

                {/* Gradient blurred preview directly under the first line */}
                <div
                  aria-hidden
                  className="mt-3 space-y-2 pointer-events-none select-none"
                >
                  {rotated.slice(0, 2).map((c, i) => (
                    <p
                      key={i}
                      className="font-body text-sm md:text-base text-bone leading-relaxed"
                      style={{
                        filter: `blur(${aboveSteps[i].blur}px)`,
                        opacity: aboveSteps[i].opacity,
                      }}
                    >
                      {c}
                    </p>
                  ))}
                </div>

                {/* Bullets sit in the middle of the section */}
                <ul className="mt-5 space-y-2">
                  {sec.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="font-body text-sm text-foreground/80 flex items-start gap-2 leading-relaxed"
                    >
                      <Lock className="w-3.5 h-3.5 mt-1 text-accent shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Fully hazy continuation beneath the bullets */}
                <div
                  aria-hidden
                  className="mt-5 space-y-2 select-none"
                  style={{ filter: 'blur(10px)', opacity: 0.4, pointerEvents: 'none' }}
                >
                  {belowParas.map((c, i) => (
                    <p
                      key={i}
                      className="font-body text-sm md:text-base text-bone leading-relaxed"
                    >
                      {c}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}

          {stage === 'paid' && (
            <div className="space-y-3 pt-6">
              <p className="text-center font-body text-xs tracking-[0.3em] uppercase text-accent animate-pulse">
                ✦ Dialogue Unlocked · The Shadow is listening
              </p>
              <button
                onClick={onReset}
                className="mx-auto block font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Begin New Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STICKY MONETIZATION CTA */}
      {stage !== 'paid' && (
        <div className="shrink-0">
          <div
            className="border-t border-accent/40 px-4 py-3.5 md:px-6 md:py-4 text-center"
            style={{
              background: '#0b0b0f',
              boxShadow:
                '0 -8px 40px -8px hsl(270 76% 53% / 0.45), inset 0 1px 0 hsl(270 95% 72% / 0.4)',
            }}
          >
            <h4 className="font-body text-[12px] md:text-sm text-bone/90 leading-snug max-w-xl mx-auto">
              Get Your Complete 4-Page Personalised blueprint on whatsapp to gain absolute
              clarity on your hidden blockages, exact transit dates, and remedies.
            </h4>
            <button
              onClick={onUnlock}
              className="mt-3 font-body text-xs md:text-sm font-semibold tracking-[0.2em] uppercase px-7 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-accent/30"
              style={{ animation: 'pulse-glow 2.2s ease-in-out infinite' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Unlock for ₹199
            </button>
            <p className="mt-2 font-body text-[11px] md:text-xs text-muted-foreground">
              And claim your free five minute chat with Tara
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OracleFunnel;