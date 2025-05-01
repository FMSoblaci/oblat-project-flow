
import { useState } from "react";
import { Task, updateTask } from "@/services/taskService";
import { 
  DndContext, 
  closestCenter, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

const KanbanBoard = ({ tasks, onTaskUpdate }: KanbanBoardProps) => {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as 'todo' | 'in_progress' | 'done';
    const currentTask = tasks.find(task => task.id === taskId);
    
    if (currentTask && currentTask.status !== newStatus) {
      try {
        await updateTask(taskId, { status: newStatus });
        toast({
          title: "Status zaktualizowany",
          description: `Zadanie przeniesione do "${getStatusName(newStatus)}"`,
        });
        onTaskUpdate();
      } catch (error) {
        console.error("Error updating task status:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować statusu zadania",
          variant: "destructive",
        });
      }
    }
    
    setActiveId(null);
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'todo': return 'Do zrobienia';
      case 'in_progress': return 'W trakcie';
      case 'done': return 'Zakończone';
      default: return status;
    }
  };

  const getTasksByStatus = (status: 'todo' | 'in_progress' | 'done') => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['todo', 'in_progress', 'done'].map((status) => (
          <div 
            key={status} 
            id={status}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">{getStatusName(status)}</h3>
              <Badge 
                className={
                  status === 'todo' 
                    ? 'bg-amber-100 text-amber-800'
                    : status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                }
              >
                {getTasksByStatus(status as 'todo' | 'in_progress' | 'done').length}
              </Badge>
            </div>
            
            <div 
              className="space-y-3 min-h-[200px]"
              id={status}
            >
              {getTasksByStatus(status as 'todo' | 'in_progress' | 'done').map((task) => (
                <div 
                  key={task.id} 
                  className="transform transition-transform duration-300 cursor-move"
                  data-task-id={task.id}
                >
                  <TaskCard 
                    task={task} 
                    onUpdate={onTaskUpdate} 
                    draggable={true}
                    id={task.id}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-full opacity-80">
            <TaskCard task={activeTask} onUpdate={onTaskUpdate} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
