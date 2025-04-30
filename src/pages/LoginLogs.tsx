
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

interface LoginLog {
  id: string;
  user_id: string;
  email: string;
  role: string;
  login_at: string;
}

const LoginLogs = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Only project managers can view this page
  if (profile && profile.role !== 'pm') {
    return <Navigate to="/unauthorized" replace />;
  }

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("login_logs")
          .select("*")
          .order("login_at", { ascending: false });

        if (error) {
          throw error;
        }

        setLogs(data || []);
      } catch (error: any) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać logów: " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatRole = (role: string) => {
    switch(role) {
      case 'pm': return 'Project Manager';
      case 'developer': return 'Programista';
      case 'tester': return 'Tester';
      case 'analyst': return 'Analityk';
      default: return role;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Logi logowań</CardTitle>
          <CardDescription>Historia logowań użytkowników w systemie</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Brak historii logowań
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Data logowania</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Rola</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(log.login_at), 'PPpp', { locale: pl })}
                      </td>
                      <td className="px-6 py-4">{log.email}</td>
                      <td className="px-6 py-4">{formatRole(log.role)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginLogs;
