import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Mail, Copy, Check, Briefcase } from "lucide-react";

// Generate a random password
const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate company email from name
const generateCompanyEmail = (name: string) => {
  const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[parts.length - 1]}@karmelinfotech.com`;
  }
  return `${parts[0]}@karmelinfotech.com`;
};

const departments = [
  "Engineering",
  "Design", 
  "Marketing",
  "Sales",
  "HR",
  "Operations",
  "Finance",
  "Management",
];

const positions = [
  "Software Engineer",
  "Senior Software Engineer",
  "Lead Developer",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "HR Manager",
  "Marketing Manager",
  "Sales Executive",
  "Operations Manager",
  "Team Lead",
  "Manager",
];

const AdminAddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    personal_email: "",
    phone: "",
    department: "",
    position: "",
  });
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Generate credentials
      const companyEmail = generateCompanyEmail(data.full_name);
      const tempPassword = generatePassword();

      // First add employee record
      const { data: employeeData, error: empError } = await supabase.from("employees").insert({
        full_name: data.full_name,
        email: companyEmail,
        personal_email: data.personal_email,
        phone: data.phone || null,
        department: data.department,
        position: data.position,
        user_id: userData.user.id, // Temporary, will be updated by edge function
        is_active: false, // Will be activated by edge function
      }).select().single();

      if (empError) throw empError;

      // Use edge function to create user and update employee
      const { data: result, error } = await supabase.functions.invoke("create-employee-user", {
        body: {
          employeeId: employeeData.id,
          fullName: data.full_name,
          personalEmail: data.personal_email,
          companyEmail,
          tempPassword,
          department: data.department,
          position: data.position,
          callerUserId: userData.user.id,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      return { companyEmail, tempPassword, employeeId: employeeData.id };
    },
    onSuccess: (result) => {
      setCreatedCredentials({ email: result.companyEmail, password: result.tempPassword });
      toast.success("Employee added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add employee: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.personal_email || !formData.department || !formData.position) {
      toast.error("Please fill all required fields");
      return;
    }
    addEmployeeMutation.mutate(formData);
  };

  const copyToClipboard = (text: string, type: "email" | "password") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddAnother = () => {
    setCreatedCredentials(null);
    setFormData({
      full_name: "",
      personal_email: "",
      phone: "",
      department: "",
      position: "",
    });
  };

  if (createdCredentials) {
    return (
      <ERPLayout requiredRole="admin">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/erp/admin/employees")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-green-600">Employee Added Successfully!</h1>
              <p className="text-muted-foreground">Share these credentials with the employee</p>
            </div>
          </div>

          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Login Credentials</CardTitle>
              <CardDescription>
                Email sent to {formData.personal_email}. Copy these for backup:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company Email</Label>
                <div className="flex gap-2">
                  <Input value={createdCredentials.email} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(createdCredentials.email, "email")}
                  >
                    {copied === "email" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="flex gap-2">
                  <Input value={createdCredentials.password} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(createdCredentials.password, "password")}
                  >
                    {copied === "password" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddAnother} className="flex-1">
                  Add Another Employee
                </Button>
                <Button variant="outline" onClick={() => navigate("/erp/admin/employees")} className="flex-1">
                  View All Employees
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ERPLayout>
    );
  }

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Employee</h1>
            <p className="text-muted-foreground">Company email and credentials will be auto-generated</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employee Details
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              A company email and password will be generated and sent to the employee's personal email.
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addEmployeeMutation.isPending}>
                  {addEmployeeMutation.isPending ? "Adding Employee..." : "Add Employee & Send Credentials"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
};

export default AdminAddEmployee;
