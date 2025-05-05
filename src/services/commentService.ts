
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
  console.log("Fetching comments for task:", taskId);
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
  
  console.log("Comments fetched successfully:", data?.length || 0, "comments");
  return data as Comment[];
};

export const createComment = async (commentInput: CreateCommentInput): Promise<Comment> => {
  console.log("Creating comment with data:", commentInput);
  
  if (!commentInput.task_id) {
    console.error("Error: Missing task_id in comment input");
    throw new Error("Missing task_id");
  }
  
  // Make sure we're authenticated to satisfy RLS policies
  const { data: authData } = await supabase.auth.getSession();
  if (!authData.session) {
    console.error("Error: User not authenticated");
    throw new Error("User must be authenticated to create comments");
  }
  
  const { data, error } = await supabase
    .from('comments')
    .insert([commentInput])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating comment:", {
      message: error.message,
      details: error.details,
      code: error.code
    });
    throw error;
  }
  
  console.log("Comment created successfully:", data);
  return data as Comment;
};
