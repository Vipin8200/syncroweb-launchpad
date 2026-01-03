import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ERPSidebar from "./ERPSidebar";
import { Button } from "@/components/ui/button";

type AppRole = "admin" | "employee" | "intern";

interface ERPLayoutProps {
  children: ReactNode;
  requiredRole?: AppRole;
  allowedRoles?: AppRole[];
}

const ERPLayout = ({ children, requiredRole, allowedRoles }: ERPLayoutProps) => {
  const navigate = useNavigate();
  const { session, userRole, userName, isLoading, signOut } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check role access on mount and when auth state changes
  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      navigate("/admin", { replace: true });
      return;
    }

    if (!userRole) {
      signOut();
      navigate("/admin", { replace: true });
      return;
    }

    // Check if user has required role
    const rolesAllowed = allowedRoles || (requiredRole ? [requiredRole] : []);
    
    if (rolesAllowed.length > 0 && !rolesAllowed.includes(userRole)) {
      // Redirect to correct dashboard
      if (userRole === "admin") navigate("/erp/admin/dashboard", { replace: true });
      else if (userRole === "employee") navigate("/erp/employee/dashboard", { replace: true });
      else if (userRole === "intern") navigate("/erp/intern/dashboard", { replace: true });
      return;
    }

    fetchNotifications();
  }, [isLoading, session, userRole]);

  useEffect(() => {
    // Refetch notifications when navigating between pages
    if (session && userRole) {
      fetchNotifications();
    }
  }, [session, userRole]);

  const fetchNotifications = async () => {
    if (session) {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      setUnreadNotifications(count || 0);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  // Show loading only on initial auth load, not on page navigations
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or no role, don't render (useEffect will redirect)
  if (!session || !userRole) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <ERPSidebar
          role={userRole}
          onLogout={handleLogout}
          unreadNotifications={unreadNotifications}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden lg:block">
            <h2 className="font-semibold text-foreground">Welcome, {userName}</h2>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate(`/erp/${userRole}/notifications`)}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default ERPLayout;
