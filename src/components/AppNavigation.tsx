
import { Link, useNavigate } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, CheckCheck, Settings } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const AppNavigation = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSettingsClick = () => {
    // W przyszłości tutaj można dodać nawigację do strony ustawień
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
            <NavigationMenuTrigger>Projekty</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-3 p-4">
                <li>
                  <NavigationMenuLink asChild>
                    <a
                      className={navigationMenuTriggerStyle()}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/");
                      }}
                    >
                      Aplikacja chmurowa
                    </a>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <a
                      className={navigationMenuTriggerStyle()}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        // W przyszłości można dodać nawigację do innego projektu
                        toast({
                          title: "Informacja",
                          description: "Ta funkcjonalność będzie dostępna wkrótce",
                        });
                      }}
                    >
                      Portal Oblatów
                    </a>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/" className={navigationMenuTriggerStyle()}>
              Dashboard
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/" className={navigationMenuTriggerStyle()}>
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
