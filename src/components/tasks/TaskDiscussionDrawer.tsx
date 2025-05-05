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
    if (open && task?.id) {
      fetchComments();
    }
  }, [open, task?.id]);

  useEffect(() => {
    // Scroll to bottom when comments change or drawer opens
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments, open]);

  const fetchComments = async () => {
    if (!task?.id) return;
    
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
    try {
      // Check authentication status before uploading
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("User must be authenticated to upload files");
      }
      
      const fileName = `${Date.now()}-${file.name}`;
      console.log("Uploading file:", {
        fileName,
        bucket: "task_attachments",
        path: `comments/${task.id}/${fileName}`,
        fileSize: file.size
      });
      
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

      console.log("File uploaded successfully, URL:", publicUrl.publicUrl);
      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      toast({
        title: "Błąd",
        description: "Nie uda��o się przesłać pliku",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmitComment = async () => {
    console.log("Attempting to submit comment", {
      hasContent: !!newComment.trim(),
      hasFile: !!selectedFile,
      hasProfile: !!profile,
      profileDetails: profile,
      taskId: task?.id
    });
    
    if ((!newComment.trim() && !selectedFile)) {
      console.log("Validation failed: Empty comment and no file");
      toast({
        title: "Błąd",
        description: "Wypełnij treść komentarza lub dodaj załącznik",
        variant: "destructive"
      });
      return;
    }
    
    // Check authentication status
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      toast({
        title: "Błąd",
        description: "Musisz być zalogowany, aby dodawać komentarze",
        variant: "destructive"
      });
      return;
    }
    
    // Allow comments even without profile by using default values
    const userName = profile?.full_name || authData.session.user.email || "Anonimowy użytkownik";
    
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      
      if (selectedFile) {
        console.log("Uploading image...");
        imageUrl = await uploadImage(selectedFile);
      }
      
      const commentInput = {
        task_id: task.id,
        content: newComment.trim() || "(załączono plik)",
        user_name: userName,
        image_url: imageUrl,
      };
      
      console.log("Sending comment to Supabase:", commentInput);
      const comment = await createComment(commentInput);
      
      console.log("Comment created successfully:", comment);
      setComments(prev => [...prev, comment]);
      setNewComment("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      toast({
        title: "Sukces",
        description: "Komentarz został dodany",
      });
    } catch (error: any) {
      console.error("Failed to submit comment:", {
        message: error.message,
        details: error.details,
        code: error.code
      });
      toast({
        title: "Błąd",
        description: `Nie udało się dodać komentarza: ${error.message || "Nieznany błąd"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistancePl(new Date(dateString));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log("Key pressed:", { key: e.key, ctrlKey: e.ctrlKey });
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmitComment();
    }
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
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-medium">{comment.user_name}</span>
                        <span className="text-xs text-gray-500">{comment.user_name.includes('@') ? '' : comment.user_name.includes('Anonimowy') ? '' : comment.user_name + '@example.com'}</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>
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
                onKeyDown={handleKeyDown}
                placeholder="Napisz komentarz... (Ctrl+Enter aby wysłać)"
                className="resize-none"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex justify-between">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isSubmitting}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleFileSelect}
                disabled={isSubmitting}
              >
                <PaperclipIcon className="mr-1 h-4 w-4" />
                Załącz plik
              </Button>
              
              <Button 
                onClick={handleSubmitComment}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Wysyłanie...
                  </div>
                ) : (
                  <>
                    <Send className="mr-1 h-4 w-4" />
                    Wyślij
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TaskDiscussionDrawer;
