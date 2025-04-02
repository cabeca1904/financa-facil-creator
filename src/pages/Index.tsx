
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  PieChart, 
  Settings, 
  FilePlus, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard
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
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';
import { 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip, 
  Legend 
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator } from "@/components/Calculator";

// Types for our application
type TransactionType = 'expense';
type AccountType = 'bank' | 'cash' | 'credit';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  accountId: string;
  type: TransactionType;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
  color: string;
  closeDate?: string; // Date for credit card billing cycle close
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'expense' | 'invoice' | 'other';
  recurrence: 'once' | 'weekly' | 'monthly';
  description?: string;
}

interface PendingItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  type: 'bill' | 'goal';
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
  { id: '3', name: 'Cartão de Crédito', balance: -1500, type: 'credit', color: '#EF4444', closeDate: '2023-12-25' },
];

const initialTransactions: Transaction[] = [
  {
    id: '2',
    description: 'Supermercado',
    amount: 350,
    date: '2023-12-10',
    type: 'expense',
    accountId: '1',
  },
  {
    id: '3',
    description: 'Gasolina',
    amount: 200,
    date: '2023-12-12',
    type: 'expense',
    accountId: '2',
  },
  {
    id: '4',
    description: 'Aluguel',
    amount: 1200,
    date: '2023-12-15',
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
  const [transactions, setTransactions] = useLocalStorage('transactions', initialTransactions);
  const [calendarEvents, setCalendarEvents] = useLocalStorage('calendarEvents', initialCalendarEvents);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  
  const navigate = useNavigate();

  // Convert calendar events to pending items with exact dates
  useEffect(() => {
    console.log("Calendar events in Index:", calendarEvents);
    
    // Generate pending items from calendar events
    const eventsAsPendingItems = calendarEvents.map(event => {
      const today = new Date();
      const eventDate = new Date(event.date);
      const isOverdue = eventDate < today && !isPastEvent(event);
      
      // Map event type to PendingItem type
      let pendingItemType: 'bill' | 'goal';
      if (event.type === 'invoice' || event.type === 'expense') {
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

  // Calculate total balance and expenses
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  const totalExpenses = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Calculate total pending expenses
  const totalPendingExpenses = pendingItems
    .filter(item => !item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);

  // Prepare data for credit card usage chart
  const creditCardUsageData = accounts
    .filter(account => account.type === 'credit')
    .map(account => {
      const totalUsage = transactions
        .filter(transaction => transaction.accountId === account.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      return {
        name: account.name,
        usage: Math.abs(totalUsage),
        limit: Math.abs(account.balance),
        color: account.color,
        closeDate: account.closeDate || 'N/A'
      };
    });

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>

        {/* Financial summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <CardTitle className="text-lg">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {totalPendingExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and pending items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Credit Card Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Uso de Cartão de Crédito</CardTitle>
              <CardDescription>Faturas e datas de fechamento</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {creditCardUsageData.length > 0 ? (
                <ChartContainer
                  config={{
                    usage: { label: "Utilizado", color: "#EF4444" },
                    limit: { label: "Limite", color: "#3B82F6" },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={creditCardUsageData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [
                          value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                          'Valor'
                        ]}
                        labelFormatter={(label) => {
                          const card = creditCardUsageData.find(card => card.name === label);
                          return `${label} - Fecha em: ${card?.closeDate}`;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="usage" name="Utilizado" fill="#EF4444" />
                      <Bar dataKey="limit" name="Limite" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground mb-4">
                    Você não possui cartões de crédito cadastrados.
                  </p>
                  <Button 
                    onClick={() => navigateTo('/accounts-categories')}
                  >
                    Adicionar Cartão
                  </Button>
                </div>
              )}
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
                          <span className="font-medium text-red-600">
                            {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
            Gerenciar Contas
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

      {/* Calculator Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="fixed bottom-4 right-4 rounded-full p-3"
            aria-label="Calculadora"
          >
            <span className="sr-only">Calculadora</span>
            <img src="/calculator-icon.svg" alt="Calculadora" className="w-6 h-6" onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>';
            }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <Calculator />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Dashboard;
