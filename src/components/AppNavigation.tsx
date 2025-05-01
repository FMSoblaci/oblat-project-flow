
import { Link, useNavigate } from "react-router-dom";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const AppNavigation = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSettingsClick = () => {
    toast({
      title: "Informacja",
      description: "Strona ustawień jest w trakcie budowy",
    });
  };

  return (
    <div className="flex items-center justify-between w-full">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/" className={navigationMenuTriggerStyle()}>
              Dashboard
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/tasks" className={navigationMenuTriggerStyle()}>
              Zadania
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-2">
        <UserMenu />
        <Button variant="ghost" size="icon" onClick={handleSettingsClick}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default AppNavigation;
