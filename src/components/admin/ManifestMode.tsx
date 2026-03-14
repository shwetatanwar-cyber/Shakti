import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ── Pillar / Category config ──────────────────────────────────────
const PILLAR_CATEGORIES: Record<string, string[]> = {
  Evolution: ['Project', 'Foundational Philosophy', 'Proud Moment', 'Failure', 'AI Disruption'],
  Vision: ['Moodboard', 'Scribble', 'Lens', 'Thesis'],
  Flow: ['Grind', 'Performance'],
  Vibrations: ['Soundtrack', 'Playlist', 'Sonic Experiment'],
  Stillness: ['Daily Ritual'],
  Alchemy: ['Recipe', 'Movement/Wellness Asset', 'Wellness Experiment'],
  Pilgrimage: ['Postcard', 'Places on Cards'],
  Resonance: ['People', 'Books', 'Podcasts', 'Movies'],
};

const PILLARS = Object.keys(PILLAR_CATEGORIES);

interface SelectOption { id: string; label: string; }

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="font-body text-xs tracking-widest uppercase text-muted-foreground">{children}</label>
);

const DateField = ({ label, value, onChange }: { label: string; value: Date | undefined; onChange: (d: Date | undefined) => void }) => (
  <div className="space-y-2">
    <FieldLabel>{label}</FieldLabel>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-body text-sm bg-muted/50 border-border", !value && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  </div>
);

const ManifestMode = () => {
  const [pillar, setPillar] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Base fields
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [description, setDescription] = useState('');

  // Evolution: Project
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [strategy, setStrategy] = useState('');

  // Evolution: Philosophy
  const [valueStatement, setValueStatement] = useState('');
  const [ethicStatement, setEthicStatement] = useState('');
  const [frameworkStatement, setFrameworkStatement] = useState('');

  // Evolution: Proud Moment / Failure
  const [projects, setProjects] = useState<SelectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [learningsOrGratitude, setLearningsOrGratitude] = useState('');

  // Evolution: AI Disruption
  const [aiToolName, setAiToolName] = useState('');
  const [valueAdded, setValueAdded] = useState('');

  // Vision: Lens
  const [backSideText, setBackSideText] = useState('');

  // Vision: Thesis
  const [mediumLink, setMediumLink] = useState('');

  // Flow: Performance
  const [danceType, setDanceType] = useState('');

  // Vibrations
  const [musicLink, setMusicLink] = useState('');
  const [artist, setArtist] = useState('');
  const [mood, setMood] = useState('');
  const [utility, setUtility] = useState('');
  const [sonicType, setSonicType] = useState<'AI' | 'Raw'>('AI');

  // Stillness
  const [target, setTarget] = useState('');
  const [benefits, setBenefits] = useState('');
  const [precautions, setPrecautions] = useState('');

  // Alchemy: Recipe
  const [ingredients, setIngredients] = useState('');
  const [nutritionProfile, setNutritionProfile] = useState('');
  const [periodicTableLink, setPeriodicTableLink] = useState('');

  // Alchemy: Movement/Wellness
  const [assetType, setAssetType] = useState('Movement');
  const [assetCategory, setAssetCategory] = useState('');

  // Alchemy: Wellness Experiment
  const [intention, setIntention] = useState('');

  // Pilgrimage
  const [locations, setLocations] = useState<SelectOption[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [pilgrimageDate, setPilgrimageDate] = useState<Date>();

  // Current location for auto-context
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchContext = async () => {
      const [profileRes, projectsRes, locationsRes] = await Promise.all([
        supabase.from('profile_settings').select('current_location_id').eq('id', 1).single(),
        supabase.from('projects').select('id, title').order('created_at', { ascending: false }),
        supabase.from('locations').select('id, name, city_country').order('name'),
      ]);
      setCurrentLocationId(profileRes.data?.current_location_id || null);
      if (projectsRes.data) setProjects(projectsRes.data.map(p => ({ id: p.id, label: p.title })));
      if (locationsRes.data) setLocations(locationsRes.data.map(l => ({ id: l.id, label: l.city_country ? `${l.name}, ${l.city_country}` : l.name })));
    };
    fetchContext();
  }, []);

  // Reset form fields when category changes
  useEffect(() => {
    setTitle(''); setMediaUrl(''); setDescription('');
    setStartDate(undefined); setEndDate(undefined); setStrategy('');
    setValueStatement(''); setEthicStatement(''); setFrameworkStatement('');
    setSelectedProjectId(''); setLearningsOrGratitude('');
    setAiToolName(''); setValueAdded('');
    setBackSideText(''); setMediumLink(''); setDanceType('');
    setMusicLink(''); setArtist(''); setMood(''); setUtility(''); setSonicType('AI');
    setTarget(''); setBenefits(''); setPrecautions('');
    setIngredients(''); setNutritionProfile(''); setPeriodicTableLink('');
    setAssetType('Movement'); setAssetCategory('');
    setIntention(''); setSelectedLocationId(''); setPilgrimageDate(undefined);
  }, [category]);

  const categories = useMemo(() => (pillar ? PILLAR_CATEGORIES[pillar] || [] : []), [pillar]);

  const handlePillarChange = (p: string) => {
    setPillar(p);
    setCategory('');
  };

  // ── Save Logic ──────────────────────────────────────────────────
  const handleManifest = async () => {
    if (!pillar || !category) {
      toast({ title: 'Select a Pillar & Category', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const loc = currentLocationId;

      // Evolution
      if (pillar === 'Evolution' && category === 'Project') {
        const { error } = await supabase.from('projects').insert({
          title, brief: description, strategy, location_id: loc,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          full_description: description,
        });
        if (error) throw error;
      } else if (pillar === 'Evolution' && category === 'Foundational Philosophy') {
        const { error } = await supabase.from('professional_philosophy').insert({
          value_statement: valueStatement, ethic_statement: ethicStatement,
          framework_statement: frameworkStatement, location_id: loc,
        });
        if (error) throw error;
      } else if (pillar === 'Evolution' && (category === 'Proud Moment' || category === 'Failure' || category === 'AI Disruption')) {
        const meta: Record<string, string> = {};
        if (category === 'AI Disruption') { meta.ai_tool = aiToolName; meta.value_added = valueAdded; }
        if (category === 'Failure') meta.learnings = learningsOrGratitude;
        if (category === 'Proud Moment') meta.gratitude = learningsOrGratitude;

        const { error } = await supabase.from('creative_works').insert({
          title, description, media_url: mediaUrl || null, pillar: 'evolution',
          category: category.toLowerCase().replace(' ', '_'),
          external_link: selectedProjectId || null, location_id: loc,
        });
        if (error) throw error;

        // Also store detail if project linked
        if (selectedProjectId && (category === 'Proud Moment' || category === 'Failure')) {
          await supabase.from('project_details').insert({
            project_id: selectedProjectId,
            type: category.toLowerCase().replace(' ', '_'),
            content: learningsOrGratitude, meta_info: JSON.stringify(meta),
          });
        }
      }
      // Vision
      else if (pillar === 'Vision') {
        const extra: Record<string, string> = {};
        if (category === 'Lens') extra.back_text = backSideText;
        if (category === 'Thesis') extra.medium_link = mediumLink;

        const { error } = await supabase.from('creative_works').insert({
          title, description, media_url: mediaUrl || null, pillar: 'vision',
          category: category.toLowerCase(), location_id: loc,
          external_link: category === 'Thesis' ? mediumLink : null,
        });
        if (error) throw error;
      }
      // Flow
      else if (pillar === 'Flow') {
        const { error } = await supabase.from('creative_works').insert({
          title, description, media_url: mediaUrl || null, pillar: 'flow',
          category: category.toLowerCase(), location_id: loc,
          is_bw_video: category === 'Grind',
          external_link: category === 'Performance' ? danceType : null,
        });
        if (error) throw error;
      }
      // Vibrations
      else if (pillar === 'Vibrations') {
        const { error } = await supabase.from('music_library').insert({
          title, description, media_url: mediaUrl || null,
          external_link: musicLink || null, artist: artist || null,
          mood: mood || null, utility: utility || null, location_id: loc,
          type: category === 'Sonic Experiment' ? sonicType.toLowerCase() : category.toLowerCase(),
          is_ai_generated: category === 'Sonic Experiment' && sonicType === 'AI',
        });
        if (error) throw error;
      }
      // Stillness
      else if (pillar === 'Stillness') {
        const { error } = await supabase.from('yoga_practice').insert({
          ritual_name: title, description, benefits: benefits || null,
          precautions: precautions || null, location_id: loc,
          ritual_type: target || null, video_url: mediaUrl || null,
          category: 'daily_ritual',
        });
        if (error) throw error;
      }
      // Alchemy
      else if (pillar === 'Alchemy' && category === 'Recipe') {
        const { error } = await supabase.from('recipes').insert({
          name: title, instructions: description, image_url: mediaUrl || null,
          location_id: loc,
          nutrition_profile: nutritionProfile ? { raw: nutritionProfile, ingredients, periodic_table_link: periodicTableLink } : null,
        });
        if (error) throw error;
      } else if (pillar === 'Alchemy' && category === 'Movement/Wellness Asset') {
        if (assetType === 'Movement') {
          const { error } = await supabase.from('movement_library').insert({
            name: title, category: assetCategory || null, unit_type: description || null,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('wellness_library').insert({
            name: title, description,
          });
          if (error) throw error;
        }
      } else if (pillar === 'Alchemy' && category === 'Wellness Experiment') {
        const { error } = await supabase.from('wellness_library').insert({
          name: title, description: `${description}\n\nIntention: ${intention}`,
        });
        if (error) throw error;
      }
      // Pilgrimage
      else if (pillar === 'Pilgrimage') {
        const { error } = await supabase.from('creative_works').insert({
          title, description, media_url: mediaUrl || null, pillar: 'pilgrimage',
          category: category.toLowerCase().replace(/ /g, '_'),
          location_id: selectedLocationId || loc,
        });
        if (error) throw error;
      }
      // Resonance
      else if (pillar === 'Resonance') {
        const { error } = await supabase.from('inspirations').insert({
          name: title, description, image_url: mediaUrl || null,
          category: category.toLowerCase(), location_id: loc,
        });
        if (error) throw error;
      }

      toast({ title: '✦ Manifested Successfully', description: `${category} added to ${pillar}.` });
      setCategory(''); // triggers field reset
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render dynamic fields ──────────────────────────────────────
  const renderDynamicFields = () => {
    if (!category) return null;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${pillar}-${category}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {/* Base fields — always shown */}
          {category !== 'Foundational Philosophy' && (
            <>
              <div className="space-y-2">
                <FieldLabel>Title</FieldLabel>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter title" className="bg-muted/50 border-border font-body text-sm" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Image / Video URL</FieldLabel>
                <Input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://..." className="bg-muted/50 border-border font-body text-sm" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Description</FieldLabel>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe..." rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
            </>
          )}

          {/* ── Evolution ── */}
          {pillar === 'Evolution' && category === 'Project' && (
            <>
              <DateField label="Start Date" value={startDate} onChange={setStartDate} />
              <DateField label="End Date (optional)" value={endDate} onChange={setEndDate} />
              <div className="space-y-2">
                <FieldLabel>Strategy</FieldLabel>
                <Textarea value={strategy} onChange={e => setStrategy(e.target.value)} placeholder="Strategic approach..." rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
            </>
          )}

          {pillar === 'Evolution' && category === 'Foundational Philosophy' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                {['Value', 'Ethic', 'Framework'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-body border transition-colors",
                      (i === 0 && valueStatement) || (i === 1 && ethicStatement) || (i === 2 && frameworkStatement)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border text-muted-foreground'
                    )}>{i + 1}</div>
                    <span className="font-body text-xs text-muted-foreground">{step}</span>
                    {i < 2 && <span className="text-muted-foreground/30 mx-1">→</span>}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <FieldLabel>Value Statement</FieldLabel>
                <Textarea value={valueStatement} onChange={e => setValueStatement(e.target.value)} placeholder="What you stand for..." rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Ethic Statement</FieldLabel>
                <Textarea value={ethicStatement} onChange={e => setEthicStatement(e.target.value)} placeholder="Your ethical code..." rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Framework Statement</FieldLabel>
                <Textarea value={frameworkStatement} onChange={e => setFrameworkStatement(e.target.value)} placeholder="How you operate..." rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
            </div>
          )}

          {pillar === 'Evolution' && (category === 'Proud Moment' || category === 'Failure') && (
            <>
              <div className="space-y-2">
                <FieldLabel>Link to Project</FieldLabel>
                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-muted/50 px-3 font-body text-sm text-foreground">
                  <option value="">None</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel>{category === 'Failure' ? 'Learnings' : 'Gratitude'}</FieldLabel>
                <Textarea value={learningsOrGratitude} onChange={e => setLearningsOrGratitude(e.target.value)}
                  placeholder={category === 'Failure' ? 'What did this teach you?' : 'What are you grateful for?'}
                  rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
            </>
          )}

          {pillar === 'Evolution' && category === 'AI Disruption' && (
            <>
              <div className="space-y-2">
                <FieldLabel>AI Tool Name</FieldLabel>
                <Input value={aiToolName} onChange={e => setAiToolName(e.target.value)} placeholder="e.g. GPT-4, Midjourney" className="bg-muted/50 border-border font-body text-sm" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Value Added</FieldLabel>
                <Textarea value={valueAdded} onChange={e => setValueAdded(e.target.value)} placeholder="How did it augment your work?" rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
            </>
          )}

          {/* ── Vision ── */}
          {pillar === 'Vision' && category === 'Lens' && (
            <div className="space-y-2">
              <FieldLabel>Back-side Text</FieldLabel>
              <Textarea value={backSideText} onChange={e => setBackSideText(e.target.value)} placeholder="Hidden message on the reverse..." rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
            </div>
          )}

          {pillar === 'Vision' && category === 'Thesis' && (
            <div className="space-y-2">
              <FieldLabel>Medium Link</FieldLabel>
              <Input value={mediumLink} onChange={e => setMediumLink(e.target.value)} placeholder="https://medium.com/..." className="bg-muted/50 border-border font-body text-sm" />
            </div>
          )}

          {/* ── Flow ── */}
          {pillar === 'Flow' && category === 'Grind' && (
            <div className="glass-tile p-3 border-dashed border-muted-foreground/30">
              <p className="font-body text-xs text-muted-foreground text-center">🎬 B&W filter will be applied automatically</p>
            </div>
          )}

          {pillar === 'Flow' && category === 'Performance' && (
            <div className="space-y-2">
              <FieldLabel>Dance Type</FieldLabel>
              <select value={danceType} onChange={e => setDanceType(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-muted/50 px-3 font-body text-sm text-foreground">
                <option value="">Select type</option>
                {['Bharatanatyam', 'Kathak', 'Contemporary', 'Freestyle', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {/* ── Vibrations ── */}
          {pillar === 'Vibrations' && (category === 'Soundtrack' || category === 'Playlist') && (
            <>
              <div className="space-y-2">
                <FieldLabel>Music Link</FieldLabel>
                <Input value={musicLink} onChange={e => setMusicLink(e.target.value)} placeholder="Spotify / YouTube link" className="bg-muted/50 border-border font-body text-sm" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Artist</FieldLabel>
                <Input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist name" className="bg-muted/50 border-border font-body text-sm" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Mood</FieldLabel>
                <Input value={mood} onChange={e => setMood(e.target.value)} placeholder="e.g. Melancholic, Uplifting" className="bg-muted/50 border-border font-body text-sm" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Utility</FieldLabel>
                <div className="flex gap-2">
                  {['Deep Work', 'Party', 'Chill'].map(u => (
                    <button key={u} onClick={() => setUtility(u)}
                      className={cn("px-3 py-1.5 rounded-full font-body text-xs transition-all duration-300 border",
                        utility === u ? 'bg-primary/20 border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground/30')}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {pillar === 'Vibrations' && category === 'Sonic Experiment' && (
            <div className="space-y-2">
              <FieldLabel>Type</FieldLabel>
              <div className="flex gap-2">
                {(['AI', 'Raw'] as const).map(t => (
                  <button key={t} onClick={() => setSonicType(t)}
                    className={cn("flex-1 py-2 rounded-lg font-body text-xs tracking-widest uppercase transition-all duration-300 border",
                      sonicType === t ? 'bg-accent/20 border-accent text-accent' : 'border-border text-muted-foreground hover:border-foreground/30')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Stillness ── */}
          {pillar === 'Stillness' && category === 'Daily Ritual' && (
            <>
              <div className="space-y-2">
                <FieldLabel>Target</FieldLabel>
                <div className="flex gap-2">
                  {['Body', 'Mind', 'Heart'].map(t => (
                    <button key={t} onClick={() => setTarget(t)}
                      className={cn("flex-1 py-2 rounded-lg font-body text-xs tracking-widest uppercase transition-all duration-300 border",
                        target === t ? 'bg-violet/20 border-violet text-violet' : 'border-border text-muted-foreground hover:border-foreground/30')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>Benefits</FieldLabel>
                <Textarea value={benefits} onChange={e => setBenefits(e.target.value)} placeholder="Benefits of this practice..." rows={2} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Precautions</FieldLabel>
                <Textarea value={precautions} onChange={e => setPrecautions(e.target.value)} placeholder="Any precautions..." rows={2} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
            </>
          )}

          {/* ── Alchemy ── */}
          {pillar === 'Alchemy' && category === 'Recipe' && (
            <>
              <div className="space-y-2">
                <FieldLabel>Ingredients</FieldLabel>
                <Textarea value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="List ingredients..." rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Nutrition Profile</FieldLabel>
                <Input value={nutritionProfile} onChange={e => setNutritionProfile(e.target.value)} placeholder="e.g. High protein, Low carb" className="bg-muted/50 border-border font-body text-sm" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Periodic Table Link</FieldLabel>
                <Input value={periodicTableLink} onChange={e => setPeriodicTableLink(e.target.value)} placeholder="Link to element" className="bg-muted/50 border-border font-body text-sm" />
              </div>
            </>
          )}

          {pillar === 'Alchemy' && category === 'Movement/Wellness Asset' && (
            <>
              <div className="space-y-2">
                <FieldLabel>Asset Type</FieldLabel>
                <div className="flex gap-2">
                  {['Movement', 'Wellness'].map(t => (
                    <button key={t} onClick={() => setAssetType(t)}
                      className={cn("flex-1 py-2 rounded-lg font-body text-xs tracking-widest uppercase transition-all duration-300 border",
                        assetType === t ? 'bg-saffron/20 border-saffron text-saffron' : 'border-border text-muted-foreground hover:border-foreground/30')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {assetType === 'Movement' && (
                <div className="space-y-2">
                  <FieldLabel>Category</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {['Workout', 'Cardio', 'Dance', 'Ritual'].map(c => (
                      <button key={c} onClick={() => setAssetCategory(c)}
                        className={cn("px-3 py-1.5 rounded-full font-body text-xs transition-all duration-300 border",
                          assetCategory === c ? 'bg-saffron/20 border-saffron text-saffron' : 'border-border text-muted-foreground hover:border-foreground/30')}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {pillar === 'Alchemy' && category === 'Wellness Experiment' && (
            <>
              <div className="space-y-2">
                <FieldLabel>Intention</FieldLabel>
                <Textarea value={intention} onChange={e => setIntention(e.target.value)} placeholder="What's the intention behind this experiment?" rows={3} className="bg-muted/50 border-border font-body text-sm resize-none" />
              </div>
              <DateField label="Start Date" value={startDate} onChange={setStartDate} />
            </>
          )}

          {/* ── Pilgrimage ── */}
          {pillar === 'Pilgrimage' && (
            <>
              <div className="space-y-2">
                <FieldLabel>Target Location</FieldLabel>
                <select value={selectedLocationId} onChange={e => setSelectedLocationId(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-muted/50 px-3 font-body text-sm text-foreground">
                  <option value="">Current location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
              <DateField label="Date" value={pilgrimageDate} onChange={setPilgrimageDate} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="space-y-8">
      {/* Pillar Select */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-tile p-6 space-y-4">
        <h2 className="font-display text-xl text-foreground tracking-wide">Choose Pillar</h2>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map(p => (
            <button key={p} onClick={() => handlePillarChange(p)}
              className={cn("px-4 py-2 rounded-full font-body text-xs tracking-wider uppercase transition-all duration-300 border",
                pillar === p ? 'bg-primary/20 border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground')}>
              {p}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Category Select */}
      {pillar && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-tile p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground tracking-wide">Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={cn("px-4 py-2 rounded-full font-body text-xs tracking-wider uppercase transition-all duration-300 border",
                  category === c ? 'bg-accent/20 border-accent text-accent' : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground')}>
                {c}
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Dynamic Form */}
      {category && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-tile p-6 space-y-6">
          <h2 className="font-display text-xl text-foreground tracking-wide">
            {category}
            <span className="text-muted-foreground text-sm ml-2 font-body">· {pillar}</span>
          </h2>
          {renderDynamicFields()}
        </motion.section>
      )}

      {/* Submit */}
      {category && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={handleManifest} disabled={submitting}
            className="w-full py-4 rounded-lg font-body text-sm tracking-[0.2em] uppercase transition-all duration-500 bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_100%] hover:animate-gradient-shift text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Manifesting…' : '✦ Manifest'}
          </button>
        </motion.div>
      )}

      <div className="h-16" />
    </div>
  );
};

export default ManifestMode;
