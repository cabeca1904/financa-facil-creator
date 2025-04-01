
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, isEqual, isSameMonth, isToday, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  Plus 
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@/components/ui/use-toast';

// Types for calendar
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'invoice' | 'other';
  recurrence: 'once' | 'weekly' | 'monthly';
  description?: string;
}

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendarEvents', []);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form state for new events
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    type: 'expense',
    recurrence: 'once',
    description: ''
  });

  // Calculate the dates with events for the current month
  const datesWithEvents = events.reduce((acc, event) => {
    const eventDate = new Date(event.date);
    if (isSameMonth(eventDate, date)) {
      const dateStr = format(eventDate, 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(event);
    }
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Handle month navigation
  const handlePreviousMonth = () => {
    setDate(subMonths(date, 1));
  };

  const handleNextMonth = () => {
    setDate(addMonths(date, 1));
  };

  // Handle day selection
  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      
      // Check if there are events on this day
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayEvents = datesWithEvents[dayStr];
      
      if (dayEvents && dayEvents.length === 1) {
        // If only one event, show it directly
        setSelectedEvent(dayEvents[0]);
        setIsViewEventDialogOpen(true);
      } else if (dayEvents && dayEvents.length > 1) {
        // If multiple events, we could show a list, but for now just show the first one
        setSelectedEvent(dayEvents[0]);
        setIsViewEventDialogOpen(true);
      } else {
        // If no events, show the add event dialog
        setNewEvent({
          ...newEvent,
          date: format(day, 'yyyy-MM-dd')
        });
        setIsAddEventDialogOpen(true);
      }
    }
  };

  // Handle event creation
  const handleCreateEvent = () => {
    const id = `event-${Date.now()}`;
    const event: CalendarEvent = {
      id,
      ...newEvent
    };
    
    setEvents([...events, event]);
    setIsAddEventDialogOpen(false);
    
    // Reset form
    setNewEvent({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      type: 'expense',
      recurrence: 'once',
      description: ''
    });
    
    toast({
      title: "Evento criado",
      description: "O evento foi adicionado ao calendário e às pendências."
    });
  };

  // Handle event deletion
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    setIsViewEventDialogOpen(false);
    
    toast({
      title: "Evento excluído",
      description: "O evento foi removido do calendário."
    });
  };

  // Handle event update
  const handleUpdateEvent = () => {
    if (selectedEvent) {
      setEvents(events.map(event => 
        event.id === selectedEvent.id ? selectedEvent : event
      ));
      setIsViewEventDialogOpen(false);
      
      toast({
        title: "Evento atualizado",
        description: "As alterações foram salvas."
      });
    }
  };

  // Get events for the selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return datesWithEvents[dateStr] || [];
  };

  // Get color for event type
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-500';
      case 'expense': return 'bg-red-500';
      case 'invoice': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Get icon for event type
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return <DollarSign className="h-4 w-4" />;
      case 'expense': return <AlertCircle className="h-4 w-4" />;
      case 'invoice': return <CreditCard className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Debug function to log events
  useEffect(() => {
    console.log("Current events:", events);
    console.log("Dates with events:", datesWithEvents);
  }, [events, datesWithEvents]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Calendário Financeiro</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(date, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-1 bg-background rounded-lg">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDaySelect}
                month={date}
                className="w-full pointer-events-auto"
                disabled={false}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              className="flex items-center gap-2" 
              onClick={() => {
                setNewEvent({
                  ...newEvent,
                  date: format(selectedDate || new Date(), 'yyyy-MM-dd')
                });
                setIsAddEventDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Adicionar Evento
            </Button>
          </CardFooter>
        </Card>
        
        {/* Events for selected date */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
                : "Selecione uma data"}
            </CardTitle>
            <CardDescription>
              Eventos programados para esta data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {getEventsForSelectedDate().length > 0 ? (
                <div className="space-y-4">
                  {getEventsForSelectedDate().map((event) => (
                    <div 
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsViewEventDialogOpen(true);
                      }}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors flex items-start gap-3"
                    >
                      <div className={`rounded-full p-2 ${getEventTypeColor(event.type)} text-white`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.recurrence === 'once' ? 'Uma vez' : 
                           event.recurrence === 'weekly' ? 'Semanal' : 'Mensal'}
                        </p>
                        {event.description && (
                          <p className="text-sm mt-1 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      <div className={`text-right font-medium ${
                        event.type === 'income' ? 'text-green-600' : 
                        event.type === 'expense' ? 'text-red-600' : 'text-purple-600'
                      }`}>
                        {(event.type === 'income' ? '+' : '') + 
                          event.amount.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <CalendarIcon className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>Nenhum evento para esta data</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setNewEvent({
                        ...newEvent,
                        date: format(selectedDate || new Date(), 'yyyy-MM-dd')
                      });
                      setIsAddEventDialogOpen(true);
                    }}
                  >
                    Adicionar evento
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Evento</DialogTitle>
            <DialogDescription>
              Adicione um novo evento financeiro ao calendário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                placeholder="Nome do evento"
                className="col-span-3"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0,00"
                className="col-span-3"
                value={newEvent.amount}
                onChange={(e) => setNewEvent({ ...newEvent, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select
                value={newEvent.type}
                onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}
              >
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recurrence" className="text-right">
                Recorrência
              </Label>
              <Select
                value={newEvent.recurrence}
                onValueChange={(value) => setNewEvent({ ...newEvent, recurrence: value as any })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a recorrência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Uma vez</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                placeholder="Descrição opcional"
                className="col-span-3"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateEvent} disabled={!newEvent.title || newEvent.amount <= 0}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View/Edit Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento</DialogTitle>
            <DialogDescription>
              Visualize ou edite este evento financeiro.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-title" className="text-right">
                  Título
                </Label>
                <Input
                  id="view-title"
                  className="col-span-3"
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-date" className="text-right">
                  Data
                </Label>
                <Input
                  id="view-date"
                  type="date"
                  className="col-span-3"
                  value={selectedEvent.date}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-amount" className="text-right">
                  Valor
                </Label>
                <Input
                  id="view-amount"
                  type="number"
                  className="col-span-3"
                  value={selectedEvent.amount}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-type" className="text-right">
                  Tipo
                </Label>
                <Select
                  value={selectedEvent.type}
                  onValueChange={(value) => setSelectedEvent({ ...selectedEvent, type: value as any })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="invoice">Fatura</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-recurrence" className="text-right">
                  Recorrência
                </Label>
                <Select
                  value={selectedEvent.recurrence}
                  onValueChange={(value) => setSelectedEvent({ ...selectedEvent, recurrence: value as any })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Uma vez</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="view-description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="view-description"
                  className="col-span-3"
                  value={selectedEvent.description || ''}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
            >
              Excluir
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsViewEventDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleUpdateEvent}>Salvar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
