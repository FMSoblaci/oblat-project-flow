
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  const { profile, signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Brak dostępu</h1>
        <p className="text-gray-600 mb-6">
          Nie masz wystarczających uprawnień, aby uzyskać dostęp do tej strony.
          {profile && (
            <span className="block mt-2">
              Twoja rola: <span className="font-medium">{profile.role === 'pm' ? 'Project Manager' : 
                                            profile.role === 'developer' ? 'Programista' : 
                                            profile.role === 'tester' ? 'Tester' : 'Analityk'}</span>
            </span>
          )}
        </p>
        <div className="flex flex-col space-y-2">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link to="/">Wróć do strony głównej</Link>
          </Button>
          <Button variant="outline" onClick={signOut}>
            Wyloguj się
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
