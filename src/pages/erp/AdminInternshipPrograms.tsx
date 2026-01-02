import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InternshipProgram {
  id: string;
  title: string;
  department: string;
  description: string;
  duration: string;
  stipend: string | null;
  requirements: string[];
  what_you_learn: string[];
  is_active: boolean;
  created_at: string;
}

const AdminInternshipPrograms = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<InternshipProgram | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    duration: "",
    stipend: "",
    requirements: "",
    what_you_learn: "",
    is_active: true,
  });

  const { data: programs, isLoading } = useQuery({
    queryKey: ["internship-programs-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_programs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InternshipProgram[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("internship_programs").insert({
        title: data.title,
        department: data.department,
        description: data.description,
        duration: data.duration,
        stipend: data.stipend || null,
        requirements: data.requirements.split("\n").filter(Boolean),
        what_you_learn: data.what_you_learn.split("\n").filter(Boolean),
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Internship program created successfully!");
      queryClient.invalidateQueries({ queryKey: ["internship-programs-admin"] });
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create program: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("internship_programs")
        .update({
          title: data.title,
          department: data.department,
          description: data.description,
          duration: data.duration,
          stipend: data.stipend || null,
          requirements: data.requirements.split("\n").filter(Boolean),
          what_you_learn: data.what_you_learn.split("\n").filter(Boolean),
          is_active: data.is_active,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Internship program updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["internship-programs-admin"] });
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update program: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("internship_programs")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Internship program deleted!");
      queryClient.invalidateQueries({ queryKey: ["internship-programs-admin"] });
    },
    onError: (error) => {
      toast.error("Failed to delete program: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      department: "",
      description: "",
      duration: "",
      stipend: "",
      requirements: "",
      what_you_learn: "",
      is_active: true,
    });
    setEditingProgram(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (program: InternshipProgram) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      department: program.department,
      description: program.description,
      duration: program.duration,
      stipend: program.stipend || "",
      requirements: program.requirements.join("\n"),
      what_you_learn: program.what_you_learn.join("\n"),
      is_active: program.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("internship_programs")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Program ${currentStatus ? "deactivated" : "activated"}`);
      queryClient.invalidateQueries({ queryKey: ["internship-programs-admin"] });
    }
  };

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Internship Programs</h1>
            <p className="text-muted-foreground">Manage internship opportunities</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProgram ? "Edit" : "Add"} Internship Program</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Web Development Intern"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 month">1 Month</SelectItem>
                        <SelectItem value="2 months">2 Months</SelectItem>
                        <SelectItem value="3 months">3 Months</SelectItem>
                        <SelectItem value="6 months">6 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stipend (Optional)</Label>
                    <Input
                      value={formData.stipend}
                      onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                      placeholder="₹5000/month or Unpaid"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the internship program..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Requirements (one per line)</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Basic knowledge of HTML/CSS&#10;Good communication skills&#10;..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>What You'll Learn (one per line)</Label>
                  <Textarea
                    value={formData.what_you_learn}
                    onChange={(e) => setFormData({ ...formData, what_you_learn: e.target.value })}
                    placeholder="React.js development&#10;Team collaboration&#10;..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active (visible on website)</Label>
                </div>

                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingProgram ? "Update" : "Create"} Program
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Programs List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="text-muted-foreground col-span-full text-center py-8">Loading...</p>
          ) : programs?.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No internship programs yet. Create your first one!
            </p>
          ) : (
            programs?.map((program) => (
              <Card key={program.id} className={!program.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{program.title}</CardTitle>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        program.is_active
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {program.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Department:</strong> {program.department}</p>
                    <p><strong>Duration:</strong> {program.duration}</p>
                    {program.stipend && <p><strong>Stipend:</strong> {program.stipend}</p>}
                  </div>
                  <p className="text-sm line-clamp-2">{program.description}</p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(program)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleStatus(program.id, program.is_active)}
                    >
                      {program.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(program.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ERPLayout>
  );
};

export default AdminInternshipPrograms;