import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Mail, Phone, Briefcase, Calendar, ExternalLink, Download } from "lucide-react";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

type ApplicationStatus = Tables<"job_applications">["status"];

const AdminApplications = () => {
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*, job_postings(title, department)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      toast.success("Application status updated!");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      reviewed: "secondary",
      shortlisted: "default",
      rejected: "destructive",
      hired: "default",
    };
    const colors: Record<string, string> = {
      hired: "bg-green-500",
    };
    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <ERPLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground">Review and manage job applications</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : applications?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground">Applications will appear here once candidates apply.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications?.map((app) => (
              <Card key={app.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{app.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Applied for: {app.job_postings?.title} ({app.job_postings?.department})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(app.status)}
                      <Select
                        value={app.status}
                        onValueChange={(value: ApplicationStatus) =>
                          updateStatusMutation.mutate({ id: app.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${app.email}`} className="hover:underline">
                        {app.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{app.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{app.years_experience} years exp.</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(app.created_at), "PPP")}</span>
                    </div>
                  </div>

                  {app.current_company && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Current Company:</span> {app.current_company}
                      {app.notice_period && ` • ${app.notice_period} notice`}
                    </p>
                  )}

                  {app.cover_letter && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Cover Letter:</p>
                      <p className="text-sm">{app.cover_letter}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {app.resume_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Resume
                        </a>
                      </Button>
                    )}
                    {app.portfolio_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default AdminApplications;