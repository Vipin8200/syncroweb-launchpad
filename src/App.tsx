import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
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
import AdminAddEmployee from "./pages/erp/AdminAddEmployee";
import AdminApprovals from "./pages/erp/AdminApprovals";
import AdminInterns from "./pages/erp/AdminInterns";
import AdminAddIntern from "./pages/erp/AdminAddIntern";
import AdminTasks from "./pages/erp/AdminTasks";
import AdminInternshipPrograms from "./pages/erp/AdminInternshipPrograms";
import AdminJobPostings from "./pages/erp/AdminJobPostings";
import AdminApplications from "./pages/erp/AdminApplications";
import AdminMessages from "./pages/erp/AdminMessages";
import AdminInternshipEnquiries from "./pages/erp/AdminInternshipEnquiries";
import EmployeeDashboard from "./pages/erp/EmployeeDashboard";
import EmployeeAddIntern from "./pages/erp/EmployeeAddIntern";
import EmployeeInterns from "./pages/erp/EmployeeInterns";
import EmployeeTasks from "./pages/erp/EmployeeTasks";
import InternDashboard from "./pages/erp/InternDashboard";
import InternTasks from "./pages/erp/InternTasks";
import InternProfile from "./pages/erp/InternProfile";
import Notifications from "./pages/erp/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="syncroweb-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
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
              <Route path="/erp/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/erp/admin/employees" element={<AdminEmployees />} />
              <Route path="/erp/admin/add-employee" element={<AdminAddEmployee />} />
              <Route path="/erp/admin/approvals" element={<AdminApprovals />} />
              <Route path="/erp/admin/interns" element={<AdminInterns />} />
              <Route path="/erp/admin/add-intern" element={<AdminAddIntern />} />
              <Route path="/erp/admin/tasks" element={<AdminTasks />} />
              <Route path="/erp/admin/internship-programs" element={<AdminInternshipPrograms />} />
              <Route path="/erp/admin/jobs" element={<AdminJobPostings />} />
              <Route path="/erp/admin/applications" element={<AdminApplications />} />
              <Route path="/erp/admin/messages" element={<AdminMessages />} />
              <Route path="/erp/admin/internship-enquiries" element={<AdminInternshipEnquiries />} />
              <Route path="/erp/admin/notifications" element={<Notifications />} />

              {/* Employee ERP Routes */}
              <Route path="/erp/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/erp/employee/add-intern" element={<EmployeeAddIntern />} />
              <Route path="/erp/employee/interns" element={<EmployeeInterns />} />
              <Route path="/erp/employee/tasks" element={<EmployeeTasks />} />
              <Route path="/erp/employee/notifications" element={<Notifications />} />

              {/* Intern ERP Routes */}
              <Route path="/erp/intern/dashboard" element={<InternDashboard />} />
              <Route path="/erp/intern/tasks" element={<InternTasks />} />
              <Route path="/erp/intern/profile" element={<InternProfile />} />
              <Route path="/erp/intern/notifications" element={<Notifications />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
