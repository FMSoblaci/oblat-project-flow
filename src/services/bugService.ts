
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
  const { data, error } = await supabase
    .from('project_stats')
    .select('*')
    .in('name', ['total_bugs', 'critical_bugs', 'medium_bugs', 'low_bugs']);
    
  if (error) {
    console.error("Error fetching bug stats:", error);
    throw error;
  }

  const statsObject: Record<string, string> = {};
  data.forEach(item => {
    statsObject[item.name] = item.value;
  });
  
  return {
    total: statsObject.total_bugs || '0',
    critical: statsObject.critical_bugs || '0',
    medium: statsObject.medium_bugs || '0',
    low: statsObject.low_bugs || '0'
  };
};
