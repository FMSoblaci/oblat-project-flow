
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTask, Task } from "@/services/taskService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

const TaskFormDialog = ({ open, onClose, onTaskCreated }: TaskFormDialogProps) => {
  const { profile } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [assignedTo, setAssignedTo] = useState(profile?.full_name || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tytuł zadania jest wymagany");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const task = await createTask({
        title,
        description,
        status,
        assigned_to: assignedTo || undefined,
        due_date: dueDate ? dueDate.toISOString() : undefined,
      });
      
      toast({
        title: "Zadanie utworzone",
        description: "Nowe zadanie zostało dodane pomyślnie",
      });
      onTaskCreated(task);
      resetForm();
    } catch (err) {
      console.error("Error creating task:", err);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć zadania",
        variant: "destructive",
      });
      setError("Nie udało się utworzyć zadania. Spróbuj ponownie później.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setAssignedTo(profile?.full_name || "");
    setDueDate(undefined);
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
          <DialogTitle>Nowe zadanie</DialogTitle>
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
              placeholder="Nazwa zadania"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Szczegółowy opis zadania"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value: "todo" | "in_progress" | "done") => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Do zrobienia</SelectItem>
                  <SelectItem value="in_progress">W trakcie</SelectItem>
                  <SelectItem value="done">Zakończone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="assigned_to">Przypisane do</Label>
              <Input
                id="assigned_to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Imię i nazwisko"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>Termin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, "PPP", { locale: pl })
                  ) : (
                    <span>Wybierz termin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
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
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Zapisywanie..." : "Utwórz zadanie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
