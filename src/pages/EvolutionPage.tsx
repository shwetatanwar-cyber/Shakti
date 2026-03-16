import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ShaktiBackground from '@/components/ShaktiBackground';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, ChevronDown, ChevronUp, Sparkles, Award, AlertTriangle, Zap, Cpu } from 'lucide-react';

// Types based on Supabase schema
interface Project {
  id: string;
  title: string;
  brief: string | null;
  full_description: string | null;
  strategy: string | null;
  start_date: string | null;
  end_date: string | null;
  location_id: string | null;
  outcome?: string | null;
  skills_honed?: string[] | null;
  traits_acquired?: string[] | null;
  location?: {
    name: string;
    city_country: string | null;
  } | null;
}

interface ProjectDetail {
  id: string;
  project_id: string | null;
  type: string | null;
  content: string | null;
  meta_info: string | null;
  project?: {
    title: string;
  } | null;
}

interface Philosophy {
  id: string;
  value_statement: string;
  ethic_statement: string;
  framework_statement: string;
}

const EvolutionPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetail[]>([]);
  const [philosophies, setPhilosophies] = useState<Philosophy[]>([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch projects with location
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          location:locations(name, city_country)
        `)
        .order('start_date', { ascending: false });
      
      // Fetch project details (proud moments, failures, skills, etc.)
      const { data: detailsData } = await supabase
        .from('project_details')
        .select(`
          *,
          project:projects(title)
        `);
      
      // Fetch professional philosophy
      const { data: philosophyData } = await supabase
        .from('professional_philosophy')
        .select('*');
      
      if (projectsData) setProjects(projectsData);
      if (detailsData) setProjectDetails(detailsData);
      if (philosophyData) setPhilosophies(philosophyData);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter project details by type
  const proudMoments = projectDetails.filter(d => d.type === 'proud_moment');
  const failures = projectDetails.filter(d => d.type === 'failure');
  const proSkills = projectDetails.filter(d => d.type === 'skill_pro');
  const onDemandSkills = projectDetails.filter(d => d.type === 'skill_on_demand');
  const aiTools = projectDetails.filter(d => d.type === 'ai_tool');

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const sections = [
    { id: 'timeline', label: 'Timeline', icon: Zap },
    { id: 'proud', label: 'Proud Moments', icon: Award },
    { id: 'failures', label: 'Failures', icon: AlertTriangle },
    { id: 'skills', label: 'Skills', icon: Sparkles },
    { id: 'ai', label: 'AI Tools', icon: Cpu },
  ];

  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />
      
      <main className="relative z-10 px-4 md:px-8 py-16 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/"
            className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-primary transition-colors mb-12 inline-block"
          >
            ← Back
          </Link>

          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary mb-4">
            Growth as Practice
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-light italic mb-4 text-foreground">
            Evolution
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-2xl mb-12">
            The spiral of becoming. Each cycle refines, each iteration deepens the pattern.
          </p>
        </motion.div>

        {/* Section Navigation */}
        <motion.nav 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-16"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm tracking-wide transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'glass-tile text-muted-foreground hover:text-foreground hover:border-foreground/20'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </motion.nav>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Timeline Section */}
            {activeSection === 'timeline' && (
              <motion.section
                key="timeline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-display text-3xl font-light italic mb-8 text-foreground">
                  Project Timeline
                </h2>
                
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
                  
                  <div className="space-y-6">
                    {projects.length === 0 ? (
                      <p className="font-body text-muted-foreground italic pl-12">No projects yet. Add your first project to begin your evolution journey.</p>
                    ) : (
                      projects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-12 md:pl-20"
                        >
                          {/* Timeline Node */}
                          <div className="absolute left-2 md:left-6 top-6 w-4 h-4 rounded-full bg-background border-2 border-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
                          
                          {/* Date Badge */}
                          <div className="font-body text-[10px] tracking-[0.2em] uppercase text-primary mb-2">
                            {formatDate(project.start_date)} — {formatDate(project.end_date)}
                          </div>
                          
                          {/* Project Card */}
                          <div
                            className={`glass-tile p-6 cursor-pointer transition-all duration-500 ${
                              expandedProject === project.id ? 'border-primary/30' : ''
                            }`}
                            onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-display text-xl md:text-2xl font-light text-foreground mb-2">
                                  {project.title}
                                </h3>
                                {project.brief && (
                                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                                    {project.brief}
                                  </p>
                                )}
                                
                                {/* Location Badge */}
                                {project.location && (
                                  <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span className="font-body tracking-wide">
                                      {project.location.city_country || project.location.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                                {expandedProject === project.id ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            
                            {/* Expanded Content */}
                            <AnimatePresence>
                              {expandedProject === project.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                                    {project.full_description && (
                                      <div>
                                        <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-2">
                                          Full Description
                                        </h4>
                                        <p className="font-body text-sm text-foreground/80 leading-relaxed">
                                          {project.full_description}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {project.strategy && (
                                      <div>
                                        <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-2">
                                          Strategy
                                        </h4>
                                        <p className="font-body text-sm text-foreground/80 leading-relaxed">
                                          {project.strategy}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {project.outcome && (
                                      <div>
                                        <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-2">
                                          Outcome
                                        </h4>
                                        <p className="font-body text-sm text-foreground/80 leading-relaxed">
                                          {project.outcome}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {project.skills_honed && project.skills_honed.length > 0 && (
                                      <div>
                                        <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-2">
                                          Skills Honed
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          {project.skills_honed.map((skill, i) => (
                                            <span
                                              key={i}
                                              className="px-3 py-1 text-xs font-body bg-primary/10 text-primary rounded-full border border-primary/20"
                                            >
                                              {skill}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {project.traits_acquired && project.traits_acquired.length > 0 && (
                                      <div>
                                        <h4 className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-2">
                                          Traits Acquired
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          {project.traits_acquired.map((trait, i) => (
                                            <span
                                              key={i}
                                              className="px-3 py-1 text-xs font-body bg-accent/10 text-accent rounded-full border border-accent/20"
                                            >
                                              {trait}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Proud Moments Section */}
            {activeSection === 'proud' && (
              <motion.section
                key="proud"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-display text-3xl font-light italic mb-2 text-foreground">
                  Proud Moments
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-8">
                  Celebrating achievements and cultivating gratitude
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {proudMoments.length === 0 ? (
                    <p className="font-body text-muted-foreground italic col-span-2">No proud moments recorded yet.</p>
                  ) : (
                    proudMoments.map((moment, index) => (
                      <motion.div
                        key={moment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-tile p-6 relative overflow-hidden group"
                      >
                        {/* Warm Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="font-body text-xs tracking-[0.2em] uppercase text-primary">
                              {moment.project?.title || 'Project'}
                            </span>
                          </div>
                          
                          <p className="font-body text-foreground leading-relaxed mb-4">
                            {moment.content}
                          </p>
                          
                          {moment.meta_info && (
                            <div className="pt-4 border-t border-white/10">
                              <h4 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">
                                Gratitude
                              </h4>
                              <p className="font-body text-sm text-foreground/70 italic">
                                {moment.meta_info}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            )}

            {/* Failures Section */}
            {activeSection === 'failures' && (
              <motion.section
                key="failures"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-display text-3xl font-light italic mb-2 text-foreground">
                  Failures & Learnings
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-8">
                  The refinement forge — where resilience is tempered
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {failures.length === 0 ? (
                    <p className="font-body text-muted-foreground italic col-span-2">No failures logged yet. Growth requires honesty.</p>
                  ) : (
                    failures.map((failure, index) => (
                      <motion.div
                        key={failure.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-tile p-6 border-l-2 border-l-muted-foreground/30 relative overflow-hidden"
                      >
                        {/* Industrial Texture Overlay */}
                        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
                        
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                            <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
                              {failure.project?.title || 'Project'}
                            </span>
                          </div>
                          
                          <h4 className="font-body text-xs tracking-[0.15em] uppercase text-foreground/50 mb-1">
                            What Failed
                          </h4>
                          <p className="font-body text-foreground leading-relaxed mb-4">
                            {failure.content}
                          </p>
                          
                          {failure.meta_info && (
                            <div className="pt-4 border-t border-white/10">
                              <h4 className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-1">
                                Learnings
                              </h4>
                              <p className="font-body text-sm text-foreground/80">
                                {failure.meta_info}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            )}

            {/* Skills Section */}
            {activeSection === 'skills' && (
              <motion.section
                key="skills"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-display text-3xl font-light italic mb-8 text-foreground">
                  Skill & Trait Polarity
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Pro Skills - Machine Side */}
                  <div className="glass-tile p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-light text-foreground">
                          Pro Skills
                        </h3>
                        <p className="font-body text-xs text-muted-foreground tracking-wide">
                          Technical Mastery
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {proSkills.length === 0 ? (
                        <p className="font-body text-muted-foreground italic text-sm">No pro skills listed yet.</p>
                      ) : (
                        proSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/5 hover:border-primary/20 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="font-body text-sm text-foreground font-medium tracking-wide">
                              {skill.content}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* On-Demand Skills - Human Side */}
                  <div className="glass-tile p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-light text-foreground italic">
                          On-Demand Traits
                        </h3>
                        <p className="font-body text-xs text-muted-foreground tracking-wide">
                          Human Elements
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {onDemandSkills.length === 0 ? (
                        <p className="font-body text-muted-foreground italic text-sm">No on-demand traits listed yet.</p>
                      ) : (
                        onDemandSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/5 hover:border-accent/20 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            <span className="font-body text-sm text-foreground italic tracking-wide">
                              {skill.content}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* AI Tools Section */}
            {activeSection === 'ai' && (
              <motion.section
                key="ai"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-display text-3xl font-light italic mb-2 text-foreground">
                  AI Disruption Lab
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-8">
                  System upgrades — the futuristic edge of the craft
                </p>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {aiTools.length === 0 ? (
                    <p className="font-body text-muted-foreground italic col-span-full">No AI tools documented yet.</p>
                  ) : (
                    aiTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-tile p-6 relative overflow-hidden group"
                      >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700" />
                        
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <Cpu className="w-5 h-5 text-accent" />
                            <span className="font-body text-xs tracking-[0.2em] uppercase text-accent">
                              AI Tool
                            </span>
                          </div>
                          
                          <h3 className="font-body text-lg font-medium text-foreground mb-2">
                            {tool.content}
                          </h3>
                          
                          {tool.meta_info && (
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">
                              {tool.meta_info}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        )}

        {/* Foundation Pyramid Section - Always visible at bottom */}
        {philosophies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-24 pt-16 border-t border-white/10"
          >
            <h2 className="font-display text-3xl font-light italic mb-2 text-foreground text-center">
              Foundation Pyramid
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-12 text-center">
              The philosophical core that anchors all evolution
            </p>
            
            <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
              {philosophies.map((philosophy, index) => (
                <motion.div
                  key={philosophy.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.2 }}
                  className="w-full"
                >
                  {/* Pyramid Levels */}
                  <div className="space-y-3">
                    {/* Apex - Framework */}
                    <div className="glass-tile p-4 mx-auto max-w-xs text-center border-accent/30 hover:border-accent/50 transition-colors">
                      <span className="font-body text-[10px] tracking-[0.3em] uppercase text-accent block mb-1">
                        Framework
                      </span>
                      <p className="font-display text-sm text-foreground italic">
                        {philosophy.framework_statement}
                      </p>
                    </div>
                    
                    {/* Middle - Ethic */}
                    <div className="glass-tile p-4 mx-auto max-w-sm text-center border-primary/30 hover:border-primary/50 transition-colors">
                      <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary block mb-1">
                        Ethic
                      </span>
                      <p className="font-display text-sm text-foreground italic">
                        {philosophy.ethic_statement}
                      </p>
                    </div>
                    
                    {/* Base - Value */}
                    <div className="glass-tile p-5 text-center border-secondary/30 hover:border-secondary/50 transition-colors">
                      <span className="font-body text-[10px] tracking-[0.3em] uppercase text-secondary block mb-1">
                        Value
                      </span>
                      <p className="font-display text-base text-foreground italic">
                        {philosophy.value_statement}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
};

export default EvolutionPage;
