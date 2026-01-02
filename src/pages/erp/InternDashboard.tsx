import { useState, useEffect } from "react";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import StatsCard from "@/components/erp/StatsCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const InternDashboard = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [internInfo, setInternInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: intern } = await supabase
        .from("interns")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (intern) {
        setInternInfo(intern);
        const { data: taskData } = await supabase
          .from("tasks")
          .select("*")
          .eq("assigned_to", intern.id)
          .order("created_at", { ascending: false });
        setTasks(taskData || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null })
        .eq("id", taskId);
      if (error) throw error;
      toast({ title: "Task updated" });
      fetchData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const stats = {
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <ERPLayout requiredRole="intern">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {internInfo?.full_name}</h1>
          <p className="text-muted-foreground">{internInfo?.domain} Internship</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Pending" value={stats.pending} icon={Clock} />
          <StatsCard title="In Progress" value={stats.inProgress} icon={AlertCircle} />
          <StatsCard title="Completed" value={stats.completed} icon={CheckSquare} />
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tasks assigned yet</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="bg-background border border-border rounded px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ERPLayout>
  );
};

export default InternDashboard;
