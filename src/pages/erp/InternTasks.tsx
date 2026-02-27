import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ClipboardList, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const InternTasks = () => {
  const queryClient = useQueryClient();

  const { data: internData } = useQuery({
    queryKey: ["current-intern"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const { data, error } = await supabase
        .from("interns")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();
      if (error) return null;
      return data;
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["intern-tasks", internData?.id],
    queryFn: async () => {
      if (!internData?.id) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", internData.id)
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!internData?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, title }: { id: string; status: string; title: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("assigned_by")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase.from("tasks").update(updates).eq("id", id);
      if (error) throw error;

      // Notify the assigner about the status update
      if (task?.assigned_by) {
        const statusText = status === "completed" ? "completed" : "started working on";
        await supabase.from("notifications").insert({
          user_id: task.assigned_by,
          title: status === "completed" ? "Task Completed" : "Task Started",
          message: `${internData?.full_name || "An intern"} has ${statusText} the task: ${title}`,
          type: status === "completed" ? "success" : "info",
          related_id: id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intern-tasks"] });
      toast.success("Task status updated!");
    },
    onError: (error) => {
      toast.error("Failed to update task: " + error.message);
    },
  });

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority] || "secondary"}>{priority}</Badge>;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "text-green-600",
      in_progress: "text-yellow-600",
      pending: "text-muted-foreground",
    };
    return colors[status] || "text-muted-foreground";
  };

  const pendingTasks = tasks?.filter((t) => t.status === "pending") || [];
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress") || [];
  const completedTasks = tasks?.filter((t) => t.status === "completed") || [];

  const TaskCard = ({ task }: { task: (typeof tasks)[0] }) => (
    <Card key={task.id}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{task.title}</CardTitle>
          {getPriorityBadge(task.priority)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Due: {format(new Date(task.due_date), "PPP")}</span>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {task.status === "pending" && (
            <Button
              size="sm"
              onClick={() => updateStatusMutation.mutate({ id: task.id, status: "in_progress", title: task.title })}
            >
              Start Task
            </Button>
          )}
          {task.status === "in_progress" && (
            <Button
              size="sm"
              onClick={() => updateStatusMutation.mutate({ id: task.id, status: "completed", title: task.title })}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
          {task.status === "completed" && task.completed_at && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed {format(new Date(task.completed_at), "PPP")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ERPLayout allowedRoles={["intern"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">View and manage your assigned tasks</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tasks?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tasks Assigned</h3>
              <p className="text-muted-foreground">You don't have any tasks yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {inProgressTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  In Progress ({inProgressTasks.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {pendingTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Pending ({pendingTasks.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Completed ({completedTasks.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default InternTasks;