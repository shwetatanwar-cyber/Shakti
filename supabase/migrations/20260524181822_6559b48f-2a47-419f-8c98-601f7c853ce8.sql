ALTER TABLE public.oracle_consultations
ADD COLUMN IF NOT EXISTS submission_type text,
ADD COLUMN IF NOT EXISTS raw_user_reason text;