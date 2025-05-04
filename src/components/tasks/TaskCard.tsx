
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistancePl, formatDatePl } from "@/lib/date-utils";
import { Bug, MessageSquare, Check, ChevronDown } from "lucide-react";
import { Task, updateTask } from "@/services/taskService";
import BugReportDialog from "./BugReportDialog";
import TaskDiscussionDrawer from "./TaskDiscussionDrawer";
import { useDraggable } from "@dnd-kit/core";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  draggable?: boolean;
  id?: string;
  isDragging?: boolean;
}

const TaskCard = ({ task, onUpdate, draggable = false, id, isDragging = false }: TaskCardProps) => {
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
  const [discussionDrawerOpen, setDiscussionDrawerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id || task.id,
    disabled: !draggable || isDragging
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000
  } : undefined;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "done":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "Do zrobienia";
      case "in_progress":
        return "W trakcie";
      case "done":
        return "Zakończone";
      default:
        return status;
    }
  };

  const handleStatusChange = async (newStatus: 'todo' | 'in_progress' | 'done') => {
    if (task.status === newStatus || isDragging || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateTask(task.id, { status: newStatus });
      toast({
        title: "Status zaktualizowany",
        description: `Zadanie przeniesione do "${getStatusLabel(newStatus)}"`,
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu zadania",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDueDate = (date: string | undefined) => {
    if (!date) return "Brak terminu";
    return formatDatePl(new Date(date));
  };

  const getDueDateClass = (date: string | undefined) => {
    if (!date) return "text-gray-500";
    
    const today = new Date();
    const dueDate = new Date(date);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-600 font-medium";
    if (diffDays <= 2) return "text-red-500";
    if (diffDays <= 7) return "text-amber-500";
    return "text-gray-500";
  };

  return (
    <>
      <Card 
        className={`hover:shadow-md transition-shadow duration-300 touch-manipulation ${isDragging ? 'opacity-50' : ''}`}
        ref={draggable ? setNodeRef : undefined}
        style={draggable ? style : undefined}
        {...(draggable && !isDragging ? { ...attributes, ...listeners } : {})}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`${getStatusBadgeClass(task.status)} border-none px-2 py-0 h-auto font-normal text-xs flex items-center gap-1`}
                  disabled={isUpdating || isDragging}
                >
                  {getStatusLabel(task.status)}
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="p-0 w-40 bg-white" 
                align="start" 
                sideOffset={5}
              >
                <div className="py-1 rounded-md shadow-sm">
                  <div
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${task.status === 'todo' ? 'bg-amber-50 font-medium' : ''}`}
                    onClick={() => handleStatusChange('todo')}
                  >
                    {task.status === 'todo' && <Check className="h-4 w-4" />}
                    <span className={task.status === 'todo' ? 'ml-0' : 'ml-6'}>Do zrobienia</span>
                  </div>
                  <div
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${task.status === 'in_progress' ? 'bg-blue-50 font-medium' : ''}`}
                    onClick={() => handleStatusChange('in_progress')}
                  >
                    {task.status === 'in_progress' && <Check className="h-4 w-4" />}
                    <span className={task.status === 'in_progress' ? 'ml-0' : 'ml-6'}>W trakcie</span>
                  </div>
                  <div
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${task.status === 'done' ? 'bg-green-50 font-medium' : ''}`}
                    onClick={() => handleStatusChange('done')}
                  >
                    {task.status === 'done' && <Check className="h-4 w-4" />}
                    <span className={task.status === 'done' ? 'ml-0' : 'ml-6'}>Zakończone</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <CardTitle className="text-lg mt-2">{task.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {task.description && (
            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Przypisane do:</span>
              <span className="font-medium">{task.assigned_to || "Nieprzypisane"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Termin:</span>
              <span className={getDueDateClass(task.due_date)}>
                {formatDueDate(task.due_date)}
              </span>
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setBugDialogOpen(true)}
          >
            <Bug className="mr-1 h-4 w-4" />
            Błąd
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDiscussionDrawerOpen(true)}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            Dyskusja
          </Button>
        </CardFooter>
      </Card>

      <BugReportDialog
        open={bugDialogOpen}
        onClose={() => setBugDialogOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onBugReported={onUpdate}
      />

      <TaskDiscussionDrawer
        open={discussionDrawerOpen}
        onClose={() => setDiscussionDrawerOpen(false)}
        task={task}
      />
    </>
  );
};

export default TaskCard;
