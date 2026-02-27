import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, ClipboardList, Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const EmployeeTasks = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
    priority: "medium",
  });

  const { data: interns } = useQuery({
    queryKey: ["approved-interns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interns")
        .select("*")
        .eq("status", "approved");
      if (error) throw error;
      return data;
    },
  });

  // Fetch employee record for current user
  const { data: employeeRecord } = useQuery({
    queryKey: ["current-employee-record"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", userData.user.id)
        .single();
      return data;
    },
  });

  // Tasks created by this employee (assigned to interns)
  const { data: createdTasks, isLoading: isLoadingCreated } = useQuery({
    queryKey: ["employee-created-tasks"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .select("*, interns(full_name)")
        .eq("assigned_by", userData.user.id)
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Tasks assigned TO this employee
  const { data: myTasks, isLoading: isLoadingMy } = useQuery({
    queryKey: ["employee-my-tasks", employeeRecord?.id],
    queryFn: async () => {
      if (!employeeRecord?.id) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to_employee", employeeRecord.id)
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeRecord?.id,
  });

  const isLoading = isLoadingCreated || isLoadingMy;
  const tasks = createdTasks;

  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("tasks").insert({
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        assigned_by: userData.user.id,
        due_date: data.due_date || null,
        priority: data.priority,
        status: "pending",
      });

      if (error) throw error;

      // Send notification to intern
      const intern = interns?.find((i) => i.id === data.assigned_to);
      if (intern?.user_id) {
        await supabase.from("notifications").insert({
          user_id: intern.user_id,
          title: "New Task Assigned",
          message: `You have been assigned a new task: ${data.title}`,
          type: "task",
          related_id: data.assigned_to,
        });
      }
    },
    onSuccess: () => {
      toast.success("Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ["employee-tasks"] });
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", assigned_to: "", due_date: "", priority: "medium" });
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority] || "secondary"}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      in_progress: "secondary",
      pending: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <ERPLayout allowedRoles={["employee", "admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Assign and track tasks for interns</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assign To *</Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select intern" />
                    </SelectTrigger>
                    <SelectContent>
                      {interns?.map((intern) => (
                        <SelectItem key={intern.id} value={intern.id}>
                          {intern.full_name} - {intern.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks Assigned TO Me */}
        {myTasks && myTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tasks Assigned to Me</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
                      {getPriorityBadge(task.priority)}
                    </div>
                    {getStatusBadge(task.status)}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due: {format(new Date(task.due_date), "PPP")}</span>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {task.status === "pending" && (
                        <Button size="sm" onClick={async () => {
                          await supabase.from("tasks").update({ status: "in_progress" }).eq("id", task.id);
                          queryClient.invalidateQueries({ queryKey: ["employee-my-tasks"] });
                          toast.success("Task started!");
                        }}>Start Task</Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button size="sm" onClick={async () => {
                          await supabase.from("tasks").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", task.id);
                          queryClient.invalidateQueries({ queryKey: ["employee-my-tasks"] });
                          toast.success("Task completed!");
                        }}>Mark Complete</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Created by Me (assigned to interns) */}
        <h2 className="text-lg font-semibold">Tasks I Assigned</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tasks?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
              <p className="text-muted-foreground mb-4">You haven't created any tasks yet.</p>
              <Button onClick={() => setIsDialogOpen(true)}>Create Your First Task</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks?.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
                    {getPriorityBadge(task.priority)}
                  </div>
                  {getStatusBadge(task.status)}
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{task.interns?.full_name || "Unknown"}</span>
                  </div>
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {format(new Date(task.due_date), "PPP")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default EmployeeTasks;