
import { supabase } from "@/integrations/supabase/client";

export const getProjectProgress = async () => {
  const { data, error } = await supabase
    .from('project_stats')
    .select('*')
    .in('name', ['project_progress', 'planned_end_date']);
    
  if (error) {
    console.error("Error fetching project progress:", error);
    throw error;
  }

  const statsObject: Record<string, string> = {};
  data.forEach(item => {
    statsObject[item.name] = item.value;
  });
  
  return {
    progress: statsObject.project_progress || '0',
    plannedEndDate: statsObject.planned_end_date || ''
  };
};
