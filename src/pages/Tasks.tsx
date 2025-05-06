
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AppNavigation from "@/components/AppNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTasks, Task, getTask } from "@/services/taskService";
import TaskDialog from "@/components/tasks/TaskDialog";
import TaskCard from "@/components/tasks/TaskCard";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import { useParams, useNavigate } from "react-router-dom";

const Tasks = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [selectedTab, setSelectedTab] = useState("all");
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [specificTask, setSpecificTask] = useState<Task | null>(null);
  const [isLoadingSpecificTask, setIsLoadingSpecificTask] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchSpecificTask(taskId);
    } else {
      fetchTasks();
    }
  }, [taskId]);

  const fetchSpecificTask = async (id: string) => {
    try {
      setIsLoadingSpecificTask(true);
      const task = await getTask(id);
      if (task) {
        setSpecificTask(task);
        // Set the correct tab based on task status
        setSelectedTab(task.status);
      } else {
        toast({
          title: "Błąd",
          description: "Nie znaleziono zadania o podanym identyfikatorze",
          variant: "destructive",
        });
        navigate("/tasks");
      }
      fetchTasks();
    } catch (error) {
      console.error("Error fetching specific task:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zadania",
        variant: "destructive",
      });
      navigate("/tasks");
    } finally {
      setIsLoadingSpecificTask(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy zadań",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = () => {
    setTaskDialogOpen(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    setTaskDialogOpen(false);
    toast({
      title: "Sukces",
      description: "Zadanie zostało utworzone",
    });
  };

  const filteredTasks = () => {
    let filtered = tasks;
    
    // If we have a specific task ID, only show that task
    if (specificTask && taskId) {
      return [specificTask];
    }
    
    if (selectedTab === "all") return filtered;
    return filtered.filter(task => task.status === selectedTab);
  };

  const canAddTask = profile?.role === 'pm' || profile?.role === 'developer';

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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {specificTask ? `Zadanie: ${specificTask.title}` : "Zadania projektu"}
          </h2>
          {canAddTask && (
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleAddTask}>
              <Plus className="mr-1 h-4 w-4" />
              Nowe zadanie
            </Button>
          )}
        </div>

        {specificTask ? (
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => { 
                setSpecificTask(null);
                navigate("/tasks");
              }}
            >
              Powrót do wszystkich zadań
            </Button>
            
            <div className="mt-4">
              <TaskCard key={specificTask.id} task={specificTask} onUpdate={() => fetchSpecificTask(taskId!)} />
            </div>
          </div>
        ) : (
          <>
            <Tabs defaultValue="list" value={viewMode} onValueChange={setViewMode} className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {viewMode === "list" ? (
              <>
                <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Wszystkie</TabsTrigger>
                    <TabsTrigger value="todo">Do zrobienia</TabsTrigger>
                    <TabsTrigger value="in_progress">W trakcie</TabsTrigger>
                    <TabsTrigger value="done">Zakończone</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks().map((task) => (
                      <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
                    ))}
                    {filteredTasks().length === 0 && (
                      <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">Brak zadań w wybranej kategorii</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <KanbanBoard tasks={tasks} onTaskUpdate={fetchTasks} />
                )}
              </>
            )}
          </>
        )}
      </main>

      <TaskDialog
        open={taskDialogOpen} 
        onClose={() => setTaskDialogOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 z dumą wspierani przez marekglowacki.pl
        </div>
      </footer>
    </div>
  );
};

export default Tasks;
