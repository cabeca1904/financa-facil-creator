
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginFormProps {
  onLogin: (user: { username: string; isLoggedIn: boolean }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para o cadastro
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para recuperação de senha
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [recoveryFullName, setRecoveryFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isRecoveryVerified, setIsRecoveryVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verificação para login normal
    if (!isRegistering && !isRecoveringPassword) {
      if (!username || !password) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Verificar se o usuário existe no localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.username === username);
      
      if (user && user.password === password) {
        setTimeout(() => {
          onLogin({ username, isLoggedIn: true });
          toast({
            title: "Login realizado",
            description: `Bem-vindo, ${username}!`,
          });
          setIsLoading(false);
        }, 1000);
      } else {
        setTimeout(() => {
          toast({
            title: "Erro",
            description: "Usuário ou senha incorretos. Tente novamente.",
            variant: "destructive",
          });
          setIsLoading(false);
        }, 1000);
      }
      return;
    }

    // Verificação para cadastro
    if (isRegistering) {
      if (!username || !password || !fullName || !confirmPassword) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Verificar se o usuário já existe
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some((user: any) => user.username === username)) {
        toast({
          title: "Erro",
          description: "Este nome de usuário já está em uso",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Salvar o novo usuário
      const newUser = { username, password, fullName };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      setTimeout(() => {
        toast({
          title: "Cadastro realizado",
          description: "Sua conta foi criada com sucesso!",
        });
        setIsLoading(false);
        setIsRegistering(false);
        resetFields();
      }, 1000);
      return;
    }

    // Verificação para recuperação de senha
    if (isRecoveringPassword) {
      if (!isRecoveryVerified) {
        if (!recoveryFullName) {
          toast({
            title: "Erro",
            description: "Por favor, informe seu nome completo",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Verificar se o nome completo existe
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: any) => u.fullName === recoveryFullName);
        
        if (user) {
          setIsRecoveryVerified(true);
          setUsername(user.username); // Preencher o username para facilitar a recuperação
          setIsLoading(false);
        } else {
          toast({
            title: "Erro",
            description: "Nome completo não encontrado",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      } else {
        if (!newPassword) {
          toast({
            title: "Erro",
            description: "Por favor, informe a nova senha",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Atualizar a senha do usuário
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map((u: any) => {
          if (u.fullName === recoveryFullName) {
            return { ...u, password: newPassword };
          }
          return u;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        setTimeout(() => {
          toast({
            title: "Senha alterada",
            description: "Sua senha foi alterada com sucesso!",
          });
          setIsLoading(false);
          setIsRecoveringPassword(false);
          setIsRecoveryVerified(false);
          resetFields();
        }, 1000);
      }
    }
  };

  const resetFields = () => {
    setUsername('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setRecoveryFullName('');
    setNewPassword('');
  };

  const switchToRegister = () => {
    setIsRegistering(true);
    setIsRecoveringPassword(false);
    setIsRecoveryVerified(false);
    resetFields();
  };

  const switchToLogin = () => {
    setIsRegistering(false);
    setIsRecoveringPassword(false);
    setIsRecoveryVerified(false);
    resetFields();
  };

  const switchToRecovery = () => {
    setIsRegistering(false);
    setIsRecoveringPassword(true);
    setIsRecoveryVerified(false);
    resetFields();
  };

  // Verifica se há usuários no localstorage, se não, cria o default
  React.useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      localStorage.setItem('users', JSON.stringify([
        { username: 'admin', password: '123456', fullName: 'Administrador' }
      ]));
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 p-2 rounded-full bg-primary/10">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">FinançaFácil</CardTitle>
          <CardDescription>
            {isRegistering ? 'Crie sua conta para acessar o painel financeiro' : 
             isRecoveringPassword ? 'Recupere sua senha para acessar sua conta' : 
             'Entre com suas credenciais para acessar seu painel financeiro'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input 
                  id="fullName" 
                  placeholder="Digite seu nome completo" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            {isRecoveringPassword && !isRecoveryVerified ? (
              <div className="space-y-2">
                <Label htmlFor="recoveryFullName">Nome Completo</Label>
                <Input 
                  id="recoveryFullName" 
                  placeholder="Digite seu nome completo para verificação" 
                  value={recoveryFullName}
                  onChange={(e) => setRecoveryFullName(e.target.value)}
                />
              </div>
            ) : isRecoveringPassword && isRecoveryVerified ? (
              <>
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <AlertDescription>
                    Verificação concluída! Defina sua nova senha abaixo.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input 
                    id="username" 
                    value={username}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="Digite sua nova senha" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input 
                  id="username" 
                  placeholder="Digite seu nome de usuário" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            )}

            {!isRecoveringPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {!isRegistering && (
                    <Button variant="link" size="sm" className="px-0 text-xs" type="button" onClick={switchToRecovery}>
                      Esqueceu a senha?
                    </Button>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Digite sua senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
                {!isRegistering && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Primeiro acesso? Use "admin" e senha "123456"
                  </p>
                )}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme a Senha</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirme sua senha" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRegistering ? 'Cadastrando...' : isRecoveringPassword ? (isRecoveryVerified ? 'Alterando senha...' : 'Verificando...') : 'Entrando...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isRegistering ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Cadastrar
                    </>
                  ) : isRecoveringPassword ? (
                    <>
                      <KeyRound className="h-4 w-4" />
                      {isRecoveryVerified ? 'Alterar Senha' : 'Verificar'}
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </>
                  )}
                </span>
              )}
            </Button>
            
            <div className="text-center w-full">
              {isRegistering || isRecoveringPassword ? (
                <Button variant="link" size="sm" type="button" onClick={switchToLogin} className="w-full mt-2">
                  Voltar para o login
                </Button>
              ) : (
                <Button variant="link" size="sm" type="button" onClick={switchToRegister} className="w-full mt-2">
                  Não tem uma conta? Cadastre-se
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
