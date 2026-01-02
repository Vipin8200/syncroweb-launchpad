import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Process from "./pages/Process";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Internship from "./pages/Internship";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// ERP Pages
import AdminDashboard from "./pages/erp/AdminDashboard";
import AdminEmployees from "./pages/erp/AdminEmployees";
import AdminApprovals from "./pages/erp/AdminApprovals";
import AdminInterns from "./pages/erp/AdminInterns";
import EmployeeDashboard from "./pages/erp/EmployeeDashboard";
import InternDashboard from "./pages/erp/InternDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/process" element={<Process />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/internship" element={<Internship />} />
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin ERP Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/interns" element={<AdminInterns />} />

          {/* Employee ERP Routes */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

          {/* Intern ERP Routes */}
          <Route path="/intern/dashboard" element={<InternDashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
