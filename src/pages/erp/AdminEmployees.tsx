import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, MoreVertical, Key, Mail, Phone, Building, Briefcase, Pencil, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  personal_email: string | null;
  department: string;
  position: string;
  phone: string | null;
  join_date: string;
  is_active: boolean;
  password_changed: boolean;
  temp_password: string | null;
}

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

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const AdminEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    personal_email: "",
    phone: "",
    department: "",
    position: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

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

  const toggleEmployeeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchEmployees();
      toast.success(`Employee ${currentStatus ? "deactivated" : "activated"}`);
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee status");
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditFormData({
      full_name: employee.full_name,
      personal_email: employee.personal_email || "",
      phone: employee.phone || "",
      department: employee.department,
      position: employee.position,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewPassword(null);
    setIsResetPasswordDialogOpen(true);
  };

  const submitEditEmployee = async () => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("employees")
        .update({
          full_name: editFormData.full_name,
          personal_email: editFormData.personal_email || null,
          phone: editFormData.phone || null,
          department: editFormData.department,
          position: editFormData.position,
        })
        .eq("id", selectedEmployee.id);

      if (error) throw error;
      toast.success("Employee updated successfully");
      setIsEditDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);

    try {
      // Delete from employees table
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", selectedEmployee.id);

      if (error) throw error;
      toast.success("Employee deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmResetPassword = async () => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);

    try {
      const tempPassword = generatePassword();

      // Update password via edge function
      const { data, error } = await supabase.functions.invoke("create-employee-user", {
        body: {
          employeeId: selectedEmployee.id,
          fullName: selectedEmployee.full_name,
          personalEmail: selectedEmployee.personal_email,
          companyEmail: selectedEmployee.email,
          tempPassword,
          department: selectedEmployee.department,
          position: selectedEmployee.position,
          isPasswordReset: true,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setNewPassword(tempPassword);
      toast.success("Password reset successfully");
      fetchEmployees();
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueDepartments = [...new Set(employees.map((e) => e.department))];

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground">Manage your team members</p>
          </div>
          <Button onClick={() => navigate("/erp/admin/add-employee")}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
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
              {uniqueDepartments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {employees.filter((e) => e.is_active).length}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {employees.filter((e) => !e.password_changed).length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Password Change</p>
            </CardContent>
          </Card>
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
                      Employee
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Department
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Position
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Join Date
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
                    <tr key={employee.id} className="border-t border-border hover:bg-secondary/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{employee.full_name}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{employee.department}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{employee.position}</td>
                      <td className="p-4 text-muted-foreground">
                        {format(new Date(employee.join_date), "PP")}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={employee.is_active ? "default" : "destructive"}
                          >
                            {employee.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {!employee.password_changed && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Password Pending
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleResetPassword(employee)}>
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleEmployeeStatus(employee.id, employee.is_active)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              {employee.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteEmployee(employee)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Employee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              Complete information about the employee
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {selectedEmployee.full_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{selectedEmployee.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.position}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEmployee.email}</span>
                </div>
                {selectedEmployee.personal_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Personal: {selectedEmployee.personal_email}</span>
                  </div>
                )}
                {selectedEmployee.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEmployee.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEmployee.position}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Badge variant={selectedEmployee.is_active ? "default" : "destructive"}>
                  {selectedEmployee.is_active ? "Active" : "Inactive"}
                </Badge>
                {!selectedEmployee.password_changed && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Key className="h-3 w-3 mr-1" />
                    Password Pending
                  </Badge>
                )}
              </div>

              {selectedEmployee.temp_password && !selectedEmployee.password_changed && (
                <div className="bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Temporary Password</p>
                  <p className="font-mono text-sm">{selectedEmployee.temp_password}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_personal_email">Personal Email</Label>
              <Input
                id="edit_personal_email"
                type="email"
                value={editFormData.personal_email}
                onChange={(e) => setEditFormData({ ...editFormData, personal_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_department">Department</Label>
              <Select
                value={editFormData.department}
                onValueChange={(value) => setEditFormData({ ...editFormData, department: value })}
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
            <div className="space-y-2">
              <Label htmlFor="edit_position">Position</Label>
              <Select
                value={editFormData.position}
                onValueChange={(value) => setEditFormData({ ...editFormData, position: value })}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditEmployee} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedEmployee?.full_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {newPassword
                ? "Password has been reset successfully. Share this new password with the employee."
                : `Reset password for ${selectedEmployee?.full_name}?`}
            </DialogDescription>
          </DialogHeader>
          {newPassword ? (
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">New Temporary Password</p>
                <p className="font-mono text-lg font-semibold">{newPassword}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                The employee will be required to change this password on their next login.
              </p>
              <DialogFooter>
                <Button onClick={() => setIsResetPasswordDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmResetPassword} disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </ERPLayout>
  );
};

export default AdminEmployees;
