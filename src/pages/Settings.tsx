import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  ArrowLeft, 
  Sun, 
  Moon,
  DollarSign,
  Menu as MenuIcon
} from 'lucide-react';
import { useLocalStorage } from '../hooks/use-local-storage';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger,
  navigationMenuTriggerStyle 
} from "@/components/ui/navigation-menu";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

// Types for data
interface AppData {
  accounts: any[];
  categories: any[];
  transactions: any[];
  calendarEvents: any[];
  preferences: {
    darkMode: boolean;
    currency: string;
    language: string;
    emailReports: boolean;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  
  // State management
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [currency, setCurrency] = useLocalStorage('currency', 'BRL');
  const [language, setLanguage] = useLocalStorage('language', 'pt-BR');
  const [emailReports, setEmailReports] = useLocalStorage('emailReports', true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Confirm dialog state
  const [showResetDialog, setShowResetDialog] = useState(false);
  
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
  
  // Export app data
  const exportData = () => {
    try {
      // Get all data from localStorage
      const appData: AppData = {
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        calendarEvents: JSON.parse(localStorage.getItem('calendarEvents') || '[]'),
        preferences: {
          darkMode,
          currency,
          language,
          emailReports,
        },
      };
      
      // Create a Blob with the data
      const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
      
      // Create a download link and trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `financafacil_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(link.href);
      
      showNotification("Dados exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      showNotification("Erro ao exportar dados. Tente novamente.");
    }
  };
  
  // Import app data
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importedData: AppData = JSON.parse(e.target?.result as string);
          
          // Validate imported data structure
          if (!importedData.accounts || !importedData.categories || 
              !importedData.transactions || !importedData.preferences) {
            throw new Error("Estrutura de dados inválida");
          }
          
          // Save imported data to localStorage
          localStorage.setItem('accounts', JSON.stringify(importedData.accounts));
          localStorage.setItem('categories', JSON.stringify(importedData.categories));
          localStorage.setItem('transactions', JSON.stringify(importedData.transactions));
          
          if (importedData.calendarEvents) {
            localStorage.setItem('calendarEvents', JSON.stringify(importedData.calendarEvents));
          }
          
          // Set preferences
          setDarkMode(importedData.preferences.darkMode);
          setCurrency(importedData.preferences.currency);
          setLanguage(importedData.preferences.language);
          setEmailReports(importedData.preferences.emailReports);
          
          if (importedData.preferences.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          showNotification("Dados importados com sucesso!");
        } catch (error) {
          console.error("Erro ao processar arquivo importado:", error);
          showNotification("Erro ao processar arquivo. Verifique o formato.");
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      showNotification("Erro ao importar dados. Tente novamente.");
    }
  };
  
  // Reset app data
  const resetAppData = () => {
    try {
      // Clear all app data
      localStorage.removeItem('accounts');
      localStorage.removeItem('categories');
      localStorage.removeItem('transactions');
      localStorage.removeItem('calendarEvents');
      
      // Keep preferences
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      localStorage.setItem('currency', JSON.stringify(currency));
      localStorage.setItem('language', JSON.stringify(language));
      localStorage.setItem('emailReports', JSON.stringify(emailReports));
      
      setShowResetDialog(false);
      showNotification("Todos os dados foram resetados com sucesso!");
      
      // Redirect to home page after reset
      setTimeout(() => {
        navigateTo('/');
      }, 1500);
    } catch (error) {
      console.error("Erro ao resetar dados:", error);
      showNotification("Erro ao resetar dados. Tente novamente.");
    }
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

        <Tabs defaultValue="interface" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="sync">Backup e Sincronização</TabsTrigger>
          </TabsList>

          {/* Interface Tab */}
          <TabsContent value="interface">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Interface</CardTitle>
                <CardDescription>
                  Personalize a aparência e comportamento do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkmode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative o tema escuro para reduzir o cansaço visual
                    </p>
                  </div>
                  <Switch
                    id="darkmode"
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailReports">Relatórios por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba relatórios mensais automaticamente por e-mail
                    </p>
                  </div>
                  <Switch
                    id="emailReports"
                    checked={emailReports}
                    onCheckedChange={setEmailReports}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Tab */}
          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Sincronização</CardTitle>
                <CardDescription>
                  Faça backup dos seus dados ou importe de outro dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Backup Local</h3>
                  <p className="text-sm text-muted-foreground">
                    Exporte todos os seus dados para um arquivo JSON que pode ser importado posteriormente
                  </p>
                  <Button 
                    className="w-full md:w-auto"
                    onClick={exportData}
                  >
                    <Download className="mr-2 h-4 w-4" /> Exportar Dados
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Importar Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Importe dados previamente exportados de outro dispositivo ou backup
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="import-data"
                      accept=".json"
                      className="hidden"
                      onChange={importData}
                    />
                    <Button 
                      className="w-full md:w-auto"
                      onClick={() => document.getElementById('import-data')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Importar Dados
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Resetar Aplicativo</h3>
                    <p className="text-sm text-muted-foreground">
                      Limpe todos os dados e retorne o aplicativo para o estado inicial
                    </p>
                    <Button 
                      variant="destructive" 
                      className="w-full md:w-auto"
                      onClick={() => setShowResetDialog(true)}
                    >
                      Resetar Todos os Dados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Todos os Dados</DialogTitle>
            <DialogDescription>
              Esta ação irá remover permanentemente todos os seus dados. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">
              Todos os seus dados serão perdidos:
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Contas e saldos</li>
              <li>Categorias personalizadas</li>
              <li>Todas as transações</li>
              <li>Eventos do calendário</li>
            </ul>
            <p className="text-sm mt-4">
              Suas preferências de interface serão mantidas.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={resetAppData}>
              Sim, Resetar Tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
