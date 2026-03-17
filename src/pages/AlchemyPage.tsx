import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Beaker, Clock, Utensils, ChevronRight, X } from 'lucide-react';

interface AlchemyElement {
  id: string;
  name: string;
  type: string | null;
  image_url: string | null;
  symbol: string;
}

interface Recipe {
  id: string;
  name: string;
  image_url: string | null;
  instructions: string | null;
  nutrition_profile: Record<string, unknown> | null;
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

const generateSymbol = (name: string): string => {
  const words = name.split(' ');
  if (words.length > 1) {
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 3);
  }
  return name.slice(0, 2).charAt(0).toUpperCase() + name.slice(1, 3).toLowerCase();
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
  const [selectedElement, setSelectedElement] = useState<AlchemyElement | null>(null);
  const [activeSection, setActiveSection] = useState('periodic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [elemRes, recRes, wellRes, ritRes] = await Promise.all([
        supabase.from('alchemy_elements').select('*').order('type', { ascending: true }),
        supabase.from('recipes').select('*').limit(12),
        supabase.from('wellness_library').select('*'),
        supabase.from('daily_rituals').select('*').order('date', { ascending: false }).limit(7),
      ]);

      if (elemRes.data) {
        setElements(elemRes.data.map(el => ({ ...el, symbol: generateSymbol(el.name) })));
      }
      if (recRes.data) setRecipes(recRes.data);
      if (wellRes.data) setExperiments(wellRes.data);
      if (ritRes.data) setRituals(ritRes.data);

      setLoading(false);
    };
    fetchData();
  }, []);

  const macros = elements.filter(el => ['protein', 'carbohydrate', 'fat', 'macro'].includes(el.type?.toLowerCase() || ''));
  const micros = elements.filter(el => ['vitamin', 'mineral', 'micro'].includes(el.type?.toLowerCase() || ''));
  const otherElements = elements.filter(el =>
    !['protein', 'carbohydrate', 'fat', 'macro', 'vitamin', 'mineral', 'micro'].includes(el.type?.toLowerCase() || '')
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
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(175,60%,45%)] mb-4">
            The Biological Source Code
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-light italic mb-6 text-[hsl(38,30%,90%)]">
            Alchemy
          </h1>
          <p className="font-body text-lg text-[hsl(38,30%,55%)] leading-relaxed max-w-2xl mb-12">
            Precision nutrition and wellness optimization. The laboratory where biology meets intention.
          </p>
        </motion.div>

        {/* Daily Non-Negotiables Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10"
        >
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-4 min-w-max">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[hsl(175,60%,45%)/0.2] bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm">
                <Activity className="w-4 h-4 text-[hsl(175,60%,45%)]" />
                <span className="font-body text-xs tracking-wider uppercase text-[hsl(38,30%,60%)]">Daily Non-Negotiables</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(38,30%,30%)/0.2] bg-[hsl(200,15%,8%)/0.4]">
                <span className="font-body text-xs text-[hsl(38,30%,50%)]">Streak:</span>
                <span className="font-body text-sm font-medium text-[hsl(175,60%,50%)]">{ritualStreak} days</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(38,30%,30%)/0.2] bg-[hsl(200,15%,8%)/0.4]">
                <span className="font-body text-xs text-[hsl(38,30%,50%)]">Avg Energy:</span>
                <span className="font-body text-sm font-medium text-[hsl(30,80%,55%)]">{avgEnergy}/10</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(175,60%,45%)/0.15] bg-[hsl(200,15%,8%)/0.4]">
                <span className="font-body text-xs text-[hsl(38,30%,50%)]">Status:</span>
                <span className="font-body text-xs font-medium text-[hsl(175,60%,50%)]">Active</span>
              </div>
            </div>
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
                    {macros.length > 0 && (
                      <ElementGroup label="Macronutrients" elements={macros} variant="macro" onSelect={setSelectedElement} />
                    )}
                    {micros.length > 0 && (
                      <ElementGroup label="Micronutrients" elements={micros} variant="micro" onSelect={setSelectedElement} />
                    )}
                    {otherElements.length > 0 && (
                      <ElementGroup label="Other Compounds" elements={otherElements} variant="other" onSelect={setSelectedElement} />
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
        )}

        {/* Element Popover */}
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
                className="relative max-w-md w-full p-8 rounded-2xl border border-[hsl(175,60%,45%)/0.2] bg-[hsl(200,15%,8%)/0.95] backdrop-blur-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedElement(null)}
                  className="absolute top-4 right-4 p-1 text-[hsl(38,30%,50%)] hover:text-[hsl(38,30%,80%)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-xl border border-[hsl(175,60%,45%)/0.3] bg-[hsl(175,60%,45%)/0.1] flex items-center justify-center">
                    <span className="text-2xl font-bold text-[hsl(175,60%,50%)]">{selectedElement.symbol}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-[hsl(38,30%,90%)]">{selectedElement.name}</h3>
                    <span className="font-body text-xs tracking-wider uppercase text-[hsl(175,60%,45%)]">
                      {selectedElement.type || 'Element'}
                    </span>
                  </div>
                </div>

                {selectedElement.image_url && (
                  <img src={selectedElement.image_url} alt={selectedElement.name} className="w-full h-40 object-cover rounded-xl mb-4 opacity-80" />
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

const ElementGroup = ({
  label,
  elements,
  variant,
  onSelect,
}: {
  label: string;
  elements: AlchemyElement[];
  variant: 'macro' | 'micro' | 'other';
  onSelect: (el: AlchemyElement) => void;
}) => {
  const dotColors = { macro: 'bg-[hsl(30,80%,55%)]', micro: 'bg-[hsl(175,60%,50%)]', other: 'bg-[hsl(270,50%,60%)]' };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${dotColors[variant]}`} />
        <span className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(38,30%,55%)]">{label}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {elements.map((element, index) => (
          <ElementTile key={element.id} element={element} index={index} variant={variant} onClick={() => onSelect(element)} />
        ))}
      </div>
    </div>
  );
};

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
  const symbolColors = { macro: 'text-[hsl(30,80%,55%)]', micro: 'text-[hsl(175,60%,50%)]', other: 'text-[hsl(270,50%,60%)]' };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={onClick}
      className={`aspect-square rounded-xl border bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${variantStyles[variant]}`}
    >
      <span className={`text-xl font-bold ${symbolColors[variant]}`}>{element.symbol}</span>
      <span className="text-[10px] text-[hsl(38,30%,55%)] text-center leading-tight truncate w-full">{element.name}</span>
    </motion.button>
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
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[hsl(200,15%,12%)] flex items-center justify-center">
            <Utensils className="w-8 h-8 text-[hsl(38,30%,30%)]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg text-[hsl(38,30%,90%)] mb-3">{recipe.name}</h3>

        {/* Nutrition Profile */}
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
                {recipe.instructions && (
                  <p className="text-sm text-[hsl(38,30%,55%)] leading-relaxed">{recipe.instructions}</p>
                )}
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
    {/* Timeline node */}
    <div className="absolute -left-[calc(2rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-[hsl(175,60%,45%)] border-2 border-[hsl(200,15%,8%)]" />

    <div className="p-5 rounded-xl border border-[hsl(175,60%,45%)/0.15] bg-[hsl(200,15%,8%)/0.5] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-lg text-[hsl(38,30%,90%)]">{experiment.name}</h3>
        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-[hsl(175,60%,45%)] text-[hsl(200,15%,8%)]">
          Active
        </span>
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
