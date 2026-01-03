import { useState, useEffect } from "react";
import { Check, X, Mail, User, Clock, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Intern {
  id: string;
  full_name: string;
  personal_email: string;
  phone: string;
  domain: string;
  duration: string;
  college_name: string | null;
  course: string | null;
  status: string;
  created_at: string;
}

const AdminApprovals = () => {
  const { toast } = useToast();
  const [pendingInterns, setPendingInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchPendingInterns();
  }, []);

  const fetchPendingInterns = async () => {
    try {
      const { data, error } = await supabase
        .from("interns")
        .select("*")
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingInterns(data || []);
    } catch (error) {
      console.error("Error fetching pending interns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCompanyEmail = (name: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    const parts = cleanName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]}${parts[parts.length - 1]}@syncroweb.in`;
    }
    return `${parts[0]}@syncroweb.in`;
  };

  const generateTempPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleApprove = async (intern: Intern) => {
    setIsApproving(true);
    try {
      const companyEmail = generateCompanyEmail(intern.full_name);
      const tempPassword = generateTempPassword();

      // Get current user for approved_by
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user.id) {
        throw new Error("You must be logged in to approve interns");
      }

      // Use edge function to create user (avoids auto-login issue)
      const { data, error } = await supabase.functions.invoke("create-intern-user", {
        body: {
          internId: intern.id,
          fullName: intern.full_name,
          personalEmail: intern.personal_email,
          companyEmail,
          tempPassword,
          domain: intern.domain,
          approvedBy: session.user.id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Get the new user_id from the response to send notification
      if (data?.userId) {
        await supabase.from("notifications").insert({
          user_id: data.userId,
          title: "Welcome to the Team!",
          message: `Your internship application has been approved. You can now log in with your company email: ${companyEmail}`,
          type: "success",
        });
      }

      toast({
        title: "Intern Approved",
        description: `${intern.full_name} has been approved. Credentials: ${companyEmail}`,
      });

      setSelectedIntern(null);
      fetchPendingInterns();
    } catch (error: any) {
      console.error("Error approving intern:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (intern: Intern) => {
    try {
      const { error } = await supabase
        .from("interns")
        .update({ status: "rejected" })
        .eq("id", intern.id);

      if (error) throw error;

      // Send rejection email
      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "intern_rejected",
            recipientEmail: intern.personal_email,
            recipientName: intern.full_name,
            data: {},
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      toast({
        title: "Intern Rejected",
        description: `${intern.full_name}'s application has been rejected.`,
      });

      setSelectedIntern(null);
      fetchPendingInterns();
    } catch (error: any) {
      console.error("Error rejecting intern:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <ERPLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve intern applications</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-secondary animate-pulse rounded-xl" />
            ))}
          </div>
        ) : pendingInterns.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">All caught up!</p>
            <p className="text-muted-foreground">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingInterns.map((intern) => (
              <div
                key={intern.id}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {intern.full_name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {intern.personal_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {intern.domain}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {intern.duration}
                      </span>
                    </div>
                    {intern.college_name && (
                      <p className="text-sm text-muted-foreground">
                        {intern.college_name} - {intern.course}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Applied on {formatDate(intern.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(intern)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button onClick={() => setSelectedIntern(intern)}>
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Confirmation Dialog */}
        <Dialog open={!!selectedIntern} onOpenChange={() => setSelectedIntern(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Approval</DialogTitle>
            </DialogHeader>
            {selectedIntern && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You are about to approve <strong>{selectedIntern.full_name}</strong> for the{" "}
                  <strong>{selectedIntern.domain}</strong> internship.
                </p>
                <div className="bg-secondary p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <strong>Company Email:</strong> {generateCompanyEmail(selectedIntern.full_name)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A temporary password will be generated and sent to their personal email.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedIntern(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedIntern && handleApprove(selectedIntern)}
                disabled={isApproving}
              >
                {isApproving ? "Processing..." : "Confirm Approval"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
};

export default AdminApprovals;
