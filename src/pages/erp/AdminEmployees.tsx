import { useState, useEffect } from "react";
import { UserPlus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  position: string;
  phone: string | null;
  join_date: string;
  is_active: boolean;
}

const AdminEmployees = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    department: "",
    position: "",
    phone: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.full_name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.position.toLowerCase().includes(query)
      );
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((emp) => emp.is_active === isActive);
    }

    setFilteredEmployees(filtered);
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/employee/dashboard`,
          data: {
            full_name: formData.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Add employee role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "employee",
      });

      if (roleError) throw roleError;

      // Add employee record
      const { error: empError } = await supabase.from("employees").insert({
        user_id: authData.user.id,
        full_name: formData.full_name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        phone: formData.phone || null,
      });

      if (empError) throw empError;

      toast({ title: "Employee added successfully" });
      setIsDialogOpen(false);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        department: "",
        position: "",
        phone: "",
      });
      fetchEmployees();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleEmployeeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchEmployees();
      toast({ title: `Employee ${currentStatus ? "deactivated" : "activated"}` });
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground">Manage your team members</p>
        </div>
          
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@syncroweb.in"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <Label>Department</Label>
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
                <div>
                  <Label>Position</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label>Phone (Optional)</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <Button onClick={handleAddEmployee} className="w-full">
                  Add Employee
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Employees List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {employees.length === 0 
                ? "No employees found. Add your first employee."
                : "No employees match your filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Department
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Position
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-t border-border">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{employee.full_name}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">{employee.email}</td>
                      <td className="p-4 text-muted-foreground">{employee.department}</td>
                      <td className="p-4 text-muted-foreground">{employee.position}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            employee.is_active
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {employee.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEmployeeStatus(employee.id, employee.is_active)}
                        >
                          {employee.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ERPLayout>
  );
};

export default AdminEmployees;
