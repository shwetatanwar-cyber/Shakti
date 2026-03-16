import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ShaktiBackground from '@/components/ShaktiBackground';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, ChevronDown, ChevronUp, Sparkles, Award, AlertTriangle, Zap, Cpu } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  brief: string | null;
  full_description: string | null;
  strategy: string | null;
  outcome: string | null;
  start_date: string | null;
  end_date: string | null;
  location?: { name: string; city_country: string | null } | null;
}

interface ProjectDetail {
  id: string;
  project_id: string | null;
  type: string | null;
  content: string | null;
  meta_info: string | null;
  project?: { title: string } | null;
}

interface Philosophy {
  id: string;
  value_statement: string;
  ethic_statement: string;
  framework_statement: string;
}

const sectionNav = [
  { id: 'timeline', label: 'Timeline', icon: Zap },
  { id: 'proud', label: 'Proud Moments', icon: Award },
  { id: 'failures', label: 'Failures', icon: AlertTriangle },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'ai', label: 'AI Tools', icon: Cpu },
];

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Present';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const EvolutionPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetail[]>([]);
  const [philosophies, setPhilosophies] = useState<Philosophy[]>([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [projectsRes, detailsRes, philRes] = await Promise.all([
        supabase.from('projects').select('*, location:locations(name, city_country)').order('start_date', { ascending: false }),
        supabase.from('project_details').select('*, project:projects(title)'),
        supabase.from('professional_philosophy').select('*'),
      ]);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (detailsRes.data) setProjectDetails(detailsRes.data);
      if (philRes.data) setPhilosophies(philRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const proudMoments = projectDetails.filter(d => d.type === 'proud_moment');
  const failures = projectDetails.filter(d => d.type === 'failure');
  const proSkills = projectDetails.filter(d => d.type === 'skill_pro');
  const onDemandSkills = projectDetails.filter(d => d.type === 'skill_on_demand');
  const aiTools = projectDetails.filter(d => d.type === 'ai_tool');

  return (
    <div className="min-h-screen relative">
      <ShaktiBackground />

      <main className="relative z-10 px-4 md:px-8 py-16 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors mb-12 inline-block"
          >
            ← Back
          </Link>
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
            Growth as Practice
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-light italic mb-4">
            Evolution
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-2xl">
            The spiral of becoming. Each cycle refines, each iteration deepens the pattern.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 mb-12">
          {sectionNav.map((section) => (
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── TIMELINE ── */}
            {activeSection === 'timeline' && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-2xl italic mb-8 text-foreground">Project Timeline</h2>

                <div className="relative pl-8">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-secondary/40 to-transparent" />

                  {projects.length === 0 ? (
                    <p className="text-muted-foreground font-body text-sm py-8">No projects yet. Add your first project to begin your evolution journey.</p>
                  ) : (
                    projects.map((project, index) => (
                      <div key={project.id} className="relative mb-10">
                        {/* Node */}
                        <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />

                        {/* Date badge */}
                        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                          {formatDate(project.start_date)} — {formatDate(project.end_date)}
                        </p>

                        {/* Card */}
                        <div
                          className="glass-tile p-6 cursor-pointer group"
                          onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-display text-xl italic text-foreground group-hover:text-primary transition-colors">
                                {project.title}
                              </h3>
                              {project.brief && (
                                <p className="font-body text-sm text-muted-foreground mt-1">{project.brief}</p>
                              )}
                              {project.location && (
                                <div className="flex items-center gap-1.5 mt-3 text-muted-foreground">
                                  <MapPin className="w-3 h-3 text-accent" />
                                  <span className="font-body text-xs tracking-wide">{project.location.city_country || project.location.name}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-muted-foreground ml-4 mt-1">
                              {expandedProject === project.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </div>

                          <AnimatePresence>
                            {expandedProject === project.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-6 mt-6 border-t border-border space-y-5">
                                  {project.full_description && (
                                    <div>
                                      <h4 className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-2">Full Description</h4>
                                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{project.full_description}</p>
                                    </div>
                                  )}
                                  {project.strategy && (
                                    <div>
                                      <h4 className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-2">Strategy</h4>
                                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{project.strategy}</p>
                                    </div>
                                  )}
                                  {project.outcome && (
                                    <div>
                                      <h4 className="font-body text-xs tracking-[0.2em] uppercase text-accent mb-2">Outcome</h4>
                                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{project.outcome}</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── PROUD MOMENTS ── */}
            {activeSection === 'proud' && (
              <motion.div key="proud" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-2xl italic mb-2 text-foreground">Proud Moments</h2>
                <p className="font-body text-sm text-muted-foreground mb-8">Celebrating achievements and cultivating gratitude</p>

                <div className="grid gap-6">
                  {proudMoments.length === 0 ? (
                    <p className="text-muted-foreground font-body text-sm py-8">No proud moments recorded yet.</p>
                  ) : (
                    proudMoments.map((moment, index) => (
                      <motion.div
                        key={moment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-tile p-6 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="font-body text-xs tracking-[0.15em] uppercase text-primary">{moment.project?.title || 'Project'}</span>
                          </div>
                          <p className="font-body text-sm text-foreground leading-relaxed">{moment.content}</p>
                          {moment.meta_info && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-accent mb-2">Gratitude</h4>
                              <p className="font-body text-sm text-muted-foreground italic">{moment.meta_info}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── FAILURES ── */}
            {activeSection === 'failures' && (
              <motion.div key="failures" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-2xl italic mb-2 text-foreground">Failures & Learnings</h2>
                <p className="font-body text-sm text-muted-foreground mb-8">The refinement forge — where resilience is tempered</p>

                <div className="grid gap-6">
                  {failures.length === 0 ? (
                    <p className="text-muted-foreground font-body text-sm py-8">No failures logged yet. Growth requires honesty.</p>
                  ) : (
                    failures.map((failure, index) => (
                      <motion.div
                        key={failure.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-tile p-6 relative overflow-hidden border-destructive/20"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="font-body text-xs tracking-[0.15em] uppercase text-destructive">{failure.project?.title || 'Project'}</span>
                          </div>
                          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">What Failed</h4>
                          <p className="font-body text-sm text-foreground leading-relaxed">{failure.content}</p>
                          {failure.meta_info && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-accent mb-2">Learnings</h4>
                              <p className="font-body text-sm text-muted-foreground italic">{failure.meta_info}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── SKILLS ── */}
            {activeSection === 'skills' && (
              <motion.div key="skills" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-2xl italic mb-8 text-foreground">Skill & Trait Polarity</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pro Skills */}
                  <div className="glass-tile p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg italic text-foreground">Pro Skills</h3>
                        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Technical Mastery</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {proSkills.length === 0 ? (
                        <p className="text-muted-foreground font-body text-sm">No pro skills listed yet.</p>
                      ) : (
                        proSkills.map((skill) => (
                          <div key={skill.id} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="font-body text-sm text-foreground">{skill.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* On-Demand Traits */}
                  <div className="glass-tile p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg italic text-foreground">On-Demand Traits</h3>
                        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Human Elements</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {onDemandSkills.length === 0 ? (
                        <p className="text-muted-foreground font-body text-sm">No on-demand traits listed yet.</p>
                      ) : (
                        onDemandSkills.map((skill) => (
                          <div key={skill.id} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span className="font-body text-sm text-foreground">{skill.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── AI TOOLS ── */}
            {activeSection === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-2xl italic mb-2 text-foreground">AI Disruption Lab</h2>
                <p className="font-body text-sm text-muted-foreground mb-8">System upgrades — the futuristic edge of the craft</p>

                <div className="grid gap-6">
                  {aiTools.length === 0 ? (
                    <p className="text-muted-foreground font-body text-sm py-8">No AI tools documented yet.</p>
                  ) : (
                    aiTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-tile p-6 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/5 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <Cpu className="w-4 h-4 text-accent" />
                            <span className="font-body text-xs tracking-[0.15em] uppercase text-accent">AI Tool</span>
                          </div>
                          <p className="font-body text-sm text-foreground leading-relaxed">{tool.content}</p>
                          {tool.meta_info && (
                            <p className="font-body text-xs text-muted-foreground mt-3 italic">{tool.meta_info}</p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── FOUNDATION PYRAMID ── */}
        {philosophies.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl italic mb-2 text-foreground">Foundation Pyramid</h2>
            <p className="font-body text-sm text-muted-foreground mb-8">The philosophical core that anchors all evolution</p>

            <div className="space-y-8">
              {philosophies.map((philosophy) => (
                <div key={philosophy.id} className="space-y-4">
                  {/* Apex – Framework */}
                  <div className="glass-tile p-6 max-w-md mx-auto text-center border-accent/30">
                    <span className="font-body text-[10px] tracking-[0.3em] uppercase text-accent">Framework</span>
                    <p className="font-body text-sm text-foreground mt-2 leading-relaxed">{philosophy.framework_statement}</p>
                  </div>

                  {/* Middle – Ethic */}
                  <div className="glass-tile p-6 max-w-lg mx-auto text-center border-primary/30">
                    <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary">Ethic</span>
                    <p className="font-body text-sm text-foreground mt-2 leading-relaxed">{philosophy.ethic_statement}</p>
                  </div>

                  {/* Base – Value */}
                  <div className="glass-tile p-6 max-w-xl mx-auto text-center border-secondary/30">
                    <span className="font-body text-[10px] tracking-[0.3em] uppercase text-secondary">Value</span>
                    <p className="font-body text-sm text-foreground mt-2 leading-relaxed">{philosophy.value_statement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EvolutionPage;
