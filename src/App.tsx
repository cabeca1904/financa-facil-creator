
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocalStorage } from "./hooks/use-local-storage";
import LoginForm from "./components/LoginForm";
import NavBar from "./components/NavBar";
import Index from "./pages/Index";
import AccountsCategories from "./pages/AccountsCategories";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // State for authentication
  const [user, setUser] = useLocalStorage("user", { username: "", isLoggedIn: false });
  
  // Initialize dark mode from localStorage on app load
  useEffect(() => {
    const darkMode = JSON.parse(localStorage.getItem("darkMode") || "false");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle login
  const handleLogin = (userData: { username: string; isLoggedIn: boolean }) => {
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    setUser({ username: "", isLoggedIn: false });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!user.isLoggedIn ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <>
              <NavBar onLogout={handleLogout} user={user} />
              <Routes>
                <Route path="/" element={<Index onLogout={handleLogout} user={user} />} />
                <Route path="/accounts-categories" element={<AccountsCategories />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings onLogout={handleLogout} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
