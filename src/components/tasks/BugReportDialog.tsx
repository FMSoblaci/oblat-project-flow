
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { createBug } from "@/services/bugService";

interface BugReportDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onBugReported: () => void;
}

const BugReportDialog = ({ open, onClose, taskId, taskTitle, onBugReported }: BugReportDialogProps) => {
  const { profile } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"critical" | "medium" | "low">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        related_task_id: taskId,
        reported_by: profile?.full_name || undefined,
      });
      
      resetForm();
      onBugReported();
      onClose();
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
          
          <div className="grid gap-1">
            <Label className="text-gray-500 text-sm">Zadanie</Label>
            <div className="text-sm font-medium bg-gray-50 p-2 rounded border">
              {taskTitle}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">Tytuł błędu</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Krótki opis problemu"
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
            <Select value={severity} onValueChange={(value: "critical" | "medium" | "low") => setSeverity(value)}>
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
              {isSubmitting ? "Zgłaszanie..." : "Zgłoś błąd"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BugReportDialog;
