import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Beaker, 
  Clock, 
  Utensils,
  ChevronRight,
  X
} from 'lucide-react';

// Types based on Supabase schema
interface AlchemyElement {
  id: string;
  name: string;
  type: string | null;
  image_url: string | null;
  symbol?: string;
  description?: string;
  sources?: string[];
}

interface Recipe {
  id: string;
  name: string;
  image_url: string | null;
  instructions: string | null;
  nutrition_profile: Record<string, unknown> | null;
  frequency?: number;
  last_consumed?: string;
  ingredients?: string[];
}

interface WellnessExperiment {
  id: string;
  name: string;
  description: string | null;
  intention?: string;
  start_date?: string;
  status?: 'active' | 'completed' | 'paused';
  remarks?: { timestamp: string; note: string }[];
}

interface DailyRitual {
  id: string;
  date: string;
  sleep_hours: number | null;
  energy_level: number | null;
  mood_score: number | null;
}

// Generate symbol from element name
const generateSymbol = (name: string): string => {
  const words = name.split(' ');
  if (words.length > 1) {
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 3);
  }
  return name.slice(0, 2).charAt(0).toUpperCase() + name.slice(1, 3).toLowerCase();
};

// Alchemy-specific background component
const AlchemyBackground = () => (
  <>
    <div className="noise-overlay" />
    {/* Deep teal glow - top */}
    <div
      className="fixed top-[-15%] left-[20%] w-[60vw] h-[50vh] rounded-full animate-breathe pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse at center, hsl(175 60% 35% / 0.2), hsl(175 40% 20% / 0.1), transparent 70%)',
      }}
    />
    {/* Charcoal depth - bottom */}
    <div
      className="fixed bottom-[-10%] right-[10%] w-[50vw] h-[40vh] rounded-full animate-breathe pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse at center, hsl(180 10% 15% / 0.3), transparent 70%)',
        animationDelay: '3s',
      }}
    />
    {/* Bone accent - center */}
    <div
      className="fixed top-[40%] right-[5%] w-[20vw] h-[20vh] rounded-full animate-breathe pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse at center, hsl(38 30% 90% / 0.05), transparent 70%)',
        animationDelay: '1.5s',
      }}
    />
  </>
);

const AlchemyPage = () => {
  const [elements, setElements] = useState<AlchemyElement[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [experiments, setExperiments] = useState<WellnessExperiment[]>([]);
  const [rituals, setRituals] = useState<DailyRitual[]>([]);
  const [selectedElement, setSelectedElement] = useState<AlchemyElement | null>(null);
  const [activeSection, setActiveSection] = useState<string>('periodic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch alchemy elements
      const { data: elementsData } = await supabase
        .from('alchemy_elements')
        .select('*')
        .order('type', { ascending: true });
      
      // Fetch recipes with frequency count
      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .limit(12);
      
      // Fetch wellness experiments
      const { data: wellnessData } = await supabase
        .from('wellness_library')
        .select('*');
      
      // Fetch recent daily rituals for status bar
      const { data: ritualsData } = await supabase
        .from('daily_rituals')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);
      
      if (elementsData) {
        setElements(elementsData.map(el => ({
          ...el,
          symbol: generateSymbol(el.name),
        })));
      }
      if (recipesData) setRecipes(recipesData);
      if (wellnessData) {
        setExperiments(wellnessData.map(w => ({
          ...w,
          status: 'active' as const,
          intention: w.description,
        })));
      }
      if (ritualsData) setRituals(ritualsData);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  // Group elements by type
  const macros = elements.filter(el => 
    ['protein', 'carbohydrate', 'fat', 'macro'].includes(el.type?.toLowerCase() || '')
  );
  const micros = elements.filter(el => 
    ['vitamin', 'mineral', 'micro'].includes(el.type?.toLowerCase() || '')
  );
  const otherElements = elements.filter(el => 
    !['protein', 'carbohydrate', 'fat', 'macro', 'vitamin', 'mineral', 'micro'].includes(el.type?.toLowerCase() || '')
  );

  const sections = [
    { id: 'periodic', label: 'Periodic Table', icon: Beaker },
    { id: 'recipes', label: 'Recipe Lab', icon: Utensils },
    { id: 'wellness', label: 'Wellness Lab', icon: Activity },
  ];

  // Calculate ritual streak
  const ritualStreak = rituals.length;
  const avgEnergy = rituals.length > 0 
    ? Math.round(rituals.reduce((acc, r) => acc + (r.energy_level || 0), 0) / rituals.length)
    : 0;

  return (
    <div className="min-h-screen relative bg-[hsl(200,10%,6%)]">
      <AlchemyBackground />
      
      <main className="relative z-10 px-4 md:px-8 py-16 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/"
            className="font-sans text-xs tracking-[0.3em] uppercase text-[hsl(38,30%,60%)] hover:text-[hsl(175,60%,45%)] transition-colors mb-12 inline-block"
          >
            ← Back
          </Link>

          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-[hsl(175,60%,45%)] mb-4">
            The Biological Source Code
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light italic mb-4 text-[hsl(38,30%,92%)]">
            Alchemy
          </h1>
          <p className="font-sans text-base text-[hsl(38,30%,60%)] leading-relaxed max-w-2xl mb-8">
            Precision nutrition and wellness optimization. The laboratory where biology meets intention.
          </p>
        </motion.div>

        {/* Daily Non-Negotiables Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12 p-4 rounded-lg border border-[hsl(175,40%,25%)/0.3] bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[hsl(175,60%,45%)] animate-pulse" />
              <span className="font-sans text-xs tracking-[0.2em] uppercase text-[hsl(38,30%,70%)]">
                Daily Non-Negotiables
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-sans">
              <div className="flex items-center gap-2">
                <span className="text-[hsl(38,30%,50%)]">Streak:</span>
                <span className="text-[hsl(175,60%,45%)] font-medium">{ritualStreak} days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(38,30%,50%)]">Avg Energy:</span>
                <span className="text-[hsl(175,60%,45%)] font-medium">{avgEnergy}/10</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-[hsl(175,60%,45%)/0.15] border border-[hsl(175,60%,45%)/0.3]">
                <span className="text-[hsl(175,60%,45%)] text-xs tracking-wide">Status: Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Navigation */}
        <motion.nav 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-sm tracking-wide transition-all duration-300 border ${
                activeSection === section.id
                  ? 'bg-[hsl(175,60%,45%)/0.15] text-[hsl(175,60%,45%)] border-[hsl(175,60%,45%)/0.4]'
                  : 'bg-[hsl(200,15%,10%)/0.5] text-[hsl(38,30%,60%)] border-[hsl(38,30%,30%)/0.2] hover:text-[hsl(38,30%,80%)] hover:border-[hsl(38,30%,40%)/0.3]'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </motion.nav>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[hsl(175,60%,45%)/0.3] border-t-[hsl(175,60%,45%)] rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Periodic Table Section */}
            {activeSection === 'periodic' && (
              <motion.section
                key="periodic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-serif text-2xl font-light italic mb-2 text-[hsl(38,30%,92%)]">
                  Biological Periodic Table
                </h2>
                <p className="font-sans text-sm text-[hsl(38,30%,55%)] mb-8">
                  The essential elements of optimal nutrition
                </p>

                {elements.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[hsl(175,40%,25%)/0.3] rounded-lg">
                    <Beaker className="w-12 h-12 mx-auto mb-4 text-[hsl(175,60%,45%)/0.5]" />
                    <p className="font-sans text-[hsl(38,30%,55%)]">No elements catalogued yet.</p>
                    <p className="font-sans text-sm text-[hsl(38,30%,45%)] mt-1">Add nutrition elements to build your periodic table.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* Macronutrients */}
                    {macros.length > 0 && (
                      <div>
                        <h3 className="font-sans text-xs tracking-[0.3em] uppercase text-[hsl(175,60%,45%)] mb-4 flex items-center gap-2">
                          <span className="w-8 h-px bg-[hsl(175,60%,45%)/0.3]" />
                          Macronutrients
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {macros.map((element, index) => (
                            <ElementTile 
                              key={element.id} 
                              element={element} 
                              index={index}
                              variant="macro"
                              onClick={() => setSelectedElement(element)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Micronutrients */}
                    {micros.length > 0 && (
                      <div>
                        <h3 className="font-sans text-xs tracking-[0.3em] uppercase text-[hsl(175,60%,45%)] mb-4 flex items-center gap-2">
                          <span className="w-8 h-px bg-[hsl(175,60%,45%)/0.3]" />
                          Micronutrients
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {micros.map((element, index) => (
                            <ElementTile 
                              key={element.id} 
                              element={element} 
                              index={index}
                              variant="micro"
                              onClick={() => setSelectedElement(element)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Elements */}
                    {otherElements.length > 0 && (
                      <div>
                        <h3 className="font-sans text-xs tracking-[0.3em] uppercase text-[hsl(175,60%,45%)] mb-4 flex items-center gap-2">
                          <span className="w-8 h-px bg-[hsl(175,60%,45%)/0.3]" />
                          Other Compounds
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {otherElements.map((element, index) => (
                            <ElementTile 
                              key={element.id} 
                              element={element} 
                              index={index}
                              variant="other"
                              onClick={() => setSelectedElement(element)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.section>
            )}

            {/* Recipe Lab Section */}
            {activeSection === 'recipes' && (
              <motion.section
                key="recipes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-serif text-2xl font-light italic mb-2 text-[hsl(38,30%,92%)]">
                  Frequency-Driven Recipes
                </h2>
                <p className="font-sans text-sm text-[hsl(38,30%,55%)] mb-8">
                  Top formulas ranked by consumption frequency
                </p>

                {recipes.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[hsl(175,40%,25%)/0.3] rounded-lg">
                    <Utensils className="w-12 h-12 mx-auto mb-4 text-[hsl(175,60%,45%)/0.5]" />
                    <p className="font-sans text-[hsl(38,30%,55%)]">No recipes documented yet.</p>
                    <p className="font-sans text-sm text-[hsl(38,30%,45%)] mt-1">Add your nutritional formulas to the lab.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((recipe, index) => (
                      <RecipeCard key={recipe.id} recipe={recipe} index={index} />
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* Wellness Lab Section */}
            {activeSection === 'wellness' && (
              <motion.section
                key="wellness"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-serif text-2xl font-light italic mb-2 text-[hsl(38,30%,92%)]">
                  Wellness Lab
                </h2>
                <p className="font-sans text-sm text-[hsl(38,30%,55%)] mb-8">
                  Active experiments and clinical observations
                </p>

                {experiments.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[hsl(175,40%,25%)/0.3] rounded-lg">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-[hsl(175,60%,45%)/0.5]" />
                    <p className="font-sans text-[hsl(38,30%,55%)]">No active experiments.</p>
                    <p className="font-sans text-sm text-[hsl(38,30%,45%)] mt-1">Begin a wellness experiment to track your journey.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiments.map((experiment, index) => (
                      <ExperimentLog key={experiment.id} experiment={experiment} index={index} />
                    ))}
                  </div>
                )}
              </motion.section>
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
                transition={{ type: 'spring', damping: 25 }}
                className="relative w-full max-w-md p-6 rounded-xl border border-[hsl(175,40%,30%)/0.4] bg-[hsl(200,15%,10%)/0.95] backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedElement(null)}
                  className="absolute top-4 right-4 p-1 text-[hsl(38,30%,50%)] hover:text-[hsl(38,30%,80%)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg bg-[hsl(175,60%,45%)/0.15] border border-[hsl(175,60%,45%)/0.3] flex items-center justify-center">
                    <span className="font-serif text-2xl text-[hsl(175,60%,45%)]">
                      {selectedElement.symbol}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[hsl(38,30%,92%)]">
                      {selectedElement.name}
                    </h3>
                    <span className="font-sans text-xs tracking-[0.15em] uppercase text-[hsl(175,60%,45%)]">
                      {selectedElement.type || 'Element'}
                    </span>
                  </div>
                </div>

                {selectedElement.description && (
                  <p className="font-sans text-sm text-[hsl(38,30%,70%)] leading-relaxed mb-4">
                    {selectedElement.description}
                  </p>
                )}

                {selectedElement.sources && selectedElement.sources.length > 0 && (
                  <div>
                    <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-[hsl(38,30%,50%)] mb-2">
                      Source Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedElement.sources.map((source, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs font-sans bg-[hsl(175,60%,45%)/0.1] text-[hsl(175,60%,55%)] rounded-full border border-[hsl(175,60%,45%)/0.2]"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Element Tile Component
const ElementTile = ({ 
  element, 
  index, 
  variant,
  onClick 
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
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={onClick}
      className={`aspect-square p-2 rounded-lg border bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm transition-all duration-300 cursor-pointer group ${variantStyles[variant]}`}
    >
      <div className="h-full flex flex-col items-center justify-center">
        <span className={`font-serif text-lg md:text-xl font-medium ${symbolColors[variant]} group-hover:scale-110 transition-transform`}>
          {element.symbol}
        </span>
        <span className="font-sans text-[9px] md:text-[10px] text-[hsl(38,30%,55%)] truncate max-w-full mt-1">
          {element.name}
        </span>
      </div>
    </motion.button>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe, index }: { recipe: Recipe; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const nutritionProfile = recipe.nutrition_profile as Record<string, number> | null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group rounded-lg border border-[hsl(175,40%,25%)/0.3] bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm overflow-hidden hover:border-[hsl(175,60%,45%)/0.4] transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative h-48 bg-[hsl(200,15%,12%)] overflow-hidden">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="w-12 h-12 text-[hsl(175,60%,45%)/0.3]" />
          </div>
        )}
        
        {/* Frequency Badge */}
        {recipe.frequency && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-[hsl(200,15%,8%)/0.9] backdrop-blur-sm border border-[hsl(175,60%,45%)/0.3]">
            <span className="font-sans text-xs text-[hsl(175,60%,45%)]">
              {recipe.frequency}x
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg text-[hsl(38,30%,92%)] mb-2">
          {recipe.name}
        </h3>

        {/* Nutrition Profile */}
        {nutritionProfile && Object.keys(nutritionProfile).length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {Object.entries(nutritionProfile).slice(0, 3).map(([key, value]) => (
              <div key={key} className="text-center p-2 rounded bg-[hsl(200,15%,10%)]">
                <span className="block font-sans text-xs text-[hsl(38,30%,50%)] uppercase tracking-wide">
                  {key}
                </span>
                <span className="block font-sans text-sm text-[hsl(175,60%,45%)] font-medium">
                  {typeof value === 'number' ? value : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[hsl(175,60%,45%)] hover:text-[hsl(175,60%,55%)] transition-colors font-sans text-xs tracking-wide"
        >
          <span>{isExpanded ? 'Less' : 'Details'}</span>
          <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-[hsl(175,40%,25%)/0.2]">
                {recipe.instructions && (
                  <p className="font-sans text-sm text-[hsl(38,30%,65%)] leading-relaxed">
                    {recipe.instructions}
                  </p>
                )}
                
                {recipe.last_consumed && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[hsl(38,30%,50%)]">
                    <Clock className="w-3 h-3" />
                    <span className="font-sans">Last: {recipe.last_consumed}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Experiment Log Component
const ExperimentLog = ({ experiment, index }: { experiment: WellnessExperiment; index: number }) => {
  const statusColors = {
    active: 'bg-[hsl(175,60%,45%)] text-[hsl(200,15%,8%)]',
    completed: 'bg-[hsl(38,30%,50%)] text-[hsl(200,15%,8%)]',
    paused: 'bg-[hsl(38,30%,30%)] text-[hsl(38,30%,70%)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative pl-6 pb-6 border-l border-[hsl(175,40%,25%)/0.3] last:border-l-transparent"
    >
      {/* Timeline Node */}
      <div className="absolute left-0 top-0 w-3 h-3 -translate-x-1/2 rounded-full bg-[hsl(175,60%,45%)] shadow-[0_0_8px_hsl(175,60%,45%/0.5)]" />
      
      <div className="p-5 rounded-lg border border-[hsl(175,40%,25%)/0.3] bg-[hsl(200,15%,8%)/0.6] backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="font-serif text-lg text-[hsl(38,30%,92%)]">
              {experiment.name}
            </h3>
            {experiment.start_date && (
              <span className="font-sans text-xs text-[hsl(38,30%,50%)]">
                Started: {experiment.start_date}
              </span>
            )}
          </div>
          
          <span className={`px-2 py-0.5 rounded text-xs font-sans tracking-wide ${statusColors[experiment.status || 'active']}`}>
            {experiment.status || 'Active'}
          </span>
        </div>

        {experiment.intention && (
          <div className="mb-4">
            <h4 className="font-sans text-xs tracking-[0.15em] uppercase text-[hsl(175,60%,45%)] mb-1">
              Intention
            </h4>
            <p className="font-sans text-sm text-[hsl(38,30%,70%)] leading-relaxed">
              {experiment.intention}
            </p>
          </div>
        )}

        {/* Remarks Log */}
        {experiment.remarks && experiment.remarks.length > 0 && (
          <div className="pt-3 border-t border-[hsl(175,40%,25%)/0.2]">
            <h4 className="font-sans text-xs tracking-[0.15em] uppercase text-[hsl(38,30%,50%)] mb-2">
              Lab Notes
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {experiment.remarks.map((remark, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="font-mono text-[hsl(175,60%,45%)] whitespace-nowrap">
                    {remark.timestamp}
                  </span>
                  <span className="font-sans text-[hsl(38,30%,65%)]">
                    {remark.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AlchemyPage;
