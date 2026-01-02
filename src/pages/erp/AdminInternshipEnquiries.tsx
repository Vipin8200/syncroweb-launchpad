import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GraduationCap, Mail, Phone, Calendar, School } from "lucide-react";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

type EnquiryStatus = Tables<"internship_enquiries">["status"];

const AdminInternshipEnquiries = () => {
  const queryClient = useQueryClient();

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ["internship-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_enquiries")
        .select("*, internship_programs(title, department)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EnquiryStatus }) => {
      const { error } = await supabase
        .from("internship_enquiries")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internship-enquiries"] });
      toast.success("Enquiry status updated!");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const getStatusBadge = (status: EnquiryStatus) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      contacted: "secondary",
      enrolled: "default",
      closed: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <ERPLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Internship Enquiries</h1>
          <p className="text-muted-foreground">Manage internship program applications</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : enquiries?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Enquiries Yet</h3>
              <p className="text-muted-foreground">Internship enquiries will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {enquiries?.map((enquiry) => (
              <Card key={enquiry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{enquiry.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Applied for: {enquiry.internship_programs?.title} ({enquiry.internship_programs?.department})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(enquiry.status)}
                      <Select
                        value={enquiry.status}
                        onValueChange={(value: EnquiryStatus) =>
                          updateStatusMutation.mutate({ id: enquiry.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="enrolled">Enrolled</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${enquiry.email}`} className="hover:underline">
                        {enquiry.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{enquiry.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <span>{enquiry.college_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(enquiry.created_at), "PPP")}</span>
                    </div>
                  </div>

                  <p className="text-sm">
                    <span className="text-muted-foreground">Course:</span> {enquiry.course} •{" "}
                    <span className="text-muted-foreground">Graduation:</span> {enquiry.graduation_year}
                  </p>

                  {enquiry.message && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{enquiry.message}</p>
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

export default AdminInternshipEnquiries;