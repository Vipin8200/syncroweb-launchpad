import { useState, useEffect } from "react";
import { GraduationCap, CheckSquare, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import StatsCard from "@/components/erp/StatsCard";
import PasswordChangeModal from "@/components/erp/PasswordChangeModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({ myInterns: 0, activeTasks: 0, pendingTasks: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Employee password enforcement (first login or admin reset)
      const { data: employee } = await supabase
        .from("employees")
        .select("password_changed, password_reset_required")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const requiresPasswordChange = !!employee && (!employee.password_changed || employee.password_reset_required);
      setIsFirstLogin(!!employee && !employee.password_changed);
      setShowPasswordModal(requiresPasswordChange);

      const { data: interns } = await supabase
        .from("interns")
        .select("id")
        .eq("added_by", session.user.id);

      const { data: tasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("assigned_by", session.user.id);

      setStats({
        myInterns: interns?.length || 0,
        activeTasks: tasks?.filter((t) => t.status === "in_progress").length || 0,
        pendingTasks: tasks?.filter((t) => t.status === "pending").length || 0,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeSuccess = async () => {
    // Re-fetch DB flags; modal will close only when flags say it's completed.
    await fetchStats();
  };

  return (
    <ERPLayout requiredRole="employee">
      <PasswordChangeModal
        isOpen={showPasswordModal}
        isFirstLogin={isFirstLogin}
        completeFunctionName="complete-employee-password-change"
        onSuccess={handlePasswordChangeSuccess}
      />

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Employee Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="My Interns" value={stats.myInterns} icon={GraduationCap} />
          <StatsCard title="Active Tasks" value={stats.activeTasks} icon={CheckSquare} />
          <StatsCard title="Pending Tasks" value={stats.pendingTasks} icon={CheckSquare} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="sm:w-auto">
            <Link to="/erp/employee/add-intern">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Intern
            </Link>
          </Button>
          <Button asChild variant="outline" className="sm:w-auto">
            <Link to="/erp/employee/tasks">Manage Tasks</Link>
          </Button>
        </div>
      </div>
    </ERPLayout>
  );
};

export default EmployeeDashboard;
