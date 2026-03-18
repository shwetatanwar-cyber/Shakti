-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access" ON public.activity_logs
  FOR SELECT TO public USING (true);

-- Public insert access (for daily log submissions)
CREATE POLICY "Allow public insert access" ON public.activity_logs
  FOR INSERT TO public WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin full access" ON public.activity_logs
  FOR ALL TO authenticated USING (true);
