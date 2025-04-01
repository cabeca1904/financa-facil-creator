
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useLocalStorage } from "../hooks/use-local-storage";
import { Edit2, Trash2, Plus, DollarSign, CreditCard, Wallet, Building, Tag } from "lucide-react";

// Types for accounts and categories
type TransactionType = 'income' | 'expense';
type AccountType = 'bank' | 'cash' | 'credit';

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

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  accountId: string;
}

const AccountsCategories: React.FC = () => {
  // State for accounts and categories
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  
  // State for new account
  const [newAccount, setNewAccount] = useState<Omit<Account, 'id'>>({
    name: '',
    balance: 0,
    type: 'bank',
    color: '#3B82F6'
  });
  
  // State for new category
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({
    name: '',
    color: '#10B981',
    type: 'expense',
    budget: 0
  });
  
  // State for editing
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Get account icon based on type
  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Building className="h-6 w-6" />;
      case 'cash':
        return <Wallet className="h-6 w-6" />;
      case 'credit':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <DollarSign className="h-6 w-6" />;
    }
  };

  // Handle account creation
  const handleCreateAccount = () => {
    const id = `account-${Date.now()}`;
    const account: Account = {
      id,
      ...newAccount
    };
    
    setAccounts([...accounts, account]);
    setIsAccountDialogOpen(false);
    
    // Reset form
    setNewAccount({
      name: '',
      balance: 0,
      type: 'bank',
      color: '#3B82F6'
    });
    
    toast({
      title: "Conta criada",
      description: "A conta foi adicionada com sucesso."
    });
  };

  // Handle account update
  const handleUpdateAccount = () => {
    if (editingAccount) {
      setAccounts(accounts.map(account => 
        account.id === editingAccount.id ? editingAccount : account
      ));
      setIsAccountDialogOpen(false);
      
      toast({
        title: "Conta atualizada",
        description: "As alterações foram salvas."
      });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (accountToDelete) {
      // Check if account is used in transactions
      const isUsed = transactions.some(transaction => transaction.accountId === accountToDelete.id);
      
      if (isUsed) {
        toast({
          title: "Não é possível excluir",
          description: "Esta conta está sendo usada em transações.",
          variant: "destructive"
        });
      } else {
        setAccounts(accounts.filter(account => account.id !== accountToDelete.id));
        setIsDeleteAccountDialogOpen(false);
        
        toast({
          title: "Conta excluída",
          description: "A conta foi removida com sucesso."
        });
      }
    }
  };

  // Handle category creation
  const handleCreateCategory = () => {
    const id = `category-${Date.now()}`;
    const category: Category = {
      id,
      ...newCategory
    };
    
    setCategories([...categories, category]);
    setIsCategoryDialogOpen(false);
    
    // Reset form
    setNewCategory({
      name: '',
      color: '#10B981',
      type: 'expense',
      budget: 0
    });
    
    toast({
      title: "Categoria criada",
      description: "A categoria foi adicionada com sucesso."
    });
  };

  // Handle category update
  const handleUpdateCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(category => 
        category.id === editingCategory.id ? editingCategory : category
      ));
      setIsCategoryDialogOpen(false);
      
      // Update transactions with this category to match the new expense/income type
      if (transactions.some(t => t.category === editingCategory.id && t.type !== editingCategory.type)) {
        const updatedTransactions = transactions.map(transaction => 
          transaction.category === editingCategory.id ? 
            { ...transaction, type: editingCategory.type } : 
            transaction
        );
        setTransactions(updatedTransactions);
      }
      
      toast({
        title: "Categoria atualizada",
        description: "As alterações foram salvas."
      });
    }
  };

  // Handle category deletion
  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      // Check if category is used in transactions
      const isUsed = transactions.some(transaction => transaction.category === categoryToDelete.id);
      
      if (isUsed) {
        toast({
          title: "Não é possível excluir",
          description: "Esta categoria está sendo usada em transações.",
          variant: "destructive"
        });
      } else {
        setCategories(categories.filter(category => category.id !== categoryToDelete.id));
        setIsDeleteCategoryDialogOpen(false);
        
        toast({
          title: "Categoria excluída",
          description: "A categoria foi removida com sucesso."
        });
      }
    }
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Contas e Categorias</h1>
      
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>
        
        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Suas Contas</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setEditingAccount(null);
                  setIsAccountDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Conta
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Saldo Total</CardTitle>
                <CardDescription>Soma de todas as suas contas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className="overflow-hidden">
                <div className="h-2" style={{ backgroundColor: account.color }} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-md"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        {getAccountIcon(account.type)}
                      </div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    {account.type === 'bank' ? 'Conta Bancária' : 
                     account.type === 'cash' ? 'Dinheiro em Espécie' : 'Cartão de Crédito'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`text-xl font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {account.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingAccount(account);
                      setIsAccountDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setAccountToDelete(account);
                      setIsDeleteAccountDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {accounts.length === 0 && (
              <Card className="col-span-full p-8 flex flex-col items-center justify-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-4">
                  Você ainda não possui contas cadastradas.
                </p>
                <Button 
                  onClick={() => {
                    setEditingAccount(null);
                    setIsAccountDialogOpen(true);
                  }}
                >
                  Adicionar Conta
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Suas Categorias</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="expense" className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Despesas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="expense">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {categories.filter(cat => cat.type === 'expense').map((category) => (
                  <Card key={category.id} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: category.color }} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          >
                            <Tag className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {category.budget ? (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Orçamento</p>
                          <p className="text-lg font-semibold">
                            {(category.budget || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum orçamento definido</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsCategoryDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setCategoryToDelete(category);
                          setIsDeleteCategoryDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {categories.filter(cat => cat.type === 'expense').length === 0 && (
                  <Card className="col-span-full p-8 flex flex-col items-center justify-center">
                    <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground mb-4">
                      Você ainda não possui categorias de despesa cadastradas.
                    </p>
                    <Button 
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategory({...newCategory, type: 'expense'});
                        setIsCategoryDialogOpen(true);
                      }}
                    >
                      Adicionar Categoria
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="income">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {categories.filter(cat => cat.type === 'income').map((category) => (
                  <Card key={category.id} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: category.color }} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          >
                            <Tag className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {category.budget ? (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Valor Esperado</p>
                          <p className="text-lg font-semibold text-green-600">
                            {(category.budget || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum valor definido</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsCategoryDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setCategoryToDelete(category);
                          setIsDeleteCategoryDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {categories.filter(cat => cat.type === 'income').length === 0 && (
                  <Card className="col-span-full p-8 flex flex-col items-center justify-center">
                    <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground mb-4">
                      Você ainda não possui categorias de receita cadastradas.
                    </p>
                    <Button 
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategory({...newCategory, type: 'income'});
                        setIsCategoryDialogOpen(true);
                      }}
                    >
                      Adicionar Categoria
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      
      {/* Account Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Modifique os detalhes da conta.' : 'Adicione uma nova conta ao seu controle financeiro.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">
                Nome
              </Label>
              <Input
                id="account-name"
                placeholder="Minha Conta"
                className="col-span-3"
                value={editingAccount ? editingAccount.name : newAccount.name}
                onChange={(e) => editingAccount 
                  ? setEditingAccount({ ...editingAccount, name: e.target.value })
                  : setNewAccount({ ...newAccount, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-balance" className="text-right">
                Saldo
              </Label>
              <Input
                id="account-balance"
                type="number"
                placeholder="0.00"
                className="col-span-3"
                value={editingAccount ? editingAccount.balance : newAccount.balance}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  editingAccount 
                    ? setEditingAccount({ ...editingAccount, balance: value })
                    : setNewAccount({ ...newAccount, balance: value });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-type" className="text-right">
                Tipo
              </Label>
              <Select
                value={editingAccount ? editingAccount.type : newAccount.type}
                onValueChange={(value) => {
                  const accountType = value as AccountType;
                  editingAccount 
                    ? setEditingAccount({ ...editingAccount, type: accountType })
                    : setNewAccount({ ...newAccount, type: accountType });
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Conta Bancária</SelectItem>
                  <SelectItem value="cash">Dinheiro em Espécie</SelectItem>
                  <SelectItem value="credit">Cartão de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-color" className="text-right">
                Cor
              </Label>
              <div className="col-span-3 flex gap-2 items-center">
                <Input
                  id="account-color"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={editingAccount ? editingAccount.color : newAccount.color}
                  onChange={(e) => editingAccount 
                    ? setEditingAccount({ ...editingAccount, color: e.target.value })
                    : setNewAccount({ ...newAccount, color: e.target.value })
                  }
                />
                <span className="text-muted-foreground text-sm">
                  Escolha uma cor para identificar esta conta
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={editingAccount ? handleUpdateAccount : handleCreateAccount}
              disabled={!editingAccount && (!newAccount.name || newAccount.name.trim() === '')}
            >
              {editingAccount ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Modifique os detalhes da categoria.' : 'Adicione uma nova categoria ao seu controle financeiro.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Nome
              </Label>
              <Input
                id="category-name"
                placeholder="Minha Categoria"
                className="col-span-3"
                value={editingCategory ? editingCategory.name : newCategory.name}
                onChange={(e) => editingCategory 
                  ? setEditingCategory({ ...editingCategory, name: e.target.value })
                  : setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-type" className="text-right">
                Tipo
              </Label>
              <Select
                value={editingCategory ? editingCategory.type : newCategory.type}
                onValueChange={(value) => {
                  const categoryType = value as TransactionType;
                  editingCategory 
                    ? setEditingCategory({ ...editingCategory, type: categoryType })
                    : setNewCategory({ ...newCategory, type: categoryType });
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-budget" className="text-right">
                {(editingCategory ? editingCategory.type : newCategory.type) === 'income' ? 'Valor Esperado' : 'Orçamento'}
              </Label>
              <Input
                id="category-budget"
                type="number"
                placeholder="0.00"
                className="col-span-3"
                value={editingCategory ? (editingCategory.budget || 0) : (newCategory.budget || 0)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  editingCategory 
                    ? setEditingCategory({ ...editingCategory, budget: value })
                    : setNewCategory({ ...newCategory, budget: value });
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-color" className="text-right">
                Cor
              </Label>
              <div className="col-span-3 flex gap-2 items-center">
                <Input
                  id="category-color"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={editingCategory ? editingCategory.color : newCategory.color}
                  onChange={(e) => editingCategory 
                    ? setEditingCategory({ ...editingCategory, color: e.target.value })
                    : setNewCategory({ ...newCategory, color: e.target.value })
                  }
                />
                <span className="text-muted-foreground text-sm">
                  Escolha uma cor para identificar esta categoria
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              disabled={!editingCategory && (!newCategory.name || newCategory.name.trim() === '')}
            >
              {editingCategory ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a conta "{accountToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAccountDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Category Confirmation Dialog */}
      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCategoryDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountsCategories;
