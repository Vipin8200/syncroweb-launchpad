import { useState, useEffect } from "react";
import { GraduationCap, Search, Edit, Trash2, MoreHorizontal, Key, Mail, Copy, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
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

interface Intern {
  id: string;
  full_name: string;
  personal_email: string;
  company_email: string | null;
  temp_password: string | null;
  phone: string;
  domain: string;
  duration: string;
  college_name: string | null;
  course: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  user_id: string | null;
  added_by: string;
  added_by_name?: string;
  added_by_role?: string;
}

const statusColors: Record<string, string> = {
  pending_approval: "bg-yellow-500/10 text-yellow-600",
  approved: "bg-blue-500/10 text-blue-600",
  active: "bg-green-500/10 text-green-600",
  completed: "bg-purple-500/10 text-purple-600",
  rejected: "bg-red-500/10 text-red-600",
};

const AdminInterns = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit dialog state
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    personal_email: "",
    phone: "",
    domain: "",
    duration: "",
    college_name: "",
    course: "",
    status: "",
    temp_password: "",
  });

  // Delete dialog state
  const [deletingIntern, setDeletingIntern] = useState<Intern | null>(null);

  // Credentials dialog state
  const [viewingCredentials, setViewingCredentials] = useState<Intern | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Reset password state
  const [resettingPassword, setResettingPassword] = useState<Intern | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchInterns();
  }, []);

  useEffect(() => {
    filterInterns();
  }, [interns, searchQuery, statusFilter]);

  const fetchInterns = async () => {
    try {
      const { data, error } = await supabase
        .from("interns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch creator details for each intern
      const internsWithCreator = await Promise.all(
        (data || []).map(async (intern) => {
          // Check if added_by is an employee
          const { data: employee } = await supabase
            .from("employees")
            .select("full_name")
            .eq("user_id", intern.added_by)
            .maybeSingle();

          if (employee) {
            return {
              ...intern,
              added_by_name: employee.full_name,
              added_by_role: "Employee",
            };
          }

          // Check if added_by is an admin (from profiles)
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", intern.added_by)
            .maybeSingle();

          return {
            ...intern,
            added_by_name: profile?.full_name || "Unknown",
            added_by_role: "Admin",
          };
        })
      );

      setInterns(internsWithCreator);
    } catch (error) {
      console.error("Error fetching interns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInterns = () => {
    let filtered = [...interns];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (intern) =>
          intern.full_name.toLowerCase().includes(query) ||
          intern.personal_email.toLowerCase().includes(query) ||
          intern.company_email?.toLowerCase().includes(query) ||
          intern.domain.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((intern) => intern.status === statusFilter);
    }

    setFilteredInterns(filtered);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleEditClick = (intern: Intern) => {
    setEditingIntern(intern);
    setEditFormData({
      full_name: intern.full_name,
      personal_email: intern.personal_email,
      phone: intern.phone,
      domain: intern.domain,
      duration: intern.duration,
      college_name: intern.college_name || "",
      course: intern.course || "",
      status: intern.status,
      temp_password: intern.temp_password || "",
    });
  };

  const handleEditSave = async () => {
    if (!editingIntern) return;

    try {
      const { error } = await supabase
        .from("interns")
        .update({
          full_name: editFormData.full_name,
          personal_email: editFormData.personal_email,
          phone: editFormData.phone,
          domain: editFormData.domain,
          duration: editFormData.duration,
          college_name: editFormData.college_name || null,
          course: editFormData.course || null,
          status: editFormData.status,
          temp_password: editFormData.temp_password || null,
        })
        .eq("id", editingIntern.id);

      if (error) throw error;

      toast.success("Intern updated successfully");
      setEditingIntern(null);
      fetchInterns();
    } catch (error: any) {
      toast.error("Failed to update intern: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingIntern) return;

    try {
      const { error } = await supabase
        .from("interns")
        .delete()
        .eq("id", deletingIntern.id);

      if (error) throw error;

      toast.success("Intern deleted successfully");
      setDeletingIntern(null);
      fetchInterns();
    } catch (error: any) {
      toast.error("Failed to delete intern: " + error.message);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const resendCredentials = async (intern: Intern) => {
    if (!intern.company_email || !intern.temp_password) {
      toast.error("No credentials found for this intern");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("send-notification", {
        body: {
          type: "intern_approved",
          recipientEmail: intern.personal_email,
          recipientName: intern.full_name,
          data: {
            companyEmail: intern.company_email,
            tempPassword: intern.temp_password,
            domain: intern.domain,
          },
        },
      });

      if (error) throw error;
      toast.success("Credentials resent to " + intern.personal_email);
    } catch (err: any) {
      toast.error("Failed to send email: " + err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!resettingPassword) return;

    setIsResettingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-intern-password", {
        body: { internId: resettingPassword.id },
      });

      if (error) throw error;
      
      setNewResetPassword(data.newPassword);
      toast.success("Password reset successfully! Email sent to intern.");
      fetchInterns();
    } catch (err: any) {
      toast.error("Failed to reset password: " + err.message);
      setResettingPassword(null);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const closeResetDialog = () => {
    setResettingPassword(null);
    setNewResetPassword(null);
  };

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Interns</h1>
          <p className="text-muted-foreground">View and manage all interns</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interns Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredInterns.length === 0 ? (
            <div className="p-8 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No interns found</p>
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
                      Personal Email
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Company Email
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Domain
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Duration
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Start Date
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Created By
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
                  {filteredInterns.map((intern) => (
                    <tr key={intern.id} className="border-t border-border">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{intern.full_name}</p>
                        {intern.college_name && (
                          <p className="text-xs text-muted-foreground">{intern.college_name}</p>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {intern.personal_email}
                      </td>
                      <td className="p-4">
                        {intern.company_email ? (
                          <p className="text-sm font-mono text-primary">{intern.company_email}</p>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{intern.domain}</td>
                      <td className="p-4 text-muted-foreground">{intern.duration}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(intern.start_date)}</td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{intern.added_by_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{intern.added_by_role}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full capitalize ${
                            statusColors[intern.status] || "bg-gray-500/10 text-gray-600"
                          }`}
                        >
                          {intern.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(intern)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            {intern.company_email && (
                              <DropdownMenuItem onClick={() => setViewingCredentials(intern)}>
                                <Key className="h-4 w-4 mr-2" />
                                View Credentials
                              </DropdownMenuItem>
                            )}
                            {intern.company_email && intern.temp_password && (
                              <DropdownMenuItem onClick={() => resendCredentials(intern)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Email
                              </DropdownMenuItem>
                            )}
                            {intern.user_id && (
                              <DropdownMenuItem onClick={() => setResettingPassword(intern)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => setDeletingIntern(intern)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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

      {/* Edit Dialog */}
      <Dialog open={!!editingIntern} onOpenChange={() => setEditingIntern(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Intern</DialogTitle>
            <DialogDescription>Update intern details and credentials</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Personal Email</Label>
                <Input
                  value={editFormData.personal_email}
                  onChange={(e) => setEditFormData({ ...editFormData, personal_email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Domain</Label>
                <Input
                  value={editFormData.domain}
                  onChange={(e) => setEditFormData({ ...editFormData, domain: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Duration</Label>
                <Input
                  value={editFormData.duration}
                  onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>College</Label>
                <Input
                  value={editFormData.college_name}
                  onChange={(e) => setEditFormData({ ...editFormData, college_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Course</Label>
                <Input
                  value={editFormData.course}
                  onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Temp Password</Label>
                <Input
                  value={editFormData.temp_password}
                  onChange={(e) => setEditFormData({ ...editFormData, temp_password: e.target.value })}
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIntern(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Credentials Dialog */}
      <Dialog open={!!viewingCredentials} onOpenChange={() => setViewingCredentials(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Credentials</DialogTitle>
            <DialogDescription>
              Credentials for {viewingCredentials?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Email</Label>
              <div className="flex gap-2">
                <Input value={viewingCredentials?.company_email || ""} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(viewingCredentials?.company_email || "", "email")}
                >
                  {copied === "email" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <div className="flex gap-2">
                <Input value={viewingCredentials?.temp_password || ""} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(viewingCredentials?.temp_password || "", "password")}
                >
                  {copied === "password" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingCredentials(null)}>
              Close
            </Button>
            <Button onClick={() => viewingCredentials && resendCredentials(viewingCredentials)}>
              <Mail className="h-4 w-4 mr-2" />
              Resend to Intern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingIntern} onOpenChange={() => setDeletingIntern(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Intern?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingIntern?.full_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resettingPassword} onOpenChange={closeResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {newResetPassword 
                ? `Password has been reset for ${resettingPassword?.full_name}` 
                : `Reset password for ${resettingPassword?.full_name}?`}
            </DialogDescription>
          </DialogHeader>
          {newResetPassword ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600 font-medium mb-2">Password reset successful!</p>
                <p className="text-sm text-muted-foreground">An email with the new password has been sent to the intern.</p>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="flex gap-2">
                  <Input value={newResetPassword} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newResetPassword, "resetPassword")}
                  >
                    {copied === "resetPassword" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={closeResetDialog}>Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                This will generate a new password and send it to the intern's personal email. 
                The intern will be required to change this password on their next login.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={closeResetDialog}>Cancel</Button>
                <Button onClick={handleResetPassword} disabled={isResettingPassword}>
                  {isResettingPassword ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ERPLayout>
  );
};

export default AdminInterns;