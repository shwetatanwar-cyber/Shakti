
-- Enable RLS and add public read policies for tables used by the frontend
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.profile_settings FOR SELECT USING (true);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.locations FOR SELECT USING (true);

ALTER TABLE public.weekly_pulse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.weekly_pulse FOR SELECT USING (true);

ALTER TABLE public.yoga_practice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.yoga_practice FOR SELECT USING (true);

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.wellness_logs FOR SELECT USING (true);

ALTER TABLE public.connect_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert access" ON public.connect_requests FOR INSERT WITH CHECK (true);
