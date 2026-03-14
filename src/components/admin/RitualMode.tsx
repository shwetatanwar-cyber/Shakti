import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
}

interface Recipe {
  id: string;
  name: string;
}

interface YogaPractice {
  id: string;
  ritual_name: string | null;
  limb_name: string | null;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] as const }
  }),
};

const moodLabels = ['', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '✨'];
const energyLabels = ['', '🪫', '🔋', '🔋', '🔋', '⚡', '⚡', '⚡', '🔥', '🔥', '💥'];

const RitualMode = () => {
  const [sleepHours, setSleepHours] = useState([7]);
  const [moodScore, setMoodScore] = useState([5]);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [skillsPracticed, setSkillsPracticed] = useState('');
  const [choresCompleted, setChoresCompleted] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [yogaPractices, setYogaPractices] = useState<YogaPractice[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [selectedYoga, setSelectedYoga] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, recipesRes, yogaRes] = await Promise.all([
        supabase.from('projects').select('id, title').order('created_at', { ascending: false }),
        supabase.from('recipes').select('id, name').order('name').limit(5),
        supabase.from('yoga_practice').select('id, ritual_name, limb_name').limit(5),
      ]);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (recipesRes.data) setRecipes(recipesRes.data);
      if (yogaRes.data) setYogaPractices(yogaRes.data);
    };
    fetchData();
  }, []);

  const toggleSelection = (id: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter(i => i !== id) : [...list, id]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Get current location
      const { data: profile } = await supabase
        .from('profile_settings')
        .select('current_location_id')
        .eq('id', 1)
        .single();

      const activityDistribution = {
        projects_worked_on: selectedProjects,
        skills_practiced: skillsPracticed,
        chores_completed: choresCompleted,
        yoga_ids: selectedYoga,
        recipe_ids: selectedRecipes,
      };

      const { data: ritual, error } = await supabase
        .from('daily_rituals')
        .insert({
          sleep_hours: sleepHours[0],
          mood_score: moodScore[0],
          energy_level: energyLevel[0],
          reflection_text: reflection || null,
          activity_distribution: activityDistribution,
          total_active_minutes: null,
          location_id: profile?.current_location_id || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      const wellnessLogs = selectedRecipes.map(recipeId => ({
        daily_ritual_id: ritual.id,
        recipe_id: recipeId,
      }));

      if (wellnessLogs.length > 0) {
        await supabase.from('wellness_logs').insert(wellnessLogs);
      }

      setSealed(true);
      toast({ title: '✦ Day Sealed', description: 'Your ritual has been recorded.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (sealed) {
    return (
      <div className="flex items-center justify-center py-20 px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center"
        >
          <p className="text-6xl mb-6">✦</p>
          <h2 className="font-display text-4xl text-foreground mb-3">Day Sealed</h2>
          <p className="font-body text-muted-foreground text-sm tracking-widest uppercase">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <button
            onClick={() => setSealed(false)}
            className="mt-8 font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Log another day →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Vitals */}
      <motion.section custom={0} initial="hidden" animate="visible" variants={sectionVariants} className="glass-tile p-6 space-y-8">
        <h2 className="font-display text-xl text-foreground tracking-wide">The Vitals</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">Sleep</label>
            <span className="font-display text-2xl text-foreground">{sleepHours[0]}h</span>
          </div>
          <Slider value={sleepHours} onValueChange={setSleepHours} min={0} max={12} step={0.5} className="[&_[data-slot=thumb]]:h-7 [&_[data-slot=thumb]]:w-7 [&_[data-slot=track]]:h-3" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">Mood</label>
            <span className="text-2xl">{moodLabels[moodScore[0]]}</span>
          </div>
          <Slider value={moodScore} onValueChange={setMoodScore} min={1} max={10} step={1} className="[&_[data-slot=thumb]]:h-7 [&_[data-slot=thumb]]:w-7 [&_[data-slot=track]]:h-3" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">Energy</label>
            <span className="text-2xl">{energyLabels[energyLevel[0]]}</span>
          </div>
          <Slider value={energyLevel} onValueChange={setEnergyLevel} min={1} max={10} step={1} className="[&_[data-slot=thumb]]:h-7 [&_[data-slot=thumb]]:w-7 [&_[data-slot=track]]:h-3" />
        </div>
      </motion.section>

      {/* Manifestation */}
      <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="glass-tile p-6 space-y-6">
        <h2 className="font-display text-xl text-foreground tracking-wide">The Manifestation</h2>
        <div className="space-y-2">
          <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">Projects Worked On</label>
          <div className="flex flex-wrap gap-2">
            {projects.map(p => (
              <button key={p.id} onClick={() => toggleSelection(p.id, selectedProjects, setSelectedProjects)}
                className={`px-3 py-1.5 rounded-full font-body text-xs transition-all duration-300 border ${selectedProjects.includes(p.id) ? 'bg-primary/20 border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'}`}>
                {p.title}
              </button>
            ))}
            {projects.length === 0 && <p className="text-muted-foreground text-xs font-body">No projects found</p>}
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">Skills Practiced</label>
          <Input value={skillsPracticed} onChange={e => setSkillsPracticed(e.target.value)} placeholder="e.g. TypeScript, Piano, Sanskrit" className="bg-muted/50 border-border font-body text-sm" />
        </div>
        <div className="space-y-2">
          <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">Chores Completed</label>
          <Input value={choresCompleted} onChange={e => setChoresCompleted(e.target.value)} placeholder="e.g. Laundry, Groceries" className="bg-muted/50 border-border font-body text-sm" />
        </div>
      </motion.section>

      {/* Nourishment & Movement */}
      <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="glass-tile p-6 space-y-6">
        <h2 className="font-display text-xl text-foreground tracking-wide">Nourishment & Movement</h2>
        {recipes.length > 0 && (
          <div className="space-y-2">
            <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">Recipes</label>
            <div className="flex flex-wrap gap-2">
              {recipes.map(r => (
                <button key={r.id} onClick={() => toggleSelection(r.id, selectedRecipes, setSelectedRecipes)}
                  className={`px-3 py-1.5 rounded-full font-body text-xs transition-all duration-300 border ${selectedRecipes.includes(r.id) ? 'bg-saffron/20 border-saffron text-saffron' : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'}`}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {yogaPractices.length > 0 && (
          <div className="space-y-2">
            <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">Yoga / Stillness</label>
            <div className="flex flex-wrap gap-2">
              {yogaPractices.map(y => (
                <button key={y.id} onClick={() => toggleSelection(y.id, selectedYoga, setSelectedYoga)}
                  className={`px-3 py-1.5 rounded-full font-body text-xs transition-all duration-300 border ${selectedYoga.includes(y.id) ? 'bg-violet/20 border-violet text-violet' : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'}`}>
                  {y.ritual_name || y.limb_name || 'Practice'}
                </button>
              ))}
            </div>
          </div>
        )}
        {recipes.length === 0 && yogaPractices.length === 0 && (
          <p className="text-muted-foreground text-xs font-body">No recipes or practices found yet.</p>
        )}
      </motion.section>

      {/* Shadow */}
      <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants} className="glass-tile p-6 space-y-4">
        <h2 className="font-display text-xl text-foreground tracking-wide">The Shadow</h2>
        <Textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="What surfaced today? What did you learn? What are you releasing?" rows={6} className="bg-muted/50 border-border font-body text-sm resize-none leading-relaxed" />
      </motion.section>

      {/* Submit */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-lg font-body text-sm tracking-[0.2em] uppercase transition-all duration-500 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:animate-gradient-shift text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'Sealing…' : '✦ Seal the Day'}
        </button>
      </motion.div>
    </div>
  );
};

export default RitualMode;
