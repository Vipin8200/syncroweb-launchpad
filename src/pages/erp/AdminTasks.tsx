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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, ClipboardList, Calendar, User, Users } from "lucide-react";
import { format } from "date-fns";

const AdminTasks = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assigneeType, setAssigneeType] = useState<"intern" | "employee">("intern");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    assigned_to_employee: "",
    due_date: "",
    priority: "medium",
  });

  const { data: interns } = useQuery({
    queryKey: ["active-interns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interns")
        .select("*")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: employees } = useQuery({
    queryKey: ["active-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["admin-all-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, interns(full_name), employees(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof formData & { assigneeType: "intern" | "employee" }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const taskData: any = {
        title: data.title,
        description: data.description,
        assigned_by: userData.user.id,
        due_date: data.due_date || null,
        priority: data.priority,
        status: "pending",
        assigned_to_type: data.assigneeType,
      };

      if (data.assigneeType === "intern") {
        taskData.assigned_to = data.assigned_to;
        taskData.assigned_to_employee = null;
      } else {
        taskData.assigned_to = null;
        taskData.assigned_to_employee = data.assigned_to_employee;
      }

      const { error } = await supabase.from("tasks").insert(taskData);
      if (error) throw error;

      // Send notification
      let userId: string | null = null;
      if (data.assigneeType === "intern") {
        const intern = interns?.find((i) => i.id === data.assigned_to);
        userId = intern?.user_id || null;
      } else {
        const employee = employees?.find((e) => e.id === data.assigned_to_employee);
        userId = employee?.user_id || null;
      }

      if (userId) {
        await supabase.from("notifications").insert({
          user_id: userId,
          title: "New Task Assigned",
          message: `You have been assigned a new task: ${data.title}`,
          type: "task",
        });
      }
    },
    onSuccess: () => {
      toast.success("Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-all-tasks"] });
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", assigned_to: "", assigned_to_employee: "", due_date: "", priority: "medium" });
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({ ...formData, assigneeType });
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
    const colors: Record<string, string> = {
      completed: "bg-green-500/10 text-green-600",
      in_progress: "bg-blue-500/10 text-blue-600",
      pending: "bg-orange-500/10 text-orange-600",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || "bg-gray-500/10 text-gray-600"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const getAssigneeName = (task: any) => {
    if (task.assigned_to_type === "employee" && task.employees) {
      return task.employees.full_name;
    }
    if (task.interns) {
      return task.interns.full_name;
    }
    return "Unknown";
  };

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Assign and track tasks for employees and interns</p>
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
                  <Label>Assign To</Label>
                  <Tabs value={assigneeType} onValueChange={(v) => setAssigneeType(v as "intern" | "employee")}>
                    <TabsList className="w-full">
                      <TabsTrigger value="intern" className="flex-1">
                        <User className="h-4 w-4 mr-2" />
                        Intern
                      </TabsTrigger>
                      <TabsTrigger value="employee" className="flex-1">
                        <Users className="h-4 w-4 mr-2" />
                        Employee
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="intern" className="mt-2">
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
                    </TabsContent>
                    <TabsContent value="employee" className="mt-2">
                      <Select
                        value={formData.assigned_to_employee}
                        onValueChange={(value) => setFormData({ ...formData, assigned_to_employee: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees?.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.full_name} - {employee.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TabsContent>
                  </Tabs>
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

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tasks?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
              <p className="text-muted-foreground mb-4">Create tasks for your team members.</p>
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
                    {task.assigned_to_type === "employee" ? (
                      <Users className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{getAssigneeName(task)}</span>
                    <Badge variant="outline" className="text-xs">
                      {task.assigned_to_type}
                    </Badge>
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

export default AdminTasks;
