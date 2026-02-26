import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Compliance from "./pages/Compliance";
import Staff from "./pages/Staff";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Finance from "./pages/Finance";

import { useEffect } from "react";
import { useAppStore } from "@/data/useAppStore";

import CalendarEvents from "./pages/Calendar";
import { ThemeProvider } from "@/components/theme-provider";
import IdleTimer from "./components/IdleTimer";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <IdleTimer>
      {children}
    </IdleTimer>
  );
};

const App = () => {
  const { checkAndGenerateMonthlyBills } = useAppStore();

  useEffect(() => {
    checkAndGenerateMonthlyBills();
  }, [checkAndGenerateMonthlyBills]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/calendar" element={<CalendarEvents />} />
                <Route path="/finance" element={<Finance />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
