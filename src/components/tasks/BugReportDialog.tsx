
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { createBug } from "@/services/bugService";
import { getTasks } from "@/services/taskService";
import { useEffect } from "react";

interface BugReportDialogProps {
  open: boolean;
  onClose: () => void;
  onBugReported: () => void;
  taskId?: string;
  taskTitle?: string;
}

const BugReportDialog = ({ open, onClose, onBugReported, taskId, taskTitle }: BugReportDialogProps) => {
  const { profile } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"critical" | "medium" | "low">("medium");
  const [relatedTaskId, setRelatedTaskId] = useState(taskId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState<{id: string, title: string}[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  useEffect(() => {
    if (open && !taskId) {
      fetchTasks();
    }
  }, [open, taskId]);
  
  useEffect(() => {
    if (taskId) {
      setRelatedTaskId(taskId);
    }
  }, [taskId]);
  
  const fetchTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const tasksData = await getTasks();
      setTasks(tasksData.map(task => ({ id: task.id, title: task.title })));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tytuł błędu jest wymagany");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createBug({
        title,
        description,
        severity,
        related_task_id: relatedTaskId || undefined,
        reported_by: profile?.full_name || undefined,
      });
      
      onBugReported();
      resetForm();
    } catch (err) {
      console.error("Error reporting bug:", err);
      setError("Nie udało się zgłosić błędu. Spróbuj ponownie później.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSeverity("medium");
    if (!taskId) setRelatedTaskId("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Zgłoś błąd</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 p-2 rounded border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Zwięzły opis błędu"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Szczegółowy opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opisz dokładnie jak odtworzyć błąd"
              rows={4}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="severity">Priorytet</Label>
            <Select 
              value={severity} 
              onValueChange={(value: "critical" | "medium" | "low") => setSeverity(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz priorytet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Krytyczny</SelectItem>
                <SelectItem value="medium">Średni</SelectItem>
                <SelectItem value="low">Niski</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!taskId && (
            <div className="grid gap-2">
              <Label htmlFor="related_task">Powiązane zadanie</Label>
              <Select 
                value={relatedTaskId} 
                onValueChange={setRelatedTaskId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz zadanie (opcjonalnie)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Brak powiązanego zadania</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {taskId && taskTitle && (
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-sm font-medium">Powiązane zadanie:</p>
              <p className="text-sm text-gray-600">{taskTitle}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Zapisywanie..." : "Zgłoś błąd"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BugReportDialog;
