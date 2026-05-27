GRANT UPDATE (phone_number, payment_status) ON public.oracle_consultations TO anon;
CREATE POLICY "Anon_update_phone" ON public.oracle_consultations FOR UPDATE TO anon USING (true) WITH CHECK (true);