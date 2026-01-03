import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, UserPlus } from "lucide-react";

const EmployeeAddIntern = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: "",
    personal_email: "",
    phone: "",
    domain: "",
    duration: "",
    college_name: "",
    course: "",
  });

  const { data: internshipPrograms } = useQuery({
    queryKey: ["internship-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_programs")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const addInternMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("interns").insert({
        full_name: data.full_name,
        personal_email: data.personal_email,
        phone: data.phone,
        domain: data.domain,
        duration: data.duration,
        college_name: data.college_name,
        course: data.course,
        added_by: userData.user.id,
        status: "pending_approval",
      });

      if (error) throw error;

      // Notify all admins about the new intern submission
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (admins && admins.length > 0) {
        const notifications = admins.map((admin) => ({
          user_id: admin.user_id,
          title: "New Intern Pending Approval",
          message: `${data.full_name} has been submitted for ${data.domain} internship and requires your approval.`,
          type: "warning",
        }));

        await supabase.from("notifications").insert(notifications);
      }
    },
    onSuccess: () => {
      toast.success("Intern added successfully! Pending admin approval.");
      queryClient.invalidateQueries({ queryKey: ["interns"] });
      navigate("/erp/employee/dashboard");
    },
    onError: (error) => {
      toast.error("Failed to add intern: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInternMutation.mutate(formData);
  };

  return (
    <ERPLayout allowedRoles={["employee", "admin"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Intern</h1>
            <p className="text-muted-foreground">Submit intern details for admin approval</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Intern Details
            </CardTitle>
            <CardDescription>
              Fill in the intern's information. The intern will be pending approval until an admin reviews.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal_email">Personal Email *</Label>
                  <Input
                    id="personal_email"
                    type="email"
                    value={formData.personal_email}
                    onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain / Department *</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={(value) => setFormData({ ...formData, domain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {internshipPrograms?.map((program) => (
                        <SelectItem key={program.id} value={program.department}>
                          {program.department} - {program.title}
                        </SelectItem>
                      ))}
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
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
                  <Label htmlFor="college_name">College Name</Label>
                  <Input
                    id="college_name"
                    value={formData.college_name}
                    onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addInternMutation.isPending}>
                  {addInternMutation.isPending ? "Submitting..." : "Submit for Approval"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
};

export default EmployeeAddIntern;