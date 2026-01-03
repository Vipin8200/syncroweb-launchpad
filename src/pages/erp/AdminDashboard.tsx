import { useState, useEffect } from "react";
import { Users, GraduationCap, Briefcase, CheckSquare, Clock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import StatsCard from "@/components/erp/StatsCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalEmployees: number;
  totalInterns: number;
  pendingApprovals: number;
  activeInternships: number;
  completedInternships: number;
  unreadMessages: number;
}

const AdminDashboardNew = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalInterns: 0,
    pendingApprovals: 0,
    activeInternships: 0,
    completedInternships: 0,
    unreadMessages: 0,
  });
  const [recentInterns, setRecentInterns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch employee count
      const { count: employeeCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true });

      // Fetch intern stats
      const { data: interns } = await supabase.from("interns").select("*");

      const pendingApprovals = interns?.filter((i) => i.status === "pending_approval").length || 0;
      const activeInternships = interns?.filter((i) => i.status === "active").length || 0;
      const completedInternships = interns?.filter((i) => i.status === "completed").length || 0;

      // Fetch unread messages
      const { count: unreadCount } = await supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      // Fetch recent pending interns
      const { data: recent } = await supabase
        .from("interns")
        .select("*")
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalEmployees: employeeCount || 0,
        totalInterns: interns?.length || 0,
        pendingApprovals,
        activeInternships,
        completedInternships,
        unreadMessages: unreadCount || 0,
      });

      setRecentInterns(recent || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your organization</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
          />
          <StatsCard
            title="Total Interns"
            value={stats.totalInterns}
            icon={GraduationCap}
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            className={stats.pendingApprovals > 0 ? "border-yellow-500/50" : ""}
          />
          <StatsCard
            title="Active Internships"
            value={stats.activeInternships}
            icon={Briefcase}
          />
          <StatsCard
            title="Completed Internships"
            value={stats.completedInternships}
            icon={CheckSquare}
          />
          <StatsCard
            title="Unread Messages"
            value={stats.unreadMessages}
            icon={Mail}
            className={stats.unreadMessages > 0 ? "border-primary/50" : ""}
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start text-left">
                <Link to="/erp/admin/employees">
                  <Users className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Manage Employees</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start text-left">
                <Link to="/erp/admin/approvals">
                  <CheckSquare className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Review Approvals</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start text-left">
                <Link to="/erp/admin/jobs">
                  <Briefcase className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Job Postings</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start text-left">
                <Link to="/erp/admin/messages">
                  <Mail className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Messages</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/erp/admin/approvals">View All</Link>
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-secondary animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentInterns.length > 0 ? (
              <div className="space-y-3">
                {recentInterns.map((intern) => (
                  <div
                    key={intern.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{intern.full_name}</p>
                      <p className="text-sm text-muted-foreground">{intern.domain}</p>
                    </div>
                    <Button asChild size="sm">
                      <Link to="/erp/admin/approvals">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No pending approvals</p>
            )}
          </div>
        </div>
      </div>
    </ERPLayout>
  );
};

export default AdminDashboardNew;
