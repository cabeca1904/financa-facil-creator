
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "../hooks/use-local-storage";
import { toast } from '@/components/ui/use-toast';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [clearedData, setClearedData] = useState(false);

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: 'Tema alterado',
      description: `Modo ${newValue ? 'escuro' : 'claro'} ativado.`
    });
  };

  // Clear all data from localStorage
  const handleClearData = () => {
    // Clear custom data storage
    const keysToPreserve = ['user', 'darkMode'];
    
    Object.keys(localStorage).forEach(key => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    setClearedData(true);
    
    toast({
      title: 'Dados limpos',
      description: 'Todos os dados foram removidos.'
    });
  };

  // Handle logout
  const handleLogout = () => {
    onLogout();
    
    toast({
      title: 'Sessão encerrada',
      description: 'Você saiu da sua conta.'
    });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold mb-6">Configurações</h2>
      
      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Personalize a aparência do aplicativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar tema escuro para o aplicativo
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleToggleDarkMode}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Dados</CardTitle>
            <CardDescription>Gerencie seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Todos os dados são armazenados localmente no seu navegador.
                Limpar os dados irá remover todas as informações do aplicativo.
              </p>
              <Button 
                variant="outline" 
                onClick={handleClearData}
                disabled={clearedData}
              >
                {clearedData ? 'Dados Limpos' : 'Limpar Todos os Dados'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Gerencie suas informações de conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
