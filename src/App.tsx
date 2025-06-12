
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BulkPayments from "./pages/BulkPayments";
import Collections from "./pages/Collections";
import Organizations from "./pages/Organizations";
import SubAdmins from "./pages/SubAdmins";
import Settings from "./pages/Settings";
import PettyCash from "./pages/PettyCash";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bulk-payments" element={<BulkPayments />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/sub-admins" element={<SubAdmins />} />
          <Route path="/petty-cash" element={<PettyCash />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
