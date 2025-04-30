
import { supabase } from "@/integrations/supabase/client";

export type Activity = {
  id: string;
  user_name: string;
  action: string;
  description?: string;
  activity_type: 'task' | 'bug' | 'milestone';
  created_at: string;
};

export const getActivities = async () => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
  
  return data as Activity[];
};
