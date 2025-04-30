
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

export const getTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });
  
  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
  
  return data as Task[];
};

export const getTaskStats = async () => {
  const { data, error } = await supabase
    .from('project_stats')
    .select('*')
    .in('name', ['total_tasks', 'todo_tasks', 'in_progress_tasks', 'done_tasks']);
    
  if (error) {
    console.error("Error fetching task stats:", error);
    throw error;
  }

  const statsObject: Record<string, string> = {};
  data.forEach(item => {
    statsObject[item.name] = item.value;
  });
  
  return {
    total: statsObject.total_tasks || '0',
    todo: statsObject.todo_tasks || '0',
    inProgress: statsObject.in_progress_tasks || '0',
    done: statsObject.done_tasks || '0'
  };
};
