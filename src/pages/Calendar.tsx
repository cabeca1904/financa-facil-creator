
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash, 
  Edit, 
  Save, 
  ArrowLeft, 
  Search,
  DollarSign,
  X,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
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

// Types
type TransactionType = 'income' | 'expense';
type EventType = TransactionType | 'invoice' | 'other';
type RecurrenceType = 'once' | 'weekly' | 'monthly';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: EventType;
  recurrence: RecurrenceType;
  description?: string;
}

// Initial data
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

const FinancialCalendar = () => {
  const navigate = useNavigate();
  
  // State management
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [calendarEvents, setCalendarEvents] = useLocalStorage('calendarEvents', initialCalendarEvents);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  
  // New event state
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'expense',
    recurrence: 'once',
    description: ''
  });
  
  // Edit state
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  
  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toISOString().split('T')[0] === dateString;
    });
  };
  
  // Get filtered events based on search query
  const getFilteredEvents = () => {
    if (!searchQuery.trim()) {
      return calendarEvents;
    }
    
    const query = searchQuery.toLowerCase();
    return calendarEvents.filter(event => 
      event.title.toLowerCase().includes(query) || 
      event.description?.toLowerCase().includes(query) ||
      event.amount.toString().includes(query) ||
      event.type.toLowerCase().includes(query)
    );
  };
  
  // Get color for event type
  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'income':
        return 'bg-green-500';
      case 'expense':
        return 'bg-red-500';
      case 'invoice':
        return 'bg-purple-500';
      case 'other':
        return 'bg-gray-500';
    }
  };
  
  // Get text for event type
  const getEventTypeText = (type: EventType) => {
    switch (type) {
      case 'income':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      case 'invoice':
        return 'Fatura';
      case 'other':
        return 'Outro';
    }
  };
  
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
  
  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setNewEvent({
        ...newEvent,
        date: date.toISOString().split('T')[0]
      });
      setShowDialog(true);
    }
  };
  
  // Add new event
  const addEvent = () => {
    if (!newEvent.title) {
      showNotification("Por favor, insira um título para o evento");
      return;
    }
    
    const newId = (Math.max(...calendarEvents.map(e => parseInt(e.id)), 0) + 1).toString();
    const eventToAdd = { ...newEvent, id: newId };
    
    setCalendarEvents([...calendarEvents, eventToAdd]);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: 'expense',
      recurrence: 'once',
      description: ''
    });
    
    setShowDialog(false);
    showNotification("Evento adicionado com sucesso");
  };
  
  // Update event
  const updateEvent = () => {
    if (!editingEvent) return;
    
    setCalendarEvents(calendarEvents.map(event => 
      event.id === editingEvent.id ? editingEvent : event
    ));
    
    setEditingEvent(null);
    showNotification("Evento atualizado com sucesso");
  };
  
  // Delete event
  const deleteEvent = (id: string) => {
    setCalendarEvents(calendarEvents.filter(event => event.id !== id));
    setEditingEvent(null);
    showNotification("Evento removido com sucesso");
  };
  
  // Handle event form changes
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (editingEvent) {
      setEditingEvent({
        ...editingEvent,
        [name]: name === 'amount' ? parseFloat(value) || 0 : value,
      });
    } else {
      setNewEvent({
        ...newEvent,
        [name]: name === 'amount' ? parseFloat(value) || 0 : value,
      });
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
          <h2 className="text-2xl font-bold">Calendário Financeiro</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>
                Gerencie suas contas a pagar e receber, faturas e outros eventos financeiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:justify-center gap-6">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-3">
                    {date ? date.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Selecione uma data'}
                  </h3>
                  
                  {date && (
                    <>
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Eventos para esta data:</h4>
                        {getEventsForDate(date).length > 0 ? (
                          <div className="space-y-2">
                            {getEventsForDate(date).map(event => (
                              <div 
                                key={event.id} 
                                className="p-3 border rounded-lg hover:bg-accent/30 cursor-pointer"
                                onClick={() => setEditingEvent(event)}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${getEventColor(event.type)}`} />
                                  <h5 className="font-medium">{event.title}</h5>
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    {getEventTypeText(event.type)}
                                  </span>
                                  <span className={`text-sm font-medium ${
                                    event.type === 'income' ? 'text-green-600' : 
                                    event.type === 'expense' || event.type === 'invoice' ? 'text-red-600' :
                                    'text-muted-foreground'
                                  }`}>
                                    {event.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                </div>
                                {event.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            Nenhum evento para esta data.
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setNewEvent({
                            ...newEvent,
                            date: date.toISOString().split('T')[0]
                          });
                          setShowDialog(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Evento
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Todos os Eventos</CardTitle>
              <CardDescription>
                Busque e gerencie todos os seus eventos financeiros
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {getFilteredEvents().length > 0 ? (
                  getFilteredEvents().map(event => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-lg hover:bg-accent/30 cursor-pointer"
                      onClick={() => setEditingEvent(event)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getEventColor(event.type)}`} />
                        <h5 className="font-medium">{event.title}</h5>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('pt-BR')} • {getEventTypeText(event.type)}
                        </span>
                        <span className={`text-sm font-medium ${
                          event.type === 'income' ? 'text-green-600' : 
                          event.type === 'expense' || event.type === 'invoice' ? 'text-red-600' :
                          'text-muted-foreground'
                        }`}>
                          {event.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    {searchQuery ? "Nenhum evento encontrado." : "Nenhum evento cadastrado."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Event Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Evento Financeiro</DialogTitle>
            <DialogDescription>
              Adicione um novo evento ao seu calendário financeiro
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                name="title"
                placeholder="Ex: Pagamento de Aluguel" 
                value={newEvent.title}
                onChange={handleEventChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEvent.date ? new Date(newEvent.date).toLocaleDateString('pt-BR') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(newEvent.date)}
                    onSelect={(date) => date && setNewEvent({
                      ...newEvent,
                      date: date.toISOString().split('T')[0]
                    })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Valor</Label>
              <Input 
                id="amount" 
                name="amount"
                type="number" 
                placeholder="0.00" 
                value={newEvent.amount}
                onChange={handleEventChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                defaultValue={newEvent.type}
                onValueChange={(value) => setNewEvent({...newEvent, type: value as EventType})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="invoice">Fatura</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="recurrence">Recorrência</Label>
              <Select 
                defaultValue={newEvent.recurrence}
                onValueChange={(value) => setNewEvent({...newEvent, recurrence: value as RecurrenceType})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a recorrência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Única vez</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input 
                id="description" 
                name="description"
                placeholder="Descrição ou notas sobre este evento" 
                value={newEvent.description || ''}
                onChange={handleEventChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addEvent}>
              Adicionar Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
              <DialogDescription>
                Atualize os detalhes do seu evento financeiro
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input 
                  id="edit-title" 
                  name="title"
                  value={editingEvent.title}
                  onChange={handleEventChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-date">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingEvent.date ? new Date(editingEvent.date).toLocaleDateString('pt-BR') : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(editingEvent.date)}
                      onSelect={(date) => date && setEditingEvent({
                        ...editingEvent,
                        date: date.toISOString().split('T')[0]
                      })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Valor</Label>
                <Input 
                  id="edit-amount" 
                  name="amount"
                  type="number" 
                  value={editingEvent.amount}
                  onChange={handleEventChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select 
                  value={editingEvent.type}
                  onValueChange={(value) => setEditingEvent({
                    ...editingEvent, 
                    type: value as EventType
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="invoice">Fatura</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-recurrence">Recorrência</Label>
                <Select 
                  value={editingEvent.recurrence}
                  onValueChange={(value) => setEditingEvent({
                    ...editingEvent, 
                    recurrence: value as RecurrenceType
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a recorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Única vez</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descrição (opcional)</Label>
                <Input 
                  id="edit-description" 
                  name="description"
                  value={editingEvent.description || ''}
                  onChange={handleEventChange}
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={() => deleteEvent(editingEvent.id)}
              >
                <Trash className="mr-2 h-4 w-4" /> Excluir
              </Button>
              <Button onClick={updateEvent}>
                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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

export default FinancialCalendar;
