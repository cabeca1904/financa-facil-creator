
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
import { Edit2, Trash2, Plus, DollarSign, CreditCard, Wallet, Building } from "lucide-react";

// Types for accounts
type TransactionType = 'expense';
type AccountType = 'bank' | 'cash' | 'credit';

interface Account {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
  color: string;
  closeDate?: string; // For credit card billing cycle date
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  accountId: string;
}

const AccountsCategories: React.FC = () => {
  // State for accounts
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  
  // State for new account
  const [newAccount, setNewAccount] = useState<Omit<Account, 'id'>>({
    name: '',
    balance: 0,
    type: 'bank',
    color: '#3B82F6'
  });
  
  // State for editing
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

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

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Contas</h1>
      
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
              {account.type === 'credit' && account.closeDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  Fechamento: {new Date(account.closeDate).toLocaleDateString('pt-BR')}
                </p>
              )}
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
            {(editingAccount?.type === 'credit' || newAccount.type === 'credit') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="close-date" className="text-right">
                  Data de Fechamento
                </Label>
                <Input
                  id="close-date"
                  type="date"
                  className="col-span-3"
                  value={editingAccount?.closeDate || ''}
                  onChange={(e) => editingAccount
                    ? setEditingAccount({ ...editingAccount, closeDate: e.target.value })
                    : setNewAccount({ ...newAccount, closeDate: e.target.value })
                  }
                />
              </div>
            )}
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
    </div>
  );
};

export default AccountsCategories;
