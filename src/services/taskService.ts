
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
  status: string;
  assigned_to?: string;
  due_date?: string;
}

export const getTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });
    
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

export const getTaskById = async (taskId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  if (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
  
  return data as Task;
};

export const createTask = async (taskInput: CreateTaskInput): Promise<Task> => {
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
};

export const updateTask = async (taskId: string, taskInput: Partial<CreateTaskInput>): Promise<Task> => {
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
};

export const getTaskStats = async () => {
  try {
    // First, fetch all tasks to calculate stats dynamically
    const { data, error } = await supabase
      .from('tasks')
      .select('status');
      
    if (error) {
      console.error("Error fetching task stats:", error);
      return { total: "0", todo: "0", inProgress: "0", done: "0" };
    }

    // Calculate stats from fetched tasks
    const total = data.length;
    const todo = data.filter(task => task.status === 'todo').length;
    const inProgress = data.filter(task => task.status === 'in_progress').length;
    const done = data.filter(task => task.status === 'done').length;
    
    return {
      total: total.toString(),
      todo: todo.toString(),
      inProgress: inProgress.toString(),
      done: done.toString()
    };
  } catch (error) {
    console.error("Unexpected error fetching task stats:", error);
    return { total: "0", todo: "0", inProgress: "0", done: "0" };
  }
};
