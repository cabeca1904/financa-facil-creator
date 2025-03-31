
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  PieChart, 
  LineChart, 
  Settings, 
  FilePlus, 
  Menu as MenuIcon,
  Plus,
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
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger,
  navigationMenuTriggerStyle 
} from "@/components/ui/navigation-menu";
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Legend 
} from 'recharts';

// Types for our application
type TransactionType = 'income' | 'expense';
type AccountType = 'bank' | 'cash' | 'credit';

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

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: TransactionType | 'invoice' | 'other';
  recurrence: 'once' | 'weekly' | 'monthly';
  description?: string;
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

const initialCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Pagamento Aluguel',
    date: '2023-12-10',
    amount: 1200,
    type: 'expense',
    recurrence: 'monthly',
    description: 'Pagamento mensal do aluguel'
  },
  {
    id: '2',
    title: 'Salário',
    date: '2023-12-05',
    amount: 5000,
    type: 'income',
    recurrence: 'monthly',
    description: 'Salário mensal'
  },
  {
    id: '3',
    title: 'Fatura Cartão',
    date: '2023-12-15',
    amount: 1500,
    type: 'invoice',
    recurrence: 'monthly',
    description: 'Fatura do cartão de crédito'
  },
];

const Dashboard = () => {
  // State management with localStorage persistence
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [accounts, setAccounts] = useLocalStorage('accounts', initialAccounts);
  const [categories, setCategories] = useLocalStorage('categories', initialCategories);
  const [transactions, setTransactions] = useLocalStorage('transactions', initialTransactions);
  const [calendarEvents, setCalendarEvents] = useLocalStorage('calendarEvents', initialCalendarEvents);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  // Calculate total balance, income, and expenses
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  const totalIncome = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const totalExpenses = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Prepare data for pie chart - category distribution
  const categoryExpenseData = categories
    .filter(category => category.type === 'expense')
    .map(category => {
      const total = transactions
        .filter(
          transaction => 
            transaction.category === category.id && 
            transaction.type === 'expense'
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      return {
        name: category.name,
        value: total,
        color: category.color,
      };
    })
    .filter(item => item.value > 0);

  // Prepare data for line chart - monthly income/expense trends
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i, 1);
    return date.toLocaleString('pt-BR', { month: 'short' });
  });

  const lineChartData = months.map((month, index) => {
    const monthIndex = index;
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === monthIndex && 
        transactionDate.getFullYear() === currentYear;
    });

    const monthIncome = monthTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const monthExpense = monthTransactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      name: month,
      receitas: monthIncome,
      despesas: monthExpense,
    };
  });

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
        <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>

        {/* Financial summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Saldo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>Despesas por categoria</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  income: { label: "Receitas", color: "#10B981" },
                  expense: { label: "Despesas", color: "#EF4444" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryExpenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryExpenseData.map((entry, index) => (
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
            </CardContent>
          </Card>

          {/* Line chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Financeira</CardTitle>
              <CardDescription>Receitas e despesas ao longo do ano</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  receitas: { label: "Receitas", color: "#10B981" },
                  despesas: { label: "Despesas", color: "#EF4444" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={lineChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
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
                    <Line
                      type="monotone"
                      dataKey="receitas"
                      stroke="#10B981"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="despesas" stroke="#EF4444" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            className="flex items-center gap-2" 
            onClick={() => navigateTo('/accounts-categories')}
          >
            <Plus className="h-4 w-4" />
            Gerenciar Contas e Categorias
          </Button>
          <Button 
            className="flex items-center gap-2" 
            onClick={() => navigateTo('/calendar')}
          >
            <Calendar className="h-4 w-4" />
            Calendário Financeiro
          </Button>
          <Button 
            className="flex items-center gap-2" 
            onClick={() => navigateTo('/reports')}
          >
            <FilePlus className="h-4 w-4" />
            Gerar Relatórios
          </Button>
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

export default Dashboard;
