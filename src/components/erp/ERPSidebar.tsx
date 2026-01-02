import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  CheckSquare,
  Bell,
  Settings,
  LogOut,
  Mail,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

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
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Employees", icon: Users, path: "/admin/employees" },
  { label: "Interns", icon: GraduationCap, path: "/admin/interns" },
  { label: "Approvals", icon: CheckSquare, path: "/admin/approvals" },
  { label: "Job Postings", icon: Briefcase, path: "/admin/jobs" },
  { label: "Applications", icon: ClipboardList, path: "/admin/applications" },
  { label: "Internship Enquiries", icon: UserPlus, path: "/admin/internship-enquiries" },
  { label: "Messages", icon: Mail, path: "/admin/messages" },
];

const employeeNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard" },
  { label: "Add Intern", icon: UserPlus, path: "/employee/add-intern" },
  { label: "My Interns", icon: GraduationCap, path: "/employee/interns" },
  { label: "Tasks", icon: CheckSquare, path: "/employee/tasks" },
  { label: "Internship Postings", icon: Briefcase, path: "/employee/postings" },
];

const internNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/intern/dashboard" },
  { label: "My Tasks", icon: CheckSquare, path: "/intern/tasks" },
  { label: "Profile", icon: Settings, path: "/intern/profile" },
];

const ERPSidebar = ({ role, onLogout, unreadNotifications = 0 }: ERPSidebarProps) => {
  const location = useLocation();

  const navItems =
    role === "admin" ? adminNav : role === "employee" ? employeeNav : internNav;

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <p className="text-xs text-muted-foreground mt-2 capitalize">{role} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
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
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        <Link
          to={`/${role}/notifications`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            location.pathname.includes("notifications")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Bell className="w-5 h-5" />
          Notifications
          {unreadNotifications > 0 && (
            <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
              {unreadNotifications}
            </span>
          )}
        </Link>
      </nav>

      <div className="p-4 border-t border-border">
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
