
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  ArrowLeft, 
  Filter, 
  Mail,
  DollarSign,
  Calendar as CalendarIcon,
  Menu as MenuIcon,
  Moon,
  Sun
} from 'lucide-react';
import { useLocalStorage } from '../hooks/use-local-storage';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
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
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart,
  Bar
} from 'recharts';

// Types
type TransactionType = 'income' | 'expense';
type AccountType = 'bank' | 'cash' | 'credit';
type ReportPeriod = 'month' | 'quarter' | 'year' | 'custom';
type ReportType = 'summary' | 'category' | 'account';
type ReportFormat = 'pdf' | 'excel';

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
  type: AccountType;
  color: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
  budget?: number;
}

// Initial data
const initialAccounts: Account[] = [
  { id: '1', name: 'Conta Principal', balance: 5000, type: 'bank', color: '#3B82F6' },
  { id: '2', name: 'Dinheiro', balance: 500, type: 'cash', color: '#10B981' },
  { id: '3', name: 'Cartão de Crédito', balance: -1500, type: 'credit', color: '#EF4444' },
];

const initialCategories: Category[] = [
  { id: '1', name: 'Salário', color: '#10B981', type: 'income', budget: 5000 },
  { id: '2', name: 'Alimentação', color: '#F59E0B', type: 'expense', budget: 1000 },
  { id: '3', name: 'Transporte', color: '#3B82F6', type: 'expense', budget: 500 },
  { id: '4', name: 'Moradia', color: '#8B5CF6', type: 'expense', budget: 1500 },
  { id: '5', name: 'Lazer', color: '#EC4899', type: 'expense', budget: 300 },
  { id: '6', name: 'Saúde', color: '#EF4444', type: 'expense', budget: 400 },
];

const initialTransactions: Transaction[] = [
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
  const [accounts, setAccounts] = useLocalStorage('accounts', initialAccounts);
  const [categories, setCategories] = useLocalStorage('categories', initialCategories);
  const [transactions, setTransactions] = useLocalStorage('transactions', initialTransactions);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Report settings
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('month');
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  // Email dialog state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
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
  
  // Get filtered transactions for the report
  const getFilteredTransactions = () => {
    let startDate: Date;
    let endDate = new Date();
    
    if (reportPeriod === 'custom' && customDateRange.from && customDateRange.to) {
      startDate = new Date(customDateRange.from);
      endDate = new Date(customDateRange.to);
    } else {
      const now = new Date();
      
      if (reportPeriod === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (reportPeriod === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      } else { // year
        startDate = new Date(now.getFullYear(), 0, 1);
      }
    }
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };
  
  // Get category data for pie chart
  const getCategoryData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const categoryMap = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      const categoryId = transaction.category;
      const amount = transaction.amount;
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, 0);
      }
      
      categoryMap.set(categoryId, (categoryMap.get(categoryId) || 0) + amount);
    });
    
    return Array.from(categoryMap.entries()).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Sem categoria',
        value: amount,
        color: category?.color || '#888888',
      };
    });
  };
  
  // Get account data for bar chart
  const getAccountData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const accountIncomeMap = new Map<string, number>();
    const accountExpenseMap = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      const accountId = transaction.accountId;
      const amount = transaction.amount;
      const type = transaction.type;
      
      if (type === 'income') {
        if (!accountIncomeMap.has(accountId)) {
          accountIncomeMap.set(accountId, 0);
        }
        accountIncomeMap.set(accountId, (accountIncomeMap.get(accountId) || 0) + amount);
      } else {
        if (!accountExpenseMap.has(accountId)) {
          accountExpenseMap.set(accountId, 0);
        }
        accountExpenseMap.set(accountId, (accountExpenseMap.get(accountId) || 0) + amount);
      }
    });
    
    return accounts.map(account => ({
      name: account.name,
      receitas: accountIncomeMap.get(account.id) || 0,
      despesas: accountExpenseMap.get(account.id) || 0,
    }));
  };
  
  // Generate PDF report (mock)
  const generatePDFReport = () => {
    showNotification("Gerando relatório em PDF...");
    
    // In a real implementation, we would use a library like jsPDF here
    setTimeout(() => {
      showNotification("Relatório em PDF gerado com sucesso!");
    }, 1500);
  };
  
  // Generate Excel report (mock)
  const generateExcelReport = () => {
    showNotification("Gerando relatório em Excel...");
    
    // In a real implementation, we would use a library like exceljs here
    setTimeout(() => {
      showNotification("Relatório em Excel gerado com sucesso!");
    }, 1500);
  };
  
  // Send report by email (mock)
  const sendReportByEmail = () => {
    showNotification("Enviando relatório para miglourenco19@gmail.com...");
    setShowEmailDialog(false);
    
    // In a real implementation, we would use a server endpoint or email service
    setTimeout(() => {
      showNotification("Relatório enviado com sucesso para miglourenco19@gmail.com!");
    }, 2000);
  };
  
  // Get report period text
  const getReportPeriodText = () => {
    if (reportPeriod === 'custom' && customDateRange.from && customDateRange.to) {
      return `${customDateRange.from.toLocaleDateString('pt-BR')} a ${customDateRange.to.toLocaleDateString('pt-BR')}`;
    }
    
    const now = new Date();
    
    if (reportPeriod === 'month') {
      return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } else if (reportPeriod === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `${quarter}º Trimestre de ${now.getFullYear()}`;
    } else { // year
      return now.getFullYear().toString();
    }
  };
  
  // Generate report
  const generateReport = () => {
    if (reportFormat === 'pdf') {
      generatePDFReport();
    } else {
      generateExcelReport();
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
          <h2 className="text-2xl font-bold">Relatórios</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Settings */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Configurações do Relatório</CardTitle>
              <CardDescription>
                Defina os filtros e formato para o seu relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Período</h3>
                <Select 
                  value={reportPeriod}
                  onValueChange={(value) => setReportPeriod(value as ReportPeriod)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mês Atual</SelectItem>
                    <SelectItem value="quarter">Trimestre Atual</SelectItem>
                    <SelectItem value="year">Ano Atual</SelectItem>
                    <SelectItem value="custom">Período Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportPeriod === 'custom' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Intervalo de Datas</h3>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateRange.from ? (
                            customDateRange.to ? (
                              <>
                                {customDateRange.from.toLocaleDateString('pt-BR')} a{' '}
                                {customDateRange.to.toLocaleDateString('pt-BR')}
                              </>
                            ) : (
                              customDateRange.from.toLocaleDateString('pt-BR')
                            )
                          ) : (
                            "Selecione as datas"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: customDateRange.from,
                            to: customDateRange.to,
                          }}
                          onSelect={setCustomDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tipo de Relatório</h3>
                <Select 
                  value={reportType}
                  onValueChange={(value) => setReportType(value as ReportType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Resumo Geral</SelectItem>
                    <SelectItem value="category">Por Categoria</SelectItem>
                    <SelectItem value="account">Por Conta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Formato</h3>
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
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                onClick={generateReport}
              >
                <Download className="mr-2 h-4 w-4" /> Gerar Relatório
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowEmailDialog(true)}
              >
                <Mail className="mr-2 h-4 w-4" /> Enviar por E-mail
              </Button>
            </CardFooter>
          </Card>

          {/* Report Preview */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Visualização do Relatório</CardTitle>
              <CardDescription>
                {reportType === 'summary' ? 'Resumo Geral' : 
                 reportType === 'category' ? 'Relatório por Categoria' : 
                 'Relatório por Conta'} • {getReportPeriodText()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary */}
                {reportType === 'summary' && (
                  <div className="space-y-6">
                    {/* Financial summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xl font-bold text-green-600">
                            {getFilteredTransactions()
                              .filter(t => t.type === 'income')
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xl font-bold text-red-600">
                            {getFilteredTransactions()
                              .filter(t => t.type === 'expense')
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xl font-bold">
                            {(getFilteredTransactions()
                              .filter(t => t.type === 'income')
                              .reduce((sum, t) => sum + t.amount, 0) - 
                              getFilteredTransactions()
                              .filter(t => t.type === 'expense')
                              .reduce((sum, t) => sum + t.amount, 0))
                              .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Pie Chart - Expenses by Category */}
                    <div className="h-[300px]">
                      <h3 className="text-lg font-medium mb-4">Despesas por Categoria</h3>
                      <ChartContainer
                        config={{
                          expense: { label: "Despesas", color: "#EF4444" },
                        }}
                        className="h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={getCategoryData().filter(d => categories.find(c => c.name === d.name)?.type === 'expense')}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {getCategoryData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [
                                value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                'Valor'
                              ]} 
                            />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                )}

                {/* Category Report */}
                {reportType === 'category' && (
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        income: { label: "Receitas", color: "#10B981" },
                        expense: { label: "Despesas", color: "#EF4444" },
                      }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categories.map(category => {
                            const categoryTransactions = getFilteredTransactions()
                              .filter(t => t.category === category.id);
                            
                            const income = categoryTransactions
                              .filter(t => t.type === 'income')
                              .reduce((sum, t) => sum + t.amount, 0);
                            
                            const expense = categoryTransactions
                              .filter(t => t.type === 'expense')
                              .reduce((sum, t) => sum + t.amount, 0);
                            
                            return {
                              name: category.name,
                              receitas: category.type === 'income' ? income : 0,
                              despesas: category.type === 'expense' ? expense : 0,
                              color: category.color,
                            };
                          })}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 70,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            tickFormatter={(value) => `R$ ${value}`}
                          />
                          <Tooltip
                            formatter={(value) => [
                              value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                              'Valor'
                            ]}
                          />
                          <Legend />
                          <Bar 
                            dataKey="receitas" 
                            name="Receitas" 
                            fill="#10B981" 
                          />
                          <Bar 
                            dataKey="despesas" 
                            name="Despesas" 
                            fill="#EF4444" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}

                {/* Account Report */}
                {reportType === 'account' && (
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        receitas: { label: "Receitas", color: "#10B981" },
                        despesas: { label: "Despesas", color: "#EF4444" },
                      }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getAccountData()}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 70,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            tickFormatter={(value) => `R$ ${value}`}
                          />
                          <Tooltip
                            formatter={(value) => [
                              value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                              'Valor'
                            ]}
                          />
                          <Legend />
                          <Bar 
                            dataKey="receitas" 
                            name="Receitas" 
                            fill="#10B981" 
                          />
                          <Bar 
                            dataKey="despesas" 
                            name="Despesas" 
                            fill="#EF4444" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Relatório por E-mail</DialogTitle>
            <DialogDescription>
              O relatório será enviado para miglourenco19@gmail.com
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Tipo de relatório:</strong> {reportType === 'summary' ? 'Resumo Geral' : 
                reportType === 'category' ? 'Por Categoria' : 'Por Conta'}
            </p>
            <p className="text-sm">
              <strong>Período:</strong> {getReportPeriodText()}
            </p>
            <p className="text-sm">
              <strong>Formato:</strong> {reportFormat.toUpperCase()}
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={sendReportByEmail}>
              <Mail className="mr-2 h-4 w-4" /> Enviar
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

export default Reports;
