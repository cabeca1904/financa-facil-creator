
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  PieChart, 
  LineChart, 
  Settings, 
  FilePlus, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
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
  type: 'income' | 'expense' | 'invoice' | 'other';
  recurrence: 'once' | 'weekly' | 'monthly';
  description?: string;
}

interface PendingItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  type: 'bill' | 'income' | 'goal';
  isPaid: boolean;
  isOverdue: boolean;
}

interface UserData {
  username: string;
  isLoggedIn: boolean;
}

// Props for the Dashboard
interface DashboardProps {
  onLogout: () => void;
  user: UserData;
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

const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  // State management with localStorage persistence
  const [accounts, setAccounts] = useLocalStorage('accounts', initialAccounts);
  const [categories, setCategories] = useLocalStorage('categories', initialCategories);
  const [transactions, setTransactions] = useLocalStorage('transactions', initialTransactions);
  const [calendarEvents, setCalendarEvents] = useLocalStorage('calendarEvents', initialCalendarEvents);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  
  const navigate = useNavigate();

  // Convert calendar events to pending items
  React.useEffect(() => {
    console.log("Calendar events in Index:", calendarEvents);
    
    // Generate pending items from calendar events
    const eventsAsPendingItems = calendarEvents.map(event => {
      const today = new Date();
      const eventDate = new Date(event.date);
      const isOverdue = eventDate < today && !isPastEvent(event);
      
      // Map event type to PendingItem type
      let pendingItemType: 'bill' | 'income' | 'goal';
      if (event.type === 'income') {
        pendingItemType = 'income';
      } else if (event.type === 'invoice' || event.type === 'expense') {
        pendingItemType = 'bill';
      } else {
        pendingItemType = 'goal'; // Default for 'other' type
      }
      
      return {
        id: event.id,
        title: event.title,
        amount: event.amount,
        dueDate: event.date,
        type: pendingItemType,
        isPaid: isPastEvent(event),
        isOverdue: isOverdue
      };
    });
    
    setPendingItems(eventsAsPendingItems);
    console.log("Generated pending items:", eventsAsPendingItems);
  }, [calendarEvents]);

  // Helper function to determine if an event is in the past
  const isPastEvent = (event: CalendarEvent) => {
    const today = new Date();
    const eventDate = new Date(event.date);
    
    // For recurring events, check if the event has occurred this month
    if (event.recurrence === 'monthly') {
      return eventDate.getDate() < today.getDate() && 
             eventDate.getMonth() <= today.getMonth() && 
             eventDate.getFullYear() <= today.getFullYear();
    }
    
    // For weekly events, check if the event has occurred this week
    if (event.recurrence === 'weekly') {
      const daysDiff = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff % 7 < today.getDay();
    }
    
    // For one-time events, simply check if the date is in the past
    return eventDate < today;
  };

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

  // Mark pending item as paid
  const markAsPaid = (id: string) => {
    setPendingItems(pendingItems.map(item => 
      item.id === id ? { ...item, isPaid: true } : item
    ));
    
    showNotification("Item marcado como pago");
  };

  // Handle navigation
  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Show a notification
  const showNotification = (message: string) => {
    toast({
      title: "FinançaFácil",
      description: message,
    });
  };

  // For debugging
  React.useEffect(() => {
    console.log("Pending items updated:", pendingItems);
  }, [pendingItems]);

  return (
    <div className="min-h-screen bg-background text-foreground">
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

        {/* Charts and pending items */}
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

          {/* Pending items - Now shows calendar events */}
          <Card>
            <CardHeader>
              <CardTitle>Pendências</CardTitle>
              <CardDescription>Eventos e contas do calendário</CardDescription>
            </CardHeader>
            <CardContent className="h-80 overflow-y-auto">
              <div className="space-y-4">
                {pendingItems.length > 0 ? (
                  pendingItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`border p-4 rounded-lg ${
                        item.isPaid ? 'border-green-200 bg-green-50 dark:bg-green-900/20' :
                        item.isOverdue ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 
                        'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            {item.type === 'bill' ? (
                              <AlertCircle className={`h-4 w-4 ${item.isPaid ? 'text-green-500' : item.isOverdue ? 'text-red-500' : 'text-orange-500'}`} />
                            ) : item.type === 'income' ? (
                              <DollarSign className={`h-4 w-4 ${item.isPaid ? 'text-green-500' : 'text-blue-500'}`} />
                            ) : (
                              <AlertCircle className={`h-4 w-4 ${item.isPaid ? 'text-green-500' : 'text-purple-500'}`} />
                            )}
                            <h4 className="font-medium">{item.title}</h4>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Vencimento: {new Date(item.dueDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`font-medium ${
                            item.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(item.type === 'income' ? '+' : '-') + 
                              item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            }
                          </span>
                          {!item.isPaid && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 mt-1"
                              onClick={() => markAsPaid(item.id)}
                            >
                              Marcar como pago
                            </Button>
                          )}
                        </div>
                      </div>
                      {item.isPaid && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Pago</span>
                        </div>
                      )}
                      {item.isOverdue && !item.isPaid && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>Atrasado</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <AlertCircle className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>Nenhuma pendência no momento</p>
                  </div>
                )}
              </div>
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
    </div>
  );
};

export default Dashboard;
