import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProfileSettings = () => {
  return useQuery({
    queryKey: ['profile-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_settings')
        .select('*, locations:current_location_id(name, city_country, description, coordinates)')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useWeeklyPulse = () => {
  return useQuery({
    queryKey: ['weekly-pulse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_pulse')
        .select('*')
        .order('reflection_date', { ascending: false })
        .limit(7);
      if (error) throw error;
      return data;
    },
  });
};

export const useActivePracticesCount = () => {
  return useQuery({
    queryKey: ['active-practices-count'],
    queryFn: async () => {
      const [yogaRes, wellnessRes] = await Promise.all([
        supabase.from('yoga_practice').select('id', { count: 'exact', head: true }),
        supabase.from('wellness_logs').select('id', { count: 'exact', head: true }),
      ]);
      return (yogaRes.count ?? 0) + (wellnessRes.count ?? 0);
    },
  });
};
