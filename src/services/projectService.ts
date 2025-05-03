
import { supabase } from "@/integrations/supabase/client";
import { getTaskStats } from "./taskService";

export const getProjectProgress = async () => {
  // Get the planned end date from project_stats
  const { data, error } = await supabase
    .from('project_stats')
    .select('*')
    .eq('name', 'planned_end_date')
    .single();
    
  if (error) {
    console.error("Error fetching planned end date:", error);
    throw error;
  }

  // Calculate progress based on task completion ratio
  const taskStats = await getTaskStats();
  const total = parseInt(taskStats.total) || 0;
  const done = parseInt(taskStats.done) || 0;
  
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  
  return {
    progress: progress.toString(),
    plannedEndDate: data?.value || 'Nie określono'
  };
};
