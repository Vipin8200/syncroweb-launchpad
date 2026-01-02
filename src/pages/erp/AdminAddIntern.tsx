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
import { ArrowLeft, UserPlus, Mail } from "lucide-react";

// Generate a random password
const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate company email from name
const generateCompanyEmail = (name: string) => {
  const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[parts.length - 1]}@syncroweb.in`;
  }
  return `${parts[0]}@syncroweb.in`;
};

const AdminAddIntern = () => {
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
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

      // Generate credentials
      const companyEmail = generateCompanyEmail(data.full_name);
      const tempPassword = generatePassword();

      // Create auth user for intern
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: companyEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/intern/dashboard`,
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create intern account");

      // Add intern role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "intern",
      });

      if (roleError) {
        console.error("Role error:", roleError);
        // Continue anyway as the user is created
      }

      // Add intern record
      const { error: internError } = await supabase.from("interns").insert({
        full_name: data.full_name,
        personal_email: data.personal_email,
        phone: data.phone,
        domain: data.domain,
        duration: data.duration,
        college_name: data.college_name,
        course: data.course,
        added_by: userData.user.id,
        approved_by: userData.user.id,
        status: "approved",
        start_date: new Date().toISOString().split("T")[0],
        user_id: authData.user.id,
        company_email: companyEmail,
        temp_password: tempPassword,
      });

      if (internError) throw internError;

      // Send email with credentials
      setIsSendingEmail(true);
      try {
        const { error: emailError } = await supabase.functions.invoke("send-notification", {
          body: {
            type: "intern_approved",
            recipientEmail: data.personal_email,
            recipientName: data.full_name,
            data: {
              companyEmail,
              tempPassword,
              domain: data.domain,
            },
          },
        });

        if (emailError) {
          console.error("Email error:", emailError);
          toast.warning("Intern added but email failed to send. Credentials: " + companyEmail + " / " + tempPassword);
        } else {
          toast.success("Credentials sent to " + data.personal_email);
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        toast.warning("Intern added. Email failed. Credentials: " + companyEmail + " / " + tempPassword);
      }
      setIsSendingEmail(false);

      return { companyEmail, tempPassword };
    },
    onSuccess: (result) => {
      toast.success(`Intern added! Login: ${result.companyEmail}`);
      queryClient.invalidateQueries({ queryKey: ["interns"] });
      navigate("/admin/interns");
    },
    onError: (error) => {
      setIsSendingEmail(false);
      toast.error("Failed to add intern: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInternMutation.mutate(formData);
  };

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Intern</h1>
            <p className="text-muted-foreground">Auto-approved with credentials emailed</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Intern Details
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              A company email and password will be generated and sent to the intern's personal email.
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
                    placeholder="John Doe"
                    required
                  />
                  {formData.full_name && (
                    <p className="text-xs text-muted-foreground">
                      Company email: {generateCompanyEmail(formData.full_name)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal_email">Personal Email * (for credentials)</Label>
                  <Input
                    id="personal_email"
                    type="email"
                    value={formData.personal_email}
                    onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                    placeholder="john@gmail.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
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
                <Button type="submit" disabled={addInternMutation.isPending || isSendingEmail}>
                  {addInternMutation.isPending || isSendingEmail ? "Adding & Sending Email..." : "Add Intern & Send Credentials"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
};

export default AdminAddIntern;