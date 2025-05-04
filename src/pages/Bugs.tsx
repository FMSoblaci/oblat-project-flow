
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AppNavigation from "@/components/AppNavigation";
import { getBugs, Bug, createBug, updateBug } from "@/services/bugService";
import { Badge } from "@/components/ui/badge";
import { formatDistancePl } from "@/lib/date-utils";
import BugReportDialog from "@/components/tasks/BugReportDialog";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Bugs = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      setIsLoading(true);
      const bugsData = await getBugs();
      setBugs(bugsData);
    } catch (error) {
      console.error("Error fetching bugs:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy błędów",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBug = () => {
    setBugDialogOpen(true);
  };

  const handleBugCreated = () => {
    setBugDialogOpen(false);
    fetchBugs();
    toast({
      title: "Sukces",
      description: "Błąd został zgłoszony",
    });
  };

  const handleStatusChange = async (bugId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    setIsUpdating(bugId);
    try {
      await updateBug(bugId, { status: newStatus });
      toast({
        title: "Status zaktualizowany",
        description: `Status błędu został zmieniony na "${getStatusLabel(newStatus)}"`,
      });
      fetchBugs();
    } catch (error) {
      console.error("Error updating bug status:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu błędu",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "in_progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "resolved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Otwarty";
      case "in_progress":
        return "W trakcie";
      case "resolved":
        return "Rozwiązany";
      default:
        return status;
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Zgłoszone błędy</h2>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddBug}>
            <Plus className="mr-1 h-4 w-4" />
            Zgłoś błąd
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {bugs.map((bug) => (
              <Card key={bug.id} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className={getSeverityBadgeClass(bug.severity)} variant="secondary">
                      {bug.severity === 'critical' ? 'Krytyczny' : 
                       bug.severity === 'medium' ? 'Średni' : 'Niski'}
                    </Badge>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={`${getStatusBadgeClass(bug.status)} border-none px-2 py-0 h-auto font-normal text-xs flex items-center gap-1`}
                          disabled={isUpdating === bug.id}
                        >
                          {getStatusLabel(bug.status)}
                          <ChevronDown className="h-3 w-3 opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="p-0 w-40 bg-white" 
                        align="end" 
                        sideOffset={5}
                      >
                        <div className="py-1 rounded-md shadow-sm">
                          <div
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${bug.status === 'open' ? 'bg-red-50 font-medium' : ''}`}
                            onClick={() => handleStatusChange(bug.id, 'open')}
                          >
                            {bug.status === 'open' && <Check className="h-4 w-4" />}
                            <span className={bug.status === 'open' ? 'ml-0' : 'ml-6'}>Otwarty</span>
                          </div>
                          <div
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${bug.status === 'in_progress' ? 'bg-amber-50 font-medium' : ''}`}
                            onClick={() => handleStatusChange(bug.id, 'in_progress')}
                          >
                            {bug.status === 'in_progress' && <Check className="h-4 w-4" />}
                            <span className={bug.status === 'in_progress' ? 'ml-0' : 'ml-6'}>W trakcie</span>
                          </div>
                          <div
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${bug.status === 'resolved' ? 'bg-green-50 font-medium' : ''}`}
                            onClick={() => handleStatusChange(bug.id, 'resolved')}
                          >
                            {bug.status === 'resolved' && <Check className="h-4 w-4" />}
                            <span className={bug.status === 'resolved' ? 'ml-0' : 'ml-6'}>Rozwiązany</span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <CardTitle className="text-lg mt-2">{bug.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {bug.description && (
                    <p className="text-gray-600 text-sm mb-3">{bug.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Zgłaszający:</span>
                      <span className="font-medium">{bug.reported_by || "Nieznany"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Zgłoszony:</span>
                      <span className="text-gray-600">
                        {formatDistancePl(new Date(bug.reported_at))}
                      </span>
                    </div>
                    {bug.related_task_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Powiązane zadanie:</span>
                        <Link to={`/tasks?id=${bug.related_task_id}`} className="text-blue-600 hover:underline">
                          Zobacz zadanie
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {bugs.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Brak zgłoszonych błędów</p>
              </div>
            )}
          </div>
        )}
      </main>

      <BugReportDialog
        open={bugDialogOpen} 
        onClose={() => setBugDialogOpen(false)}
        onBugReported={handleBugCreated}
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

export default Bugs;
