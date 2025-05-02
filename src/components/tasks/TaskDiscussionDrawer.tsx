
import { useState, useEffect, useRef } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PaperclipIcon, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { formatDistancePl } from "@/lib/date-utils";
import { Task } from "@/services/taskService";
import { getComments, createComment, Comment } from "@/services/commentService";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TaskDiscussionDrawerProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

const TaskDiscussionDrawer = ({ open, onClose, task }: TaskDiscussionDrawerProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, task.id]);

  useEffect(() => {
    // Scroll to bottom when comments change or drawer opens
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments, open]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const commentsData = await getComments(task.id);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać komentarzy",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("task_attachments")
      .upload(`comments/${task.id}/${fileName}`, file);

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    const { data: publicUrl } = supabase.storage
      .from("task_attachments")
      .getPublicUrl(`comments/${task.id}/${fileName}`);

    return publicUrl.publicUrl;
  };

  const handleSubmitComment = async () => {
    if ((!newComment.trim() && !selectedFile) || !profile) return;
    
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }
      
      const comment = await createComment({
        task_id: task.id,
        content: newComment.trim() || "(załączono plik)",
        user_name: profile.full_name || "Anonimowy",
        image_url: imageUrl,
      });
      
      setComments([...comments, comment]);
      setNewComment("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać komentarza",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistancePl(new Date(dateString));
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="container max-w-3xl mx-auto">
          <DrawerHeader>
            <DrawerTitle>Dyskusja: {task.title}</DrawerTitle>
          </DrawerHeader>
          
          {/* Comments section */}
          <div 
            ref={commentsContainerRef}
            className="px-4 py-2 overflow-y-auto max-h-[55vh] space-y-4"
          >
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Brak komentarzy. Rozpocznij dyskusję!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{comment.user_name}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                  </div>
                  
                  <p className="mt-2 text-gray-700 whitespace-pre-line">{comment.content}</p>
                  
                  {comment.image_url && (
                    <div className="mt-3">
                      <a 
                        href={comment.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={comment.image_url} 
                          alt="Załącznik" 
                          className="max-w-full rounded-md border border-gray-200 max-h-64 object-contain bg-white"
                        />
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <Separator className="my-4" />
          
          {/* Comment input */}
          <div className="px-4 pb-6 space-y-4">
            {selectedFile && (
              <div className="p-2 bg-gray-50 rounded flex justify-between items-center border">
                <span className="text-sm truncate max-w-[80%]">{selectedFile.name}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFile(null)}
                >
                  Usuń
                </Button>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Napisz komentarz..."
                className="resize-none"
                rows={2}
              />
            </div>
            
            <div className="flex justify-between">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleFileSelect}
              >
                <PaperclipIcon className="mr-1 h-4 w-4" />
                Załącz plik
              </Button>
              
              <Button 
                onClick={handleSubmitComment} 
                disabled={isSubmitting}
              >
                <Send className="mr-1 h-4 w-4" />
                Wyślij
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TaskDiscussionDrawer;
