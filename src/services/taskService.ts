import { supabase } from "@/integrations/supabase/client";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  assigned_to?: string;
  due_date?: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  assigned_to?: string;
  due_date?: string | null;
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
    
    return data as Task[];
  } catch (error) {
    console.error("Unexpected error fetching tasks:", error);
    return [];
  }
};

export const getTask = async (id: string): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching task:", error);
      return null;
    }
    
    return data as Task;
  } catch (error) {
    console.error("Unexpected error fetching task:", error);
    return null;
  }
};

export const createTask = async (taskInput: CreateTaskInput): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskInput])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating task:", error);
      throw error;
    }
    
    return data as Task;
  } catch (error) {
    console.error("Unexpected error creating task:", error);
    throw error;
  }
};

export const updateTask = async (taskId: string, taskInput: UpdateTaskInput): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskInput)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating task:", error);
      throw error;
    }
    
    return data as Task;
  } catch (error) {
    console.error("Unexpected error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error("Error deleting task:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error deleting task:", error);
    return false;
  }
};
