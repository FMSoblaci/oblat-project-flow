
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { LogOut, User, FileText } from "lucide-react";

const UserMenu = () => {
  const { user, profile, signOut } = useAuth();

  if (!user) return null;

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleText = (role: string | undefined) => {
    switch (role) {
      case "pm":
        return "Project Manager";
      case "developer":
        return "Programista";
      case "tester":
        return "Tester";
      case "analyst":
        return "Analityk";
      default:
        return "Użytkownik";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarFallback className="bg-purple-600 text-white">
            {profile ? getInitials(profile.full_name) : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {profile && (
              <p className="text-xs text-muted-foreground mt-1">
                {getRoleText(profile.role)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        
        {/* Only show login logs link to PMs */}
        {profile?.role === "pm" && (
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link to="/login-logs">
              <FileText className="mr-2 h-4 w-4" />
              <span>Logi logowań</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Wyloguj się</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
