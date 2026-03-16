
-- RLS for project_proud_moments
ALTER TABLE public.project_proud_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.project_proud_moments FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.project_proud_moments FOR ALL TO authenticated USING (true);

-- RLS for project_failures
ALTER TABLE public.project_failures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.project_failures FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.project_failures FOR ALL TO authenticated USING (true);

-- RLS for project_skills
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.project_skills FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.project_skills FOR ALL TO authenticated USING (true);

-- RLS for project_traits
ALTER TABLE public.project_traits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.project_traits FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.project_traits FOR ALL TO authenticated USING (true);

-- RLS for project_ai_tools
ALTER TABLE public.project_ai_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.project_ai_tools FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.project_ai_tools FOR ALL TO authenticated USING (true);

-- RLS for skills_library
ALTER TABLE public.skills_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.skills_library FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.skills_library FOR ALL TO authenticated USING (true);

-- RLS for traits_library
ALTER TABLE public.traits_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.traits_library FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.traits_library FOR ALL TO authenticated USING (true);

-- RLS for ai_tools_library
ALTER TABLE public.ai_tools_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.ai_tools_library FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.ai_tools_library FOR ALL TO authenticated USING (true);

-- RLS for professional_philosophy
ALTER TABLE public.professional_philosophy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.professional_philosophy FOR SELECT TO public USING (true);
CREATE POLICY "Admin full access" ON public.professional_philosophy FOR ALL TO authenticated USING (true);
