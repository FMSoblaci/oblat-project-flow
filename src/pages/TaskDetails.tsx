
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Check, MessageSquare, Bug } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDatePl } from "@/lib/date-utils";
import AppNavigation from "@/components/AppNavigation";
import { getTask, Task, updateTask } from "@/services/taskService";
import { getSubtasks, createSubtask, updateSubtask, deleteSubtask, Subtask } from "@/services/subtaskService";
import BugReportDialog from "@/components/tasks/BugReportDialog";
import TaskDiscussionDrawer from "@/components/tasks/TaskDiscussionDrawer";
import SubtaskDialog from "@/components/tasks/SubtaskDialog";
import { Checkbox } from "@/components/ui/checkbox";

const TaskDetails = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
  const [discussionDrawerOpen, setDiscussionDrawerOpen] = useState(false);
  const [subtaskDialogOpen, setSubtaskDialogOpen] = useState(false);
  
  useEffect(() => {
    if (taskId) {
      fetchTaskAndSubtasks(taskId);
    }
  }, [taskId]);
  
  const fetchTaskAndSubtasks = async (id: string) => {
    try {
      setIsLoading(true);
      const taskData = await getTask(id);
      
      if (!taskData) {
        toast({
          title: "Błąd",
          description: "Nie znaleziono zadania o podanym identyfikatorze",
          variant: "destructive",
        });
        navigate("/tasks");
        return;
      }
      
      setTask(taskData);
      
      // Fetch subtasks
      const subtasksData = await getSubtasks(id);
      setSubtasks(subtasksData);
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać szczegółów zadania",
        variant: "destructive",
      });
      navigate("/tasks");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubtaskCreated = (subtask: Subtask) => {
    setSubtasks(prev => [...prev, subtask]);
    setSubtaskDialogOpen(false);
    toast({
      title: "Sukces",
      description: "Podzadanie zostało utworzone",
    });
  };
  
  const handleSubtaskStatusChange = async (subtaskId: string, completed: boolean) => {
    try {
      await updateSubtask(subtaskId, { completed });
      setSubtasks(prev => 
        prev.map(st => st.id === subtaskId ? { ...st, completed } : st)
      );
    } catch (error) {
      console.error("Error updating subtask status:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu podzadania",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const success = await deleteSubtask(subtaskId);
      if (success) {
        setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
        toast({
          title: "Sukces",
          description: "Podzadanie zostało usunięte",
        });
      }
    } catch (error) {
      console.error("Error deleting subtask:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć podzadania",
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-amber-100 text-amber-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
  
  const calculateProgress = () => {
    if (subtasks.length === 0) return 0;
    const completedCount = subtasks.filter(s => s.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Oblat Project Flow</h1>
            </div>
            <AppNavigation />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Oblat Project Flow</h1>
          </div>
          <AppNavigation />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate("/tasks")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do listy zadań
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusBadgeClass(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    Utworzono: {formatDatePl(new Date(task.created_at))}
                  </div>
                </div>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {task.description ? (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Opis</h3>
                    <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-gray-400 italic">Brak opisu</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Przypisane do</h3>
                    <p className="font-medium">{task.assigned_to || "Nieprzypisane"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Termin</h3>
                    <p className="font-medium">
                      {task.due_date 
                        ? formatDatePl(new Date(task.due_date)) 
                        : "Nie określono"}
                    </p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setBugDialogOpen(true)}
                  >
                    <Bug className="mr-1 h-4 w-4" />
                    Zgłoś błąd
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscussionDrawerOpen(true)}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Dyskusja
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Subtasks */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Podzadania</CardTitle>
                <Button 
                  onClick={() => setSubtaskDialogOpen(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm">
                    Postęp: {calculateProgress()}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
                
                {subtasks.length > 0 ? (
                  <ul className="space-y-3">
                    {subtasks.map(subtask => (
                      <li key={subtask.id} className="flex items-start gap-3 p-3 border rounded-md bg-white">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={(checked) => {
                            handleSubtaskStatusChange(subtask.id, checked === true);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className={`${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                            {subtask.title}
                          </p>
                          {subtask.description && (
                            <p className="text-sm text-gray-500 mt-1">{subtask.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Usuń
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Brak podzadań
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs & Drawers */}
      <BugReportDialog
        open={bugDialogOpen}
        onClose={() => setBugDialogOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onBugReported={() => {}}
      />
      
      <TaskDiscussionDrawer
        open={discussionDrawerOpen}
        onClose={() => setDiscussionDrawerOpen(false)}
        task={task}
      />
      
      <SubtaskDialog
        open={subtaskDialogOpen}
        onClose={() => setSubtaskDialogOpen(false)}
        taskId={task.id}
        onSubtaskCreated={handleSubtaskCreated}
      />
    </div>
  );
};

export default TaskDetails;
