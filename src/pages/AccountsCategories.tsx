
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash, 
  Edit, 
  Save, 
  ArrowLeft, 
  Circle,
  Home as HomeIcon,
  CreditCard,
  Wallet,
  DollarSign,
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Types
type TransactionType = 'income' | 'expense';
type AccountType = 'bank' | 'cash' | 'credit';

interface Account {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
  color: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
  budget?: number;
}

// Initial data from localStorage or defaults
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

// Color options for categories and accounts
const colorOptions = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Amarelo', value: '#F59E0B' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Cinza', value: '#6B7280' },
  { name: 'Turquesa', value: '#06B6D4' },
];

const AccountsCategories = () => {
  const navigate = useNavigate();
  
  // State management
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [accounts, setAccounts] = useLocalStorage('accounts', initialAccounts);
  const [categories, setCategories] = useLocalStorage('categories', initialCategories);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Edit states
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // New account state
  const [newAccount, setNewAccount] = useState<Omit<Account, 'id'>>({
    name: '',
    balance: 0,
    type: 'bank',
    color: '#3B82F6',
  });
  
  // New category state
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({
    name: '',
    color: '#3B82F6',
    type: 'expense',
    budget: 0,
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

  // Handle account form changes
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (editingAccount) {
      setEditingAccount({
        ...editingAccount,
        [name]: name === 'balance' ? parseFloat(value) || 0 : value,
      });
    } else {
      setNewAccount({
        ...newAccount,
        [name]: name === 'balance' ? parseFloat(value) || 0 : value,
      });
    }
  };

  // Handle category form changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        [name]: name === 'budget' ? parseFloat(value) || 0 : value,
      });
    } else {
      setNewCategory({
        ...newCategory,
        [name]: name === 'budget' ? parseFloat(value) || 0 : value,
      });
    }
  };

  // Add new account
  const addAccount = () => {
    if (!newAccount.name) {
      showNotification("Por favor, insira um nome para a conta");
      return;
    }

    const newId = (Math.max(...accounts.map(a => parseInt(a.id)), 0) + 1).toString();
    const accountToAdd = { ...newAccount, id: newId };
    
    setAccounts([...accounts, accountToAdd]);
    setNewAccount({
      name: '',
      balance: 0,
      type: 'bank',
      color: '#3B82F6',
    });
    
    showNotification("Conta adicionada com sucesso");
  };

  // Add new category
  const addCategory = () => {
    if (!newCategory.name) {
      showNotification("Por favor, insira um nome para a categoria");
      return;
    }

    const newId = (Math.max(...categories.map(c => parseInt(c.id)), 0) + 1).toString();
    const categoryToAdd = { ...newCategory, id: newId };
    
    setCategories([...categories, categoryToAdd]);
    setNewCategory({
      name: '',
      color: '#3B82F6',
      type: 'expense',
      budget: 0,
    });
    
    showNotification("Categoria adicionada com sucesso");
  };

  // Delete account
  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(account => account.id !== id));
    showNotification("Conta removida com sucesso");
  };

  // Delete category
  const deleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
    showNotification("Categoria removida com sucesso");
  };

  // Save edited account
  const saveAccount = () => {
    if (!editingAccount) return;
    
    setAccounts(accounts.map(account => 
      account.id === editingAccount.id ? editingAccount : account
    ));
    
    setEditingAccount(null);
    showNotification("Conta atualizada com sucesso");
  };

  // Save edited category
  const saveCategory = () => {
    if (!editingCategory) return;
    
    setCategories(categories.map(category => 
      category.id === editingCategory.id ? editingCategory : category
    ));
    
    setEditingCategory(null);
    showNotification("Categoria atualizada com sucesso");
  };

  // Get icon for account type
  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <HomeIcon size={18} />;
      case 'cash':
        return <Wallet size={18} />;
      case 'credit':
        return <CreditCard size={18} />;
      default:
        return <DollarSign size={18} />;
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
          <h2 className="text-2xl font-bold">Contas e Categorias</h2>
        </div>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Nova Conta</CardTitle>
                  <CardDescription>
                    Crie uma nova conta bancária, carteira ou cartão de crédito
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome da Conta</Label>
                      <Input 
                        id="name" 
                        name="name"
                        placeholder="Ex: Nubank, Carteira, etc." 
                        value={newAccount.name}
                        onChange={handleAccountChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="balance">Saldo Inicial</Label>
                      <Input 
                        id="balance" 
                        name="balance"
                        type="number" 
                        placeholder="0.00" 
                        value={newAccount.balance}
                        onChange={handleAccountChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select 
                        defaultValue={newAccount.type}
                        onValueChange={(value) => setNewAccount({...newAccount, type: value as AccountType})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Conta Bancária</SelectItem>
                          <SelectItem value="cash">Dinheiro em Espécie</SelectItem>
                          <SelectItem value="credit">Cartão de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="color">Cor</Label>
                      <Select 
                        defaultValue={newAccount.color}
                        onValueChange={(value) => setNewAccount({...newAccount, color: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição (opcional)</Label>
                      <Input 
                        id="description" 
                        name="description"
                        placeholder="Descrição ou notas sobre esta conta" 
                        value={newAccount.description || ''}
                        onChange={handleAccountChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={addAccount}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Conta
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Minhas Contas</CardTitle>
                  <CardDescription>
                    Gerencie suas contas e saldos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        Nenhuma conta adicionada ainda.
                      </p>
                    ) : (
                      accounts.map(account => (
                        <div 
                          key={account.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 cursor-pointer"
                          onClick={() => setEditingAccount(account)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: account.color }}
                            >
                              {getAccountIcon(account.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{account.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {account.type === 'bank' ? 'Conta Bancária' : 
                                 account.type === 'cash' ? 'Dinheiro em Espécie' : 
                                 'Cartão de Crédito'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {account.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Account Dialog */}
            {editingAccount && (
              <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Conta</DialogTitle>
                    <DialogDescription>
                      Atualize os detalhes da sua conta
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Nome da Conta</Label>
                      <Input 
                        id="edit-name" 
                        name="name"
                        value={editingAccount.name}
                        onChange={handleAccountChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-balance">Saldo</Label>
                      <Input 
                        id="edit-balance" 
                        name="balance"
                        type="number" 
                        value={editingAccount.balance}
                        onChange={handleAccountChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-type">Tipo</Label>
                      <Select 
                        value={editingAccount.type}
                        onValueChange={(value) => setEditingAccount({
                          ...editingAccount, 
                          type: value as AccountType
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Conta Bancária</SelectItem>
                          <SelectItem value="cash">Dinheiro em Espécie</SelectItem>
                          <SelectItem value="credit">Cartão de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-color">Cor</Label>
                      <Select 
                        value={editingAccount.color}
                        onValueChange={(value) => setEditingAccount({
                          ...editingAccount, 
                          color: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Descrição (opcional)</Label>
                      <Input 
                        id="edit-description" 
                        name="description"
                        value={editingAccount.description || ''}
                        onChange={handleAccountChange}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        deleteAccount(editingAccount.id);
                        setEditingAccount(null);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                    <Button onClick={saveAccount}>
                      <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Nova Categoria</CardTitle>
                  <CardDescription>
                    Crie uma nova categoria para suas transações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cat-name">Nome da Categoria</Label>
                      <Input 
                        id="cat-name" 
                        name="name"
                        placeholder="Ex: Alimentação, Transporte, etc." 
                        value={newCategory.name}
                        onChange={handleCategoryChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cat-type">Tipo</Label>
                      <Select 
                        defaultValue={newCategory.type}
                        onValueChange={(value) => setNewCategory({
                          ...newCategory, 
                          type: value as TransactionType
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cat-color">Cor</Label>
                      <Select 
                        defaultValue={newCategory.color}
                        onValueChange={(value) => setNewCategory({...newCategory, color: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cat-budget">Orçamento (opcional)</Label>
                      <Input 
                        id="cat-budget" 
                        name="budget"
                        type="number" 
                        placeholder="0.00" 
                        value={newCategory.budget || ''}
                        onChange={handleCategoryChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={addCategory}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Categoria
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Minhas Categorias</CardTitle>
                  <CardDescription>
                    Gerencie suas categorias e orçamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        Nenhuma categoria adicionada ainda.
                      </p>
                    ) : (
                      categories.map(category => (
                        <div 
                          key={category.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 cursor-pointer"
                          onClick={() => setEditingCategory(category)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {category.type === 'income' ? 'Receita' : 'Despesa'}
                              </p>
                            </div>
                          </div>
                          {category.budget ? (
                            <div className="text-right">
                              <p className="font-medium">
                                Orçamento: {category.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            </div>
                          ) : (
                            <div className="text-right text-sm text-muted-foreground">
                              Sem orçamento definido
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Category Dialog */}
            {editingCategory && (
              <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Categoria</DialogTitle>
                    <DialogDescription>
                      Atualize os detalhes da sua categoria
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-cat-name">Nome da Categoria</Label>
                      <Input 
                        id="edit-cat-name" 
                        name="name"
                        value={editingCategory.name}
                        onChange={handleCategoryChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-cat-type">Tipo</Label>
                      <Select 
                        value={editingCategory.type}
                        onValueChange={(value) => setEditingCategory({
                          ...editingCategory, 
                          type: value as TransactionType
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-cat-color">Cor</Label>
                      <Select 
                        value={editingCategory.color}
                        onValueChange={(value) => setEditingCategory({
                          ...editingCategory, 
                          color: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-cat-budget">Orçamento</Label>
                      <Input 
                        id="edit-cat-budget" 
                        name="budget"
                        type="number" 
                        value={editingCategory.budget || ''}
                        onChange={handleCategoryChange}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        deleteCategory(editingCategory.id);
                        setEditingCategory(null);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                    <Button onClick={saveCategory}>
                      <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
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

export default AccountsCategories;
