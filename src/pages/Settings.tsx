
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  User, 
  Mail, 
  Bell, 
  LogOut,
  Menu as MenuIcon,
  DollarSign,
  Download,
  Upload,
  Share2,
  ThumbsUp
} from 'lucide-react';
import { useLocalStorage } from '../hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  // State management
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [emailAddress, setEmailAddress] = useState('miglourenco19@gmail.com');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  // Handle navigation
  const navigateTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Show a notification
  const showNotification = (message: string) => {
    toast({
      title: "FinançaFácil",
      description: message,
    });
  };

  // Save settings
  const saveSettings = () => {
    showNotification("Configurações salvas com sucesso");
  };

  // Handle export data
  const exportData = () => {
    // Logic to export data as JSON
    const data = {
      accounts: localStorage.getItem('accounts'),
      categories: localStorage.getItem('categories'),
      transactions: localStorage.getItem('transactions'),
      calendarEvents: localStorage.getItem('calendarEvents')
    };

    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financafacil-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification("Dados exportados com sucesso");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top navigation */}
      <header className="border-b p-4 bg-card">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-comeco-purple" />
            <h1 className="text-xl font-bold">FinançaFácil</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    onClick={() => navigateTo('/')}
                  >
                    Visão Geral
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    onClick={() => navigateTo('/accounts-categories')}
                  >
                    Contas e Categorias
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    onClick={() => navigateTo('/calendar')}
                  >
                    Calendário
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    onClick={() => navigateTo('/reports')}
                  >
                    Relatórios
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    onClick={() => navigateTo('/settings')}
                  >
                    Configurações
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 border-t pt-4">
            <div className="flex flex-col gap-4">
              <button 
                className="text-left px-4 py-2 hover:bg-accent rounded-md"
                onClick={() => navigateTo('/')}
              >
                Visão Geral
              </button>
              <button 
                className="text-left px-4 py-2 hover:bg-accent rounded-md"
                onClick={() => navigateTo('/accounts-categories')}
              >
                Contas e Categorias
              </button>
              <button 
                className="text-left px-4 py-2 hover:bg-accent rounded-md"
                onClick={() => navigateTo('/calendar')}
              >
                Calendário
              </button>
              <button 
                className="text-left px-4 py-2 hover:bg-accent rounded-md"
                onClick={() => navigateTo('/reports')}
              >
                Relatórios
              </button>
              <button 
                className="text-left px-4 py-2 hover:bg-accent rounded-md"
                onClick={() => navigateTo('/settings')}
              >
                Configurações
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigateTo('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Configurações</h2>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 w-full max-w-lg flex">
            <TabsTrigger value="profile" className="flex-1">Perfil</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">Notificações</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">Aparência</TabsTrigger>
          </TabsList>

          {/* Profile settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Seu nome" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu.email@exemplo.com" 
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Backup</h3>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <Button 
                      className="flex items-center gap-2" 
                      variant="outline"
                      onClick={exportData}
                    >
                      <Download className="h-4 w-4" />
                      Exportar Dados
                    </Button>
                    <Button className="flex items-center gap-2" variant="outline">
                      <Upload className="h-4 w-4" />
                      Importar Dados
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Conta</h3>
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair da Conta
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings}>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notification settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure como deseja receber alertas e notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notificações do Navegador</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba alertas sobre vencimentos e eventos
                      </p>
                    </div>
                    <Switch 
                      id="notifications" 
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-reports">Relatórios por E-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba relatórios mensais no seu e-mail
                      </p>
                    </div>
                    <Switch 
                      id="email-reports" 
                      checked={emailReports}
                      onCheckedChange={setEmailReports}
                    />
                  </div>

                  {emailReports && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="report-email">E-mail para envio</Label>
                      <Input 
                        id="report-email" 
                        type="email" 
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings}>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Appearance settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a interface do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tema</Label>
                      <p className="text-sm text-muted-foreground">
                        Escolha entre modo claro ou escuro
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <Switch 
                        checked={darkMode}
                        onCheckedChange={toggleDarkMode}
                      />
                      <Moon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings}>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer with theme toggle */}
      <footer className="border-t p-4 mt-auto bg-card">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm">© 2023 FinançaFácil</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="fixed bottom-4 left-4 z-50 bg-card border shadow-md"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
