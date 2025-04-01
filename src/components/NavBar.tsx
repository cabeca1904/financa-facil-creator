
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MenuIcon,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useLocalStorage } from '../hooks/use-local-storage';
import { 
  NavigationMenu, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  navigationMenuTriggerStyle 
} from "@/components/ui/navigation-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavBarProps {
  onLogout: () => void;
  user: {
    username: string;
    isLoggedIn: boolean;
  };
}

const NavBar: React.FC<NavBarProps> = ({ onLogout, user }) => {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <header className="border-b p-4 bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between md:flex-row">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="p-0" onClick={() => navigateTo('/')}>
            <span className="text-xl font-bold">FinançaFácil</span>
          </Button>
        </div>

        {/* Desktop Navigation - Always centered */}
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

        {/* User account dropdown */}
        <div className="hidden md:flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="mr-2"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 hover:bg-accent transition-colors focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">{user.username}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigateTo('/settings')}>
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
            
            <div className="px-4 py-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{user.username}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            <button 
              className="text-left px-4 py-2 hover:bg-accent rounded-md text-destructive"
              onClick={onLogout}
            >
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
