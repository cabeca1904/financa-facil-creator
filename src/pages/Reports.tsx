
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Filter,
  Menu as MenuIcon,
  Moon,
  Sun,
  DollarSign,
  Mail
} from 'lucide-react';
import { useLocalStorage } from '../hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from '@/components/ui/input';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger,
  navigationMenuTriggerStyle 
} from "@/components/ui/navigation-menu";
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

// Types
type TransactionType = 'income' | 'expense';
type ReportFormat = 'pdf' | 'excel';
type ReportPeriod = 'month' | 'year' | 'custom';
type ReportFilter = 'all' | 'income' | 'expense' | 'category' | 'account';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  accountId: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
}

// Sample data
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salário',
    amount: 5000,
    date: '2023-12-05',
    category: '1',
    type: 'income',
    accountId: '1',
  },
  {
    id: '2',
    description: 'Supermercado',
    amount: 350,
    date: '2023-12-10',
    category: '2',
    type: 'expense',
    accountId: '1',
  },
  {
    id: '3',
    description: 'Gasolina',
    amount: 200,
    date: '2023-12-12',
    category: '3',
    type: 'expense',
    accountId: '2',
  },
  {
    id: '4',
    description: 'Aluguel',
    amount: 1200,
    date: '2023-12-15',
    category: '4',
    type: 'expense',
    accountId: '1',
  },
];

const Reports = () => {
  const navigate = useNavigate();
  
  // State management
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [transactions, setTransactions] = useLocalStorage('transactions', sampleTransactions);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Report settings
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('month');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  
  const [emailRecipient, setEmailRecipient] = useState<string>('miglourenco19@gmail.com');
  const [autoSend, setAutoSend] = useState<boolean>(false);

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

  // Generate report
  const generateReport = () => {
    // Logic for generating report would go here
    
    // For now, just show a notification
    showNotification(`Relatório ${reportFormat.toUpperCase()} gerado com sucesso!`);
  };

  // Send report by email
  const sendReportByEmail = () => {
    // Logic for sending report by email would go here
    
    // For now, just show a notification
    showNotification(`Relatório enviado para ${emailRecipient}`);
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
          <h2 className="text-2xl font-bold">Relatórios</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Relatório</CardTitle>
              <CardDescription>
                Personalize e gere relatórios financeiros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Formato</label>
                <Select 
                  value={reportFormat} 
                  onValueChange={(value) => setReportFormat(value as ReportFormat)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Período</label>
                <Select 
                  value={reportPeriod} 
                  onValueChange={(value) => setReportPeriod(value as ReportPeriod)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mês Atual</SelectItem>
                    <SelectItem value="year">Ano Atual</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportPeriod === 'month' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Mês</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'MMMM yyyy', { locale: ptBR }) : 'Selecione o mês'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {reportPeriod === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Intervalo de Datas</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                            </>
                          ) : (
                            format(dateRange.from, 'dd/MM/yyyy')
                          )
                        ) : (
                          'Selecione um intervalo'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setDateRange(range);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Filtrar por</label>
                <Select 
                  value={reportFilter} 
                  onValueChange={(value) => setReportFilter(value as ReportFilter)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os lançamentos</SelectItem>
                    <SelectItem value="income">Apenas receitas</SelectItem>
                    <SelectItem value="expense">Apenas despesas</SelectItem>
                    <SelectItem value="category">Por categoria</SelectItem>
                    <SelectItem value="account">Por conta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(reportFilter === 'category' || reportFilter === 'account') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {reportFilter === 'category' ? 'Categoria' : 'Conta'}
                  </label>
                  <Input 
                    type="text" 
                    placeholder={`Digite o nome da ${reportFilter === 'category' ? 'categoria' : 'conta'}`}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full" 
                onClick={generateReport}
              >
                <Download className="mr-2 h-4 w-4" /> Gerar Relatório
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Envio Automático</CardTitle>
              <CardDescription>
                Configure o envio automático de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <Input 
                  type="email"
                  placeholder="Digite o e-mail para envio"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Input 
                  type="checkbox" 
                  className="w-4 h-4"
                  checked={autoSend}
                  onChange={(e) => setAutoSend(e.target.checked)}
                />
                <label>Enviar automaticamente no fim de cada mês</label>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={sendReportByEmail}
                >
                  <Mail className="mr-2 h-4 w-4" /> Enviar Relatório Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
              <CardDescription>
                Histórico dos últimos relatórios gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Relatório Mensal</h4>
                    <p className="text-sm text-muted-foreground">Dezembro 2023 - PDF</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Relatório por Categoria</h4>
                    <p className="text-sm text-muted-foreground">Alimentação - Novembro 2023 - Excel</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Relatório Anual</h4>
                    <p className="text-sm text-muted-foreground">2023 - PDF</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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

export default Reports;
