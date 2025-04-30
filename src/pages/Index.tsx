
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { Home, LayoutDashboard, CheckCheck, Plus, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">Oblat Project Flow</h1>
          </div>
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
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard projektu</h2>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-1 h-4 w-4" />
            Nowe zadanie
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-700">Zadania</CardTitle>
              <CardDescription>Przegląd zadań projektu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">24</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Do zrobienia</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">W trakcie</span>
                  <span className="font-medium">10</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Zakończone</span>
                  <span className="font-medium">6</span>
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
              <div className="text-3xl font-bold text-red-500 mb-2">5</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Krytyczne</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Średnie</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Niskie</span>
                  <span className="font-medium">1</span>
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
              <div className="text-3xl font-bold text-green-600 mb-2">35%</div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="w-[35%] h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-500 mt-2">Planowana data zakończenia: 31.12.2025</div>
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
              <div className="border-l-2 border-purple-500 pl-4 py-1">
                <div className="font-medium">Jan Kowalski dodał nowe zadanie</div>
                <div className="text-sm text-gray-500">"Implementacja modułu KPiR" - dzisiaj, 10:24</div>
              </div>
              <div className="border-l-2 border-purple-500 pl-4 py-1">
                <div className="font-medium">Anna Nowak zakończyła zadanie</div>
                <div className="text-sm text-gray-500">"Projekt interfejsu logowania" - wczoraj, 15:30</div>
              </div>
              <div className="border-l-2 border-red-500 pl-4 py-1">
                <div className="font-medium">Marek Lewandowski zgłosił błąd</div>
                <div className="text-sm text-gray-500">"Błąd w formularzu KPiR" - 2 dni temu</div>
              </div>
              <div className="border-l-2 border-green-500 pl-4 py-1">
                <div className="font-medium">Adam Wiśniewski naprawił błąd</div>
                <div className="text-sm text-gray-500">"Problem z walidacją formularza" - 3 dni temu</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Zobacz więcej aktywności</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nadchodzące zadania</CardTitle>
              <CardDescription>Zadania z najbliższymi terminami</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">Implementacja API do faktur</div>
                  <div className="text-sm text-gray-500">Przypisane: Jan Kowalski</div>
                </div>
                <div className="text-sm text-red-500">Dzisiaj</div>
              </div>
              <Separator />
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">Testy modułu KPiR</div>
                  <div className="text-sm text-gray-500">Przypisane: Anna Nowak</div>
                </div>
                <div className="text-sm text-amber-500">Za 2 dni</div>
              </div>
              <Separator />
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">Dokumentacja użytkownika</div>
                  <div className="text-sm text-gray-500">Przypisane: Piotr Kowalczyk</div>
                </div>
                <div className="text-sm text-gray-500">Za 5 dni</div>
              </div>
              <Separator />
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">Wdrożenie wersji testowej</div>
                  <div className="text-sm text-gray-500">Przypisane: Zespół</div>
                </div>
                <div className="text-sm text-gray-500">Za tydzień</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Zobacz wszystkie zadania</Button>
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
              <div className="border border-gray-200 rounded-lg p-4 flex-1 min-w-[250px]">
                <div className="bg-purple-100 text-purple-800 text-xs font-medium rounded px-2 py-1 inline-block mb-2">W trakcie</div>
                <h3 className="font-medium text-lg">Prototyp UI</h3>
                <p className="text-sm text-gray-500 mb-2">Termin: 30.06.2025</p>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="w-[65%] h-2 bg-purple-500 rounded-full"></div>
                </div>
                <p className="text-sm text-right mt-1">65%</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 flex-1 min-w-[250px]">
                <div className="bg-amber-100 text-amber-800 text-xs font-medium rounded px-2 py-1 inline-block mb-2">Planowane</div>
                <h3 className="font-medium text-lg">Testy integracyjne</h3>
                <p className="text-sm text-gray-500 mb-2">Termin: 15.09.2025</p>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="w-[10%] h-2 bg-amber-500 rounded-full"></div>
                </div>
                <p className="text-sm text-right mt-1">10%</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 flex-1 min-w-[250px]">
                <div className="bg-gray-100 text-gray-800 text-xs font-medium rounded px-2 py-1 inline-block mb-2">Zaplanowane</div>
                <h3 className="font-medium text-lg">Wdrożenie produkcyjne</h3>
                <p className="text-sm text-gray-500 mb-2">Termin: 31.12.2025</p>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="w-[5%] h-2 bg-gray-500 rounded-full"></div>
                </div>
                <p className="text-sm text-right mt-1">5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 Oblat Project Flow - System zarządzania projektami
        </div>
      </footer>
    </div>
  );
};

export default Index;
