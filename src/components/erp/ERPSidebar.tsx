import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  CheckSquare,
  Settings,
  LogOut,
  Mail,
  UserPlus,
  ClipboardList,
  MessageCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface ERPSidebarProps {
  role: "admin" | "employee" | "intern";
  onLogout: () => void;
  unreadNotifications?: number;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/erp/admin/dashboard" },
  { label: "Profile", icon: User, path: "/erp/admin/profile" },
  { label: "Employees", icon: Users, path: "/erp/admin/employees" },
  { label: "Interns", icon: GraduationCap, path: "/erp/admin/interns" },
  { label: "Tasks", icon: ClipboardList, path: "/erp/admin/tasks" },
  { label: "Approvals", icon: CheckSquare, path: "/erp/admin/approvals" },
  { label: "Team Chat", icon: MessageCircle, path: "/erp/admin/chat" },
  { label: "Internship Programs", icon: Briefcase, path: "/erp/admin/internship-programs" },
  { label: "Job Postings", icon: Briefcase, path: "/erp/admin/jobs" },
  { label: "Applications", icon: ClipboardList, path: "/erp/admin/applications" },
  { label: "Internship Enquiries", icon: Mail, path: "/erp/admin/internship-enquiries" },
];

const employeeNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/erp/employee/dashboard" },
  { label: "Add Intern", icon: UserPlus, path: "/erp/employee/add-intern" },
  { label: "My Interns", icon: GraduationCap, path: "/erp/employee/interns" },
  { label: "Tasks", icon: CheckSquare, path: "/erp/employee/tasks" },
  { label: "Team Chat", icon: MessageCircle, path: "/erp/employee/chat" },
];

const internNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/erp/intern/dashboard" },
  { label: "My Tasks", icon: CheckSquare, path: "/erp/intern/tasks" },
  { label: "Team Chat", icon: MessageCircle, path: "/erp/intern/chat" },
  { label: "Profile", icon: Settings, path: "/erp/intern/profile" },
];

const ERPSidebar = ({ role, onLogout, unreadNotifications = 0 }: ERPSidebarProps) => {
  const location = useLocation();

  const navItems =
    role === "admin" ? adminNav : role === "employee" ? employeeNav : internNav;

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <p className="text-xs text-muted-foreground mt-2 capitalize">{role} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default ERPSidebar;
