import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, FileText, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const InternDailyProgress = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    progress_date: new Date().toISOString().split("T")[0],
    section_worked: "",
    work_done: "",
    status: "completed",
  });

  const { data: internData } = useQuery({
    queryKey: ["current-intern-progress"],
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

  const { data: progressEntries, isLoading } = useQuery({
    queryKey: ["intern-daily-progress", internData?.id],
    queryFn: async () => {
      if (!internData?.id) return [];
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      const { data, error } = await supabase
        .from("intern_daily_progress")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("progress_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!internData?.id,
  });

  const addProgressMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !internData?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("intern_daily_progress").insert({
        intern_id: internData.id,
        user_id: userData.user.id,
        progress_date: data.progress_date,
        section_worked: data.section_worked,
        work_done: data.work_done,
        status: data.status,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You already have an entry for this date. Please edit the existing one.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Daily progress added!");
      queryClient.invalidateQueries({ queryKey: ["intern-daily-progress"] });
      setIsDialogOpen(false);
      setFormData({
        progress_date: new Date().toISOString().split("T")[0],
        section_worked: "",
        work_done: "",
        status: "completed",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.section_worked.trim() || !formData.work_done.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    addProgressMutation.mutate(formData);
  };

  return (
    <ERPLayout allowedRoles={["intern"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Daily Progress</h1>
            <p className="text-muted-foreground">Log your daily work and progress</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Today's Progress
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log Daily Progress</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="progress_date">Date</Label>
                  <Input
                    id="progress_date"
                    type="date"
                    value={formData.progress_date}
                    onChange={(e) => setFormData({ ...formData, progress_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section_worked">Section / Module Worked On *</Label>
                  <Input
                    id="section_worked"
                    placeholder="e.g., Frontend Dashboard, API Integration"
                    value={formData.section_worked}
                    onChange={(e) => setFormData({ ...formData, section_worked: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_done">Work Done / Details *</Label>
                  <Textarea
                    id="work_done"
                    placeholder="Describe what you worked on today, progress made, challenges faced..."
                    value={formData.work_done}
                    onChange={(e) => setFormData({ ...formData, work_done: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addProgressMutation.isPending}>
                    {addProgressMutation.isPending ? "Saving..." : "Save Progress"}
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
        ) : progressEntries?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Progress Entries Yet</h3>
              <p className="text-muted-foreground mb-4">Start logging your daily work progress.</p>
              <Button onClick={() => setIsDialogOpen(true)}>Log Your First Entry</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {progressEntries?.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(entry.progress_date), "EEEE, dd MMMM yyyy")}
                    </CardTitle>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {entry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Section: {entry.section_worked}</p>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.work_done}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default InternDailyProgress;
