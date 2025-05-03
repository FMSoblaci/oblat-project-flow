
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

export type UpdateBugInput = {
  title?: string;
  description?: string;
  severity?: 'critical' | 'medium' | 'low';
  status?: 'open' | 'in_progress' | 'resolved';
}

export const getBugs = async () => {
  try {
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .order('reported_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching bugs:", error);
      return [];
    }
    
    return data as Bug[];
  } catch (error) {
    console.error("Unexpected error fetching bugs:", error);
    return [];
  }
};

export const getBugsByTask = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .eq('related_task_id', taskId)
      .order('reported_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching bugs for task:", error);
      return [];
    }
    
    return data as Bug[];
  } catch (error) {
    console.error("Unexpected error fetching bugs for task:", error);
    return [];
  }
};

export const createBug = async (bugInput: CreateBugInput): Promise<Bug> => {
  try {
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
  } catch (error) {
    console.error("Unexpected error creating bug:", error);
    throw error;
  }
};

export const updateBug = async (bugId: string, bugInput: UpdateBugInput): Promise<Bug> => {
  try {
    const { data, error } = await supabase
      .from('bugs')
      .update(bugInput)
      .eq('id', bugId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating bug:", error);
      throw error;
    }
    
    return data as Bug;
  } catch (error) {
    console.error("Unexpected error updating bug:", error);
    throw error;
  }
};

export const getBugStats = async () => {
  try {
    // First, fetch all bugs to calculate stats dynamically
    const { data, error } = await supabase
      .from('bugs')
      .select('severity');
      
    if (error) {
      console.error("Error fetching bug stats:", error);
      return { total: "0", critical: "0", medium: "0", low: "0" };
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
  } catch (error) {
    console.error("Unexpected error fetching bug stats:", error);
    return { total: "0", critical: "0", medium: "0", low: "0" };
  }
};
