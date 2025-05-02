
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AppNavigation from "@/components/AppNavigation";
import { getTasks, Task } from "@/services/taskService";
import { Input } from "@/components/ui/input";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import TaskCard from "@/components/tasks/TaskCard";
import KanbanBoard from "@/components/tasks/KanbanBoard";

const TaskList = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [task, ...prev]);
    setTaskDialogOpen(false);
    toast({
      title: "Sukces",
      description: "Zadanie zostało utworzone",
    });
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (task.assigned_to && task.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="page-container bg-gray-50">
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
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Lista zadań</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className="rounded-r-none"
              >
                Lista
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                onClick={() => setViewMode("kanban")}
                className="rounded-l-none"
              >
                Kanban
              </Button>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setTaskDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Dodaj zadanie
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Wyszukaj zadania..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onUpdate={fetchTasks} 
                  />
                ))}
                {filteredTasks.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">Brak zadań spełniających kryteria</p>
                  </div>
                )}
              </div>
            ) : (
              <KanbanBoard tasks={filteredTasks} onTaskUpdate={fetchTasks} />
            )}
          </>
        )}
      </main>

      <TaskFormDialog
        open={taskDialogOpen} 
        onClose={() => setTaskDialogOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 z dumą wspierani przez marekglowacki.pl
        </div>
      </footer>
    </div>
  );
};

export default TaskList;
