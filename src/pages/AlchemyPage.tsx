import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Beaker, Utensils, ChevronRight, X, Sun, Timer, Droplets, Check, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface AlchemyElement {
  id: string;
  name: string;
  type: string | null;
  category: string | null;
  image_url: string | null;
  symbol: string | null;
  daily_target: string | null;
  function_summary: string | null;
}

interface Recipe {
  id: string;
  name: string;
  image_url: string | null;
  instructions: string | null;
  nutrition_profile: unknown;
}

interface WellnessExperiment {
  id: string;
  name: string;
  description: string | null;
}

interface DailyRitual {
  id: string;
  date: string;
  sleep_hours: number | null;
  energy_level: number | null;
  mood_score: number | null;
}

interface Ingredient {
  id: string;
  name: string;
  image_url: string | null;
}

interface NonNegotiableStat {
  name: string | null;
  weekly_avg: number | null;
  unit: string | null;
}

// Known IDs from the database
const MOVEMENT_IDS = {
  SURYA_NAMASKAR: '367efe1e-df17-40d6-977a-5bfe3d9e5745',
  INVERSION: '8065caf6-3471-4053-83c8-a604d0c3e064',
};
const WELLNESS_IDS = {
  ABHYANGA: '53674c5c-924a-4ec9-989b-2ff9b801f397',
};

// Well-known biochemistry classifications
const FAT_SOLUBLE_SYMBOLS = ['A', 'D', 'E', 'K'];
const MACRO_MINERAL_SYMBOLS = ['Ca', 'Mg', 'Na', 'K+'];

const NON_NEGOTIABLE_META: Record<string, { icon: typeof Sun; description: string; color: string; statLabel: string }> = {
  'Surya Namaskar': {
    icon: Sun,
    description: 'Ancient solar salutation sequence. A complete practice uniting breath, movement, and devotion.',
    color: 'hsl(30,80%,55%)',
    statLabel: 'Weekly Avg',
  },
  '5 Minutes Inversion': {
    icon: Timer,
    description: 'Gravitational reset. Inversions reverse blood flow, decompress the spine, and calm the nervous system.',
    color: 'hsl(175,60%,45%)',
    statLabel: 'Weekly Avg',
  },
  'Abhyanga': {
    icon: Droplets,
    description: 'Self-massage with warm oil. A Dinacharya ritual for lymphatic flow, skin nourishment, and grounding.',
    color: 'hsl(270,50%,60%)',
    statLabel: 'Completed',
  },
};

const AlchemyBackground = () => (
  <div className="fixed inset-0 z-0">
    <div className="absolute inset-0 bg-[hsl(200,15%,5%)]" />
    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[hsl(175,60%,25%)] opacity-[0.07] blur-[120px]" />
    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(200,15%,8%)] opacity-20 blur-[100px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[hsl(38,30%,85%)] opacity-[0.03] blur-[80px]" />
  </div>
);

const AlchemyPage = () => {
  const [elements, setElements] = useState<AlchemyElement[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [experiments, setExperiments] = useState<WellnessExperiment[]>([]);
  const [rituals, setRituals] = useState<DailyRitual[]>([]);
  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiableStat[]>([]);
  const [selectedElement, setSelectedElement] = useState<AlchemyElement | null>(null);
  const [modalIngredients, setModalIngredients] = useState<Ingredient[]>([]);
  const [modalRecipes, setModalRecipes] = useState<Recipe[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('periodic');
  const [loading, setLoading] = useState(true);

  // Daily log state
  const [suryaReps, setSuryaReps] = useState<string>('');
  const [inversionMins, setInversionMins] = useState<string>('');
  const [abhyangaDone, setAbhyangaDone] = useState(false);
  const [logSaving, setLogSaving] = useState(false);
  const [logSaved, setLogSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [elemRes, recRes, wellRes, ritRes, nnRes] = await Promise.all([
        supabase.from('alchemy_elements').select('*').order('type', { ascending: true }),
        supabase.from('recipes').select('*').limit(12),
        supabase.from('wellness_library').select('*'),
        supabase.from('daily_rituals').select('*').order('date', { ascending: false }).limit(7),
        supabase.from('non_negotiable_stats').select('*'),
      ]);
      if (elemRes.data) setElements(elemRes.data);
      if (recRes.data) setRecipes(recRes.data);
      if (wellRes.data) setExperiments(wellRes.data);
      if (ritRes.data) setRituals(ritRes.data);
      if (nnRes.data) setNonNegotiables(nnRes.data as NonNegotiableStat[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSaveLog = async () => {
    setLogSaving(true);
    const inserts = [];

    if (suryaReps && Number(suryaReps) > 0) {
      inserts.push(
        supabase.from('activity_logs').insert({
          movement_id: '367efe1e-df17-40d6-977a-5bfe3d9e5745',
          metrics: { reps: Number(suryaReps) },
        })
      );
    }
    if (inversionMins && Number(inversionMins) > 0) {
      inserts.push(
        supabase.from('activity_logs').insert({
          movement_id: '8065caf6-3471-4053-83c8-a604d0c3e064',
          metrics: { minutes: Number(inversionMins) },
        })
      );
    }
    if (abhyangaDone) {
      inserts.push(
        supabase.from('activity_logs').insert({
          wellness_id: '53674c5c-924a-4ec9-989b-2ff9b801f397',
        })
      );
    }

    const results = await Promise.all(inserts);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      toast.error('Failed to save some entries');
    } else {
      toast.success('Daily log saved');
      setLogSaved(true);
      setSuryaReps('');
      setInversionMins('');
      setAbhyangaDone(false);
    }
    setLogSaving(false);
  };

  const handleElementClick = useCallback(async (element: AlchemyElement) => {
    setSelectedElement(element);
    setModalLoading(true);
    setModalIngredients([]);
    setModalRecipes([]);

    const [ingRes, recRes] = await Promise.all([
      supabase
        .from('ingredient_elements')
        .select('ingredient_id, ingredients(id, name, image_url)')
        .eq('element_id', element.id),
      supabase
        .from('element_recipes')
        .select('recipe_id, recipes(id, name, image_url, instructions, nutrition_profile)')
        .eq('element_id', element.id),
    ]);

    if (ingRes.data) {
      const ingredients = ingRes.data
        .map((row: any) => row.ingredients)
        .filter(Boolean);
      setModalIngredients(ingredients);
    }
    if (recRes.data) {
      const recipes = recRes.data
        .map((row: any) => row.recipes)
        .filter(Boolean);
      setModalRecipes(recipes);
    }
    setModalLoading(false);
  }, []);

  // Group elements
  const macros = elements.filter(el => el.type?.toLowerCase() === 'macro');
  const fatSolubleVitamins = elements.filter(el =>
    el.category?.toLowerCase() === 'vitamin' && FAT_SOLUBLE_SYMBOLS.includes(el.symbol || '')
  );
  const waterSolubleVitamins = elements.filter(el =>
    el.category?.toLowerCase() === 'vitamin' && !FAT_SOLUBLE_SYMBOLS.includes(el.symbol || '')
  );
  const macroMinerals = elements.filter(el =>
    el.category?.toLowerCase() === 'mineral' && MACRO_MINERAL_SYMBOLS.includes(el.symbol || '')
  );
  const traceMinerals = elements.filter(el =>
    el.category?.toLowerCase() === 'mineral' && !MACRO_MINERAL_SYMBOLS.includes(el.symbol || '')
  );
  // Catch-all for elements that don't fit (e.g. Hydration)
  const otherElements = elements.filter(el =>
    el.type?.toLowerCase() !== 'macro' &&
    el.category?.toLowerCase() !== 'vitamin' &&
    el.category?.toLowerCase() !== 'mineral'
  );

  const sections = [
    { id: 'periodic', label: 'Periodic Table', icon: Beaker },
    { id: 'recipes', label: 'Recipe Lab', icon: Utensils },
    { id: 'wellness', label: 'Wellness Lab', icon: Activity },
  ];

  const ritualStreak = rituals.length;
  const avgEnergy = rituals.length > 0
    ? Math.round(rituals.reduce((acc, r) => acc + (r.energy_level || 0), 0) / rituals.length)
    : 0;

  return (
    <div className="min-h-screen relative">
      <AlchemyBackground />
      <main className="relative z-10 px-4 md:px-8 py-16 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link to="/" className="font-body text-xs tracking-[0.3em] uppercase text-[hsl(38,30%,50%)] hover:text-[hsl(175,60%,50%)] transition-colors mb-12 inline-block">
            ← Back
          </Link>
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(175,60%,45%)] mb-4">The Biological Source Code</p>
          <h1 className="font-display text-5xl md:text-7xl font-light italic mb-6 text-[hsl(38,30%,90%)]">Alchemy</h1>
          <p className="font-body text-lg text-[hsl(38,30%,55%)] leading-relaxed max-w-2xl mb-12">
            Precision nutrition and wellness optimization. The laboratory where biology meets intention.
          </p>
        </motion.div>

        {/* Daily Non-Negotiables — Horizontal Scroll Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Activity className="w-4 h-4 text-[hsl(175,60%,45%)]" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-[hsl(38,30%,60%)]">Daily Non-Negotiables</span>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-5 pb-4 px-1">
              {nonNegotiables.map((stat, idx) => {
                const meta = NON_NEGOTIABLE_META[stat.name || ''];
                if (!meta) return null;
                const Icon = meta.icon;
                const formatValue = () => {
                  if (stat.name === 'Abhyanga') return `${stat.weekly_avg ?? 0}/7 Days`;
                  return `${stat.weekly_avg ?? 0} ${stat.unit === 'reps' ? 'Reps' : 'Mins'}`;
                };
                return (
                  <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                    className="min-w-[280px] max-w-[320px] flex-shrink-0 rounded-2xl border bg-[hsl(200,15%,8%)/0.7] backdrop-blur-sm p-5 transition-all duration-500 hover:shadow-[0_0_30px_-5px_var(--glow)] group"
                    style={{ '--glow': meta.color, borderColor: `${meta.color}20` } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border"
                        style={{ borderColor: `${meta.color}40`, background: `${meta.color}12` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>
                      <h3 className="font-display text-lg text-[hsl(38,30%,90%)] leading-tight">{stat.name}</h3>
                    </div>
                    <p className="font-body text-xs text-[hsl(38,30%,50%)] leading-relaxed mb-4 line-clamp-2">
                      {meta.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-[hsl(38,30%,20%)/0.3]">
                      <span className="font-body text-[10px] tracking-[0.15em] uppercase text-[hsl(38,30%,45%)]">
                        {meta.statLabel}
                      </span>
                      <span className="font-body text-sm font-semibold" style={{ color: meta.color }}>
                        {formatValue()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </motion.div>

        {/* Daily Log */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[hsl(175,60%,45%)] animate-pulse" />
              <span className="font-body text-xs tracking-[0.3em] uppercase text-[hsl(38,30%,60%)]">
                Daily Log — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {logSaved && (
              <span className="flex items-center gap-1 text-[hsl(175,60%,50%)] font-body text-xs">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Surya Namaskar */}
            <div className="rounded-xl border border-[hsl(30,80%,50%)/0.2] bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-[hsl(30,80%,55%)]" />
                <span className="font-body text-sm text-[hsl(38,30%,85%)]">Surya Namaskar</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={suryaReps}
                  onChange={(e) => setSuryaReps(e.target.value)}
                  className="w-full bg-[hsl(200,15%,12%)] border border-[hsl(38,30%,25%)/0.3] rounded-lg px-3 py-2 text-sm text-[hsl(38,30%,90%)] font-body placeholder:text-[hsl(38,30%,30%)] focus:outline-none focus:border-[hsl(30,80%,50%)/0.5] transition-colors"
                />
                <span className="font-body text-xs text-[hsl(38,30%,45%)] whitespace-nowrap">Reps</span>
              </div>
            </div>

            {/* 5 Minutes Inversion */}
            <div className="rounded-xl border border-[hsl(175,60%,45%)/0.2] bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-4 h-4 text-[hsl(175,60%,45%)]" />
                <span className="font-body text-sm text-[hsl(38,30%,85%)]">Inversion</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={inversionMins}
                  onChange={(e) => setInversionMins(e.target.value)}
                  className="w-full bg-[hsl(200,15%,12%)] border border-[hsl(38,30%,25%)/0.3] rounded-lg px-3 py-2 text-sm text-[hsl(38,30%,90%)] font-body placeholder:text-[hsl(38,30%,30%)] focus:outline-none focus:border-[hsl(175,60%,45%)/0.5] transition-colors"
                />
                <span className="font-body text-xs text-[hsl(38,30%,45%)] whitespace-nowrap">Mins</span>
              </div>
            </div>

            {/* Abhyanga */}
            <div className="rounded-xl border border-[hsl(270,50%,50%)/0.2] bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-[hsl(270,50%,60%)]" />
                <span className="font-body text-sm text-[hsl(38,30%,85%)]">Abhyanga</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-[hsl(38,30%,45%)]">{abhyangaDone ? 'Completed' : 'Not yet'}</span>
                <Switch
                  checked={abhyangaDone}
                  onCheckedChange={setAbhyangaDone}
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-4">
            <button
              disabled={logSaving || (!suryaReps && !inversionMins && !abhyangaDone)}
              onClick={handleSaveLog}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm tracking-wide border border-[hsl(175,60%,45%)/0.4] bg-[hsl(175,60%,45%)/0.1] text-[hsl(175,60%,45%)] hover:bg-[hsl(175,60%,45%)/0.2] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {logSaving ? (
                <div className="w-4 h-4 border-2 border-[hsl(175,60%,45%)/0.3] border-t-[hsl(175,60%,45%)] rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {logSaving ? 'Saving…' : 'Log Today'}
            </button>
          </div>
        </motion.div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-3 mb-12">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm tracking-wide transition-all duration-300 border ${
                activeSection === section.id
                  ? 'bg-[hsl(175,60%,45%)/0.15] text-[hsl(175,60%,45%)] border-[hsl(175,60%,45%)/0.4]'
                  : 'bg-[hsl(200,15%,10%)/0.5] text-[hsl(38,30%,60%)] border-[hsl(38,30%,30%)/0.2] hover:text-[hsl(38,30%,80%)] hover:border-[hsl(38,30%,40%)/0.3]'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[hsl(175,60%,45%)/0.3] border-t-[hsl(175,60%,45%)] rounded-full animate-spin" />
          </div>
        ) : (
          <TooltipProvider delayDuration={200}>
            <AnimatePresence mode="wait">
              {/* Periodic Table */}
              {activeSection === 'periodic' && (
                <motion.div key="periodic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="font-display text-2xl italic text-[hsl(38,30%,85%)] mb-2">Biological Periodic Table</h2>
                  <p className="font-body text-sm text-[hsl(38,30%,50%)] mb-8">The essential elements of optimal nutrition</p>

                  {elements.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[hsl(38,30%,30%)/0.3] rounded-2xl">
                      <Beaker className="w-10 h-10 mx-auto text-[hsl(38,30%,30%)] mb-4" />
                      <p className="text-[hsl(38,30%,50%)]">No elements catalogued yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {/* Macronutrients + Other (Hydration) */}
                      {(macros.length > 0 || otherElements.length > 0) && (
                        <PeriodicBlock
                          label="Macronutrients"
                          dotColor="bg-[hsl(30,80%,55%)]"
                          elements={[...otherElements, ...macros]}
                          variant="macro"
                          onSelect={handleElementClick}
                        />
                      )}

                      {/* Vitamins */}
                      {(fatSolubleVitamins.length > 0 || waterSolubleVitamins.length > 0) && (
                        <div>
                          <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-[hsl(175,60%,50%)]" />
                            <span className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(38,30%,55%)]">Vitamins</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                            {fatSolubleVitamins.length > 0 && (
                              <div>
                                <span className="font-body text-[10px] tracking-[0.15em] uppercase text-[hsl(175,60%,40%)] mb-3 block">Fat-Soluble</span>
                                <div className="grid grid-cols-4 gap-3">
                                  {fatSolubleVitamins.map((el, i) => (
                                    <ElementTile key={el.id} element={el} index={i} variant="micro" onClick={() => handleElementClick(el)} />
                                  ))}
                                </div>
                              </div>
                            )}
                            {waterSolubleVitamins.length > 0 && (
                              <div>
                                <span className="font-body text-[10px] tracking-[0.15em] uppercase text-[hsl(175,60%,40%)] mb-3 block">Water-Soluble</span>
                                <div className="grid grid-cols-4 gap-3">
                                  {waterSolubleVitamins.map((el, i) => (
                                    <ElementTile key={el.id} element={el} index={i} variant="micro" onClick={() => handleElementClick(el)} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Minerals */}
                      {(macroMinerals.length > 0 || traceMinerals.length > 0) && (
                        <div>
                          <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-[hsl(270,50%,60%)]" />
                            <span className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(38,30%,55%)]">Minerals</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                            {macroMinerals.length > 0 && (
                              <div>
                                <span className="font-body text-[10px] tracking-[0.15em] uppercase text-[hsl(270,50%,55%)] mb-3 block">Electrolytes (Macro-Minerals)</span>
                                <div className="grid grid-cols-4 gap-3">
                                  {macroMinerals.map((el, i) => (
                                    <ElementTile key={el.id} element={el} index={i} variant="other" onClick={() => handleElementClick(el)} />
                                  ))}
                                </div>
                              </div>
                            )}
                            {traceMinerals.length > 0 && (
                              <div>
                                <span className="font-body text-[10px] tracking-[0.15em] uppercase text-[hsl(270,50%,55%)] mb-3 block">Trace Minerals</span>
                                <div className="grid grid-cols-4 gap-3">
                                  {traceMinerals.map((el, i) => (
                                    <ElementTile key={el.id} element={el} index={i} variant="other" onClick={() => handleElementClick(el)} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Recipe Lab */}
              {activeSection === 'recipes' && (
                <motion.div key="recipes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="font-display text-2xl italic text-[hsl(38,30%,85%)] mb-2">Frequency-Driven Recipes</h2>
                  <p className="font-body text-sm text-[hsl(38,30%,50%)] mb-8">Top formulas ranked by consumption frequency</p>
                  {recipes.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[hsl(38,30%,30%)/0.3] rounded-2xl">
                      <Utensils className="w-10 h-10 mx-auto text-[hsl(38,30%,30%)] mb-4" />
                      <p className="text-[hsl(38,30%,50%)]">No recipes documented yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recipes.map((recipe, index) => (
                        <RecipeCard key={recipe.id} recipe={recipe} index={index} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Wellness Lab */}
              {activeSection === 'wellness' && (
                <motion.div key="wellness" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                  <h2 className="font-display text-2xl italic text-[hsl(38,30%,85%)] mb-2">Wellness Lab</h2>
                  <p className="font-body text-sm text-[hsl(38,30%,50%)] mb-8">Active experiments and clinical observations</p>
                  {experiments.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[hsl(38,30%,30%)/0.3] rounded-2xl">
                      <Activity className="w-10 h-10 mx-auto text-[hsl(38,30%,30%)] mb-4" />
                      <p className="text-[hsl(38,30%,50%)]">No active experiments.</p>
                    </div>
                  ) : (
                    <div className="space-y-0 relative pl-8 border-l border-[hsl(175,60%,45%)/0.2]">
                      {experiments.map((experiment, index) => (
                        <ExperimentLog key={experiment.id} experiment={experiment} index={index} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TooltipProvider>
        )}

        {/* Element Detail Modal */}
        <AnimatePresence>
          {selectedElement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedElement(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-lg w-full max-h-[80vh] overflow-y-auto p-8 rounded-2xl border border-[hsl(175,60%,45%)/0.2] bg-[hsl(200,15%,8%)/0.95] backdrop-blur-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedElement(null)}
                  className="absolute top-4 right-4 p-1 text-[hsl(38,30%,50%)] hover:text-[hsl(38,30%,80%)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Element header */}
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-16 h-16 rounded-xl border border-[hsl(175,60%,45%)/0.3] bg-[hsl(175,60%,45%)/0.1] flex items-center justify-center">
                    <span className="text-2xl font-bold text-[hsl(175,60%,50%)]">{selectedElement.symbol}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-[hsl(38,30%,90%)]">{selectedElement.name}</h3>
                    <span className="font-body text-xs tracking-wider uppercase text-[hsl(175,60%,45%)]">
                      {selectedElement.category || selectedElement.type || 'Element'}
                    </span>
                  </div>
                </div>

                {selectedElement.function_summary && (
                  <p className="text-sm text-[hsl(38,30%,60%)] leading-relaxed mb-3">{selectedElement.function_summary}</p>
                )}
                {selectedElement.daily_target && (
                  <div className="inline-block px-3 py-1 rounded-full bg-[hsl(175,60%,45%)/0.1] border border-[hsl(175,60%,45%)/0.2] mb-6">
                    <span className="font-body text-xs text-[hsl(175,60%,50%)]">Daily Target: {selectedElement.daily_target}</span>
                  </div>
                )}

                {modalLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[hsl(175,60%,45%)/0.3] border-t-[hsl(175,60%,45%)] rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Source Ingredients */}
                    {modalIngredients.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-[hsl(175,60%,45%)] mb-3">Source Ingredients</h4>
                        <div className="flex flex-wrap gap-2">
                          {modalIngredients.map((ing) => (
                            <span key={ing.id} className="px-3 py-1.5 rounded-lg bg-[hsl(200,15%,12%)] border border-[hsl(38,30%,30%)/0.2] text-xs text-[hsl(38,30%,70%)]">
                              {ing.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Linked Recipes */}
                    {modalRecipes.length > 0 && (
                      <div>
                        <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-[hsl(30,80%,55%)] mb-3">Linked Recipes</h4>
                        <div className="space-y-3">
                          {modalRecipes.map((rec) => (
                            <div key={rec.id} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(200,15%,12%)/0.5] border border-[hsl(38,30%,30%)/0.15]">
                              {rec.image_url ? (
                                <img src={rec.image_url} alt={rec.name} className="w-12 h-12 rounded-lg object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-[hsl(200,15%,15%)] flex items-center justify-center">
                                  <Utensils className="w-4 h-4 text-[hsl(38,30%,30%)]" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-[hsl(38,30%,85%)]">{rec.name}</p>
                                {rec.instructions && (
                                  <p className="text-[11px] text-[hsl(38,30%,50%)] line-clamp-1">{rec.instructions}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {modalIngredients.length === 0 && modalRecipes.length === 0 && (
                      <p className="text-sm text-[hsl(38,30%,40%)] text-center py-4">No linked ingredients or recipes yet.</p>
                    )}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* ─── Sub-components ─── */

const PeriodicBlock = ({
  label,
  dotColor,
  elements,
  variant,
  onSelect,
}: {
  label: string;
  dotColor: string;
  elements: AlchemyElement[];
  variant: 'macro' | 'micro' | 'other';
  onSelect: (el: AlchemyElement) => void;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(38,30%,55%)]">{label}</span>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {elements.map((element, index) => (
        <ElementTile key={element.id} element={element} index={index} variant={variant} onClick={() => onSelect(element)} />
      ))}
    </div>
  </div>
);

const ElementTile = ({
  element,
  index,
  variant,
  onClick,
}: {
  element: AlchemyElement;
  index: number;
  variant: 'macro' | 'micro' | 'other';
  onClick: () => void;
}) => {
  const variantStyles = {
    macro: 'border-[hsl(30,80%,50%)/0.3] hover:border-[hsl(30,80%,50%)/0.6] hover:bg-[hsl(30,80%,50%)/0.1]',
    micro: 'border-[hsl(175,60%,45%)/0.3] hover:border-[hsl(175,60%,45%)/0.6] hover:bg-[hsl(175,60%,45%)/0.1]',
    other: 'border-[hsl(270,50%,50%)/0.3] hover:border-[hsl(270,50%,50%)/0.6] hover:bg-[hsl(270,50%,50%)/0.1]',
  };
  const symbolColors = {
    macro: 'text-[hsl(30,80%,55%)]',
    micro: 'text-[hsl(175,60%,50%)]',
    other: 'text-[hsl(270,50%,60%)]',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
          onClick={onClick}
          className={`aspect-square rounded-xl border bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${variantStyles[variant]}`}
        >
          <span className={`text-xl font-bold ${symbolColors[variant]}`}>{element.symbol || element.name.slice(0, 2)}</span>
          <span className="text-[10px] text-[hsl(38,30%,55%)] text-center leading-tight truncate w-full">{element.name}</span>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs bg-[hsl(200,15%,10%)] border-[hsl(175,60%,45%)/0.3] backdrop-blur-xl p-3"
      >
        {element.daily_target && (
          <p className="text-xs text-[hsl(175,60%,50%)] mb-1">Target: {element.daily_target}</p>
        )}
        {element.function_summary && (
          <p className="text-xs text-[hsl(38,30%,65%)] leading-relaxed">{element.function_summary}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

const RecipeCard = ({ recipe, index }: { recipe: Recipe; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const nutritionProfile = recipe.nutrition_profile as Record<string, unknown> | null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="rounded-2xl border border-[hsl(38,30%,30%)/0.2] bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm overflow-hidden"
    >
      <div className="relative h-44 overflow-hidden">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[hsl(200,15%,12%)] flex items-center justify-center">
            <Utensils className="w-8 h-8 text-[hsl(38,30%,30%)]" />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg text-[hsl(38,30%,90%)] mb-3">{recipe.name}</h3>
        {nutritionProfile && Object.keys(nutritionProfile).length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(nutritionProfile).slice(0, 3).map(([key, value]) => (
              <div key={key} className="text-center py-2 rounded-lg bg-[hsl(200,15%,12%)/0.5] border border-[hsl(38,30%,30%)/0.1]">
                <span className="block text-[10px] uppercase tracking-wider text-[hsl(38,30%,45%)]">{key}</span>
                <span className="block text-sm font-medium text-[hsl(175,60%,50%)]">{typeof value === 'number' ? value : String(value)}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[hsl(175,60%,45%)] hover:text-[hsl(175,60%,55%)] transition-colors font-body text-xs tracking-wide"
        >
          {isExpanded ? 'Less' : 'Details'}
          <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-4 mt-4 border-t border-[hsl(38,30%,30%)/0.15]">
                {recipe.instructions && <p className="text-sm text-[hsl(38,30%,55%)] leading-relaxed">{recipe.instructions}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const ExperimentLog = ({ experiment, index }: { experiment: WellnessExperiment; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    className="relative pb-8 last:pb-0"
  >
    <div className="absolute -left-[calc(2rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-[hsl(175,60%,45%)] border-2 border-[hsl(200,15%,8%)]" />
    <div className="p-5 rounded-xl border border-[hsl(175,60%,45%)/0.15] bg-[hsl(200,15%,8%)/0.5] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-lg text-[hsl(38,30%,90%)]">{experiment.name}</h3>
        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-[hsl(175,60%,45%)] text-[hsl(200,15%,8%)]">Active</span>
      </div>
      {experiment.description && (
        <div className="mt-2">
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-[hsl(175,60%,45%)]">Intention</span>
          <p className="text-sm text-[hsl(38,30%,55%)] mt-1 leading-relaxed">{experiment.description}</p>
        </div>
      )}
    </div>
  </motion.div>
);

export default AlchemyPage;
