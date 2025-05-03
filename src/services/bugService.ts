
import { supabase } from "@/integrations/supabase/client";

export type Bug = {
  id: string;
  title: string;
  description?: string;
  severity: 'critical' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  reported_by?: string;
  reported_at: string;
  related_task_id?: string;
};

export type CreateBugInput = {
  title: string;
  description?: string;
  severity: 'critical' | 'medium' | 'low';
  related_task_id?: string;
  reported_by?: string;
}

export const getBugs = async () => {
  const { data, error } = await supabase
    .from('bugs')
    .select('*')
    .order('reported_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching bugs:", error);
    throw error;
  }
  
  return data as Bug[];
};

export const getBugsByTask = async (taskId: string) => {
  const { data, error } = await supabase
    .from('bugs')
    .select('*')
    .eq('related_task_id', taskId)
    .order('reported_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching bugs for task:", error);
    throw error;
  }
  
  return data as Bug[];
};

export const createBug = async (bugInput: CreateBugInput): Promise<Bug> => {
  // If related_task_id is an empty string, set it to null
  const sanitizedInput = {
    ...bugInput,
    related_task_id: bugInput.related_task_id && bugInput.related_task_id.trim() !== '' 
      ? bugInput.related_task_id 
      : null,
    status: 'open' as const
  };

  const { data, error } = await supabase
    .from('bugs')
    .insert([sanitizedInput])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating bug:", error);
    throw error;
  }
  
  return data as Bug;
};

export const getBugStats = async () => {
  // First, fetch all bugs to calculate stats dynamically
  const { data, error } = await supabase
    .from('bugs')
    .select('severity');
    
  if (error) {
    console.error("Error fetching bug stats:", error);
    throw error;
  }

  // Calculate stats from fetched bugs
  const total = data.length;
  const critical = data.filter(bug => bug.severity === 'critical').length;
  const medium = data.filter(bug => bug.severity === 'medium').length;
  const low = data.filter(bug => bug.severity === 'low').length;
  
  return {
    total: total.toString(),
    critical: critical.toString(),
    medium: medium.toString(),
    low: low.toString()
  };
};
