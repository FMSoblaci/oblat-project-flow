
import { supabase } from "@/integrations/supabase/client";

export type Milestone = {
  id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed';
  progress: number;
  due_date?: string;
  created_at: string;
};

export const getMilestones = async () => {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .order('due_date', { ascending: true });
  
  if (error) {
    console.error("Error fetching milestones:", error);
    throw error;
  }
  
  return data as Milestone[];
};
