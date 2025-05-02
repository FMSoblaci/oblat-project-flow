import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Plus, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getTaskStats, getTasks, Task, createTask } from "@/services/taskService";
import { getBugStats, getBugs, Bug } from "@/services/bugService";
import { getMilestones, Milestone } from "@/services/milestoneService";
import { getActivities, Activity } from "@/services/activityService";
import { getProjectProgress } from "@/services/projectService";
import { formatDistancePl, formatDatePl } from "@/lib/date-utils";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AppNavigation from "@/components/AppNavigation";
import { useNavigate } from "react-router-dom";
import TaskDialog from "@/components/tasks/TaskDialog";

const Index = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [taskStats, setTaskStats] = useState({ total: "0", todo: "0", inProgress: "0", done: "0" });
  const [bugStats, setBugStats] = useState({ total: "0", critical: "0", medium: "0", low: "0" });
  const [projectProgress, setProjectProgress] = useState({ progress: "0", plannedEndDate: "" });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [
          taskStatsData,
          bugStatsData,
          progressData,
          activitiesData,
          tasksData,
          milestonesData
        ] = await Promise.all([
          getTaskStats(),
          getBugStats(),
          getProjectProgress(),
          getActivities(),
          getTasks(),
          getMilestones()
        ]);
        
        setTaskStats(taskStatsData);
        setBugStats(bugStatsData);
        
        // Calculate project progress based on completed vs. total tasks
        const total = parseInt(taskStatsData.total) || 0;
        const done = parseInt(taskStatsData.done) || 0;
        const calculatedProgress = total > 0 ? Math.round((done / total) * 100) : 0;
        
        setProjectProgress({
          progress: calculatedProgress.toString(),
          plannedEndDate: progressData.plannedEndDate
        });
        
        setActivities(activitiesData);
        
        // Get only the upcoming tasks (not done)
        setUpcomingTasks(tasksData.filter(task => task.status !== 'done').slice(0, 4));
        
        setMilestones(milestonesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych z serwera",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusClass = (dueDate: string | undefined) => {
    if (!dueDate) return "text-gray-500";
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-500";
    if (diffDays <= 2) return "text-red-500";
    if (diffDays <= 7) return "text-amber-500";
    return "text-gray-500";
  };

  const getBorderColorByType = (type: string) => {
    switch (type) {
      case 'task': return 'border-purple-500';
      case 'bug': return 'border-red-500';
      case 'milestone': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'planned':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRelativeDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return formatDistancePl(date);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'pm': return 'Project Manager';
      case 'developer': return 'Programista';
      case 'tester': return 'Tester';
      case 'analyst': return 'Analityk';
      default: return 'Użytkownik';
    }
  };

  const canAddTask = profile?.role === 'pm';
  
  const handleAddTaskClick = () => {
    setTaskDialogOpen(true);
  };

  const handleTaskCreated = (task: Task) => {
    // Update the upcoming tasks list
    setUpcomingTasks(prev => [task, ...prev].slice(0, 4));
    setTaskDialogOpen(false);
    
    // Recalculate task stats
    const newTotal = (parseInt(taskStats.total) + 1).toString();
    const newTodo = task.status === 'todo' ? (parseInt(taskStats.todo) + 1).toString() : taskStats.todo;
    const newInProgress = task.status === 'in_progress' ? (parseInt(taskStats.inProgress) + 1).toString() : taskStats.inProgress;
    
    setTaskStats({
      ...taskStats,
      total: newTotal,
      todo: newTodo,
      inProgress: newInProgress
    });
    
    toast({
      title: "Zadanie utworzone",
      description: "Nowe zadanie zostało dodane do projektu.",
    });
  };

  const handleViewMoreActivities = () => {
    toast({
      title: "Informacja",
      description: "Pełna lista aktywności będzie dostępna wkrótce",
    });
  };

  const handleViewAllTasks = () => {
    navigate("/task-list");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">Testowanie aplikacji finansów Oblatów</h1>
          </div>
          <AppNavigation />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard projektu</h2>
          {profile && (
            <div className="flex items-center gap-2">
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleAddTaskClick}>
                <Plus className="mr-1 h-4 w-4" />
                Nowe zadanie
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-700">Zadania</CardTitle>
                  <CardDescription>Przegląd zadań projektu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{taskStats.total}</div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Do zrobienia</span>
                      <span className="font-medium">{taskStats.todo}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">W trakcie</span>
                      <span className="font-medium">{taskStats.inProgress}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Zakończone</span>
                      <span className="font-medium">{taskStats.done}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-700">Błędy</CardTitle>
                  <CardDescription>Zgłoszone błędy aplikacji</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500 mb-2">{bugStats.total}</div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Krytyczne</span>
                      <span className="font-medium">{bugStats.critical}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Średnie</span>
                      <span className="font-medium">{bugStats.medium}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Niskie</span>
                      <span className="font-medium">{bugStats.low}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-700">Postęp projektu</CardTitle>
                  <CardDescription>Stan realizacji projektu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">{projectProgress.progress}%</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${projectProgress.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Planowana data zakończenia: {projectProgress.plannedEndDate}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ostatnia aktywność</CardTitle>
                  <CardDescription>Najnowsza aktywność w projekcie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className={`border-l-2 ${getBorderColorByType(activity.activity_type)} pl-4 py-1`}
                    >
                      <div className="font-medium">{activity.user_name} {activity.action}</div>
                      <div className="text-sm text-gray-500">
                        {activity.description && `"${activity.description}" - `}
                        {formatRelativeDate(activity.created_at)}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleViewMoreActivities}>
                    Zobacz więcej aktywności
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nadchodzące zadania</CardTitle>
                  <CardDescription>Zadania z najbliższymi terminami</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-500">
                            Przypisane: {task.assigned_to || "Nieprzypisane"}
                          </div>
                        </div>
                        <div className={`text-sm ${getStatusClass(task.due_date)}`}>
                          {task.due_date ? formatRelativeDate(task.due_date) : "Brak terminu"}
                        </div>
                      </div>
                      <Separator className="my-3" />
                    </div>
                  ))}
                  {upcomingTasks.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <AlertCircle className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                      <p>Brak nadchodzących zadań</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleViewAllTasks}>
                    Zobacz wszystkie zadania
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Upcoming Milestones */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Kamienie milowe projektu</CardTitle>
                <CardDescription>Nadchodzące kluczowe wydarzenia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 flex-wrap">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="border border-gray-200 rounded-lg p-4 flex-1 min-w-[250px]">
                      <div className={`${getStatusBadgeClass(milestone.status)} text-xs font-medium rounded px-2 py-1 inline-block mb-2`}>
                        {milestone.status === 'in_progress' ? 'W trakcie' : 
                         milestone.status === 'planned' ? 'Planowane' : 'Zakończone'}
                      </div>
                      <h3 className="font-medium text-lg">{milestone.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Termin: {milestone.due_date ? formatDatePl(new Date(milestone.due_date)) : 'Nieokreślony'}
                      </p>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            milestone.status === 'in_progress' ? 'bg-purple-500' : 
                            milestone.status === 'planned' ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-right mt-1">{milestone.progress}%</p>
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <div className="text-center py-6 text-gray-500 w-full">
                      <AlertCircle className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                      <p>Brak kamieni milowych</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <TaskDialog
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

export default Index;
