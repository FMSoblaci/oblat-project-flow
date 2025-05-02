
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AppNavigation from "@/components/AppNavigation";
import { getBugs, Bug, createBug } from "@/services/bugService";
import { Badge } from "@/components/ui/badge";
import { formatDistancePl } from "@/lib/date-utils";
import BugReportDialog from "@/components/tasks/BugReportDialog";
import { Link } from "react-router-dom";

const Bugs = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);

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
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                    <Badge className={getStatusBadgeClass(bug.status)} variant="outline">
                      {bug.status === 'open' ? 'Otwarty' : 
                       bug.status === 'in_progress' ? 'W trakcie' : 'Rozwiązany'}
                    </Badge>
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
