
import { supabase } from "@/integrations/supabase/client";

export type Subtask = {
  id: string;
  task_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
};

export type CreateSubtaskInput = {
  task_id: string;
  title: string;
  description?: string;
  completed?: boolean;
};

export type UpdateSubtaskInput = {
  title?: string;
  description?: string | null;
  completed?: boolean;
};

export const getSubtasks = async (taskId: string): Promise<Subtask[]> => {
  try {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching subtasks:", error);
      return [];
    }
    
    return data as Subtask[];
  } catch (error) {
    console.error("Unexpected error fetching subtasks:", error);
    return [];
  }
};

export const getSubtask = async (id: string): Promise<Subtask | null> => {
  try {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching subtask:", error);
      return null;
    }
    
    return data as Subtask;
  } catch (error) {
    console.error("Unexpected error fetching subtask:", error);
    return null;
  }
};

export const createSubtask = async (subtaskInput: CreateSubtaskInput): Promise<Subtask> => {
  try {
    const { data, error } = await supabase
      .from('subtasks')
      .insert([subtaskInput])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating subtask:", error);
      throw error;
    }
    
    return data as Subtask;
  } catch (error) {
    console.error("Unexpected error creating subtask:", error);
    throw error;
  }
};

export const updateSubtask = async (subtaskId: string, subtaskInput: UpdateSubtaskInput): Promise<Subtask> => {
  try {
    const { data, error } = await supabase
      .from('subtasks')
      .update(subtaskInput)
      .eq('id', subtaskId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating subtask:", error);
      throw error;
    }
    
    return data as Subtask;
  } catch (error) {
    console.error("Unexpected error updating subtask:", error);
    throw error;
  }
};

export const deleteSubtask = async (subtaskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);
    
    if (error) {
      console.error("Error deleting subtask:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error deleting subtask:", error);
    return false;
  }
};

export const getTaskProgress = async (taskId: string): Promise<number> => {
  try {
    const subtasks = await getSubtasks(taskId);
    if (subtasks.length === 0) return 0;
    
    const completedCount = subtasks.filter(st => st.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
  } catch (error) {
    console.error("Unexpected error calculating task progress:", error);
    return 0;
  }
};
