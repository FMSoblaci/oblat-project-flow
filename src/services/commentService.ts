
import { supabase } from "@/integrations/supabase/client";

export type Comment = {
  id: string;
  task_id: string;
  content: string;
  user_name: string;
  created_at: string;
  image_url?: string;
};

export type CreateCommentInput = {
  task_id: string;
  content: string;
  user_name: string;
  image_url?: string | null;
};

export const getComments = async (taskId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
  
  return data as Comment[];
};

export const createComment = async (commentInput: CreateCommentInput): Promise<Comment> => {
  console.log("Creating comment:", commentInput);
  
  const { data, error } = await supabase
    .from('comments')
    .insert([commentInput])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
  
  console.log("Comment created:", data);
  return data as Comment;
};
