
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

export const createMilestone = async (milestone: Omit<Milestone, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('milestones')
    .insert(milestone)
    .select()
    .single();

  if (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }

  return data as Milestone;
};

export const updateMilestone = async (id: string, updates: Partial<Omit<Milestone, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('milestones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }

  return data as Milestone;
};

export const deleteMilestone = async (id: string) => {
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting milestone:", error);
    throw error;
  }

  return true;
};
