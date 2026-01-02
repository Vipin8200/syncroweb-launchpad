import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, UserPlus, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

const EmployeeInterns = () => {
  const { data: interns, isLoading } = useQuery({
    queryKey: ["employee-interns"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("interns")
        .select("*")
        .eq("added_by", userData.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending_approval: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <ERPLayout allowedRoles={["employee", "admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Interns</h1>
            <p className="text-muted-foreground">View and manage interns you've added</p>
          </div>
          <Button asChild>
            <Link to="/employee/add-intern">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Intern
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : interns?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Interns Yet</h3>
              <p className="text-muted-foreground mb-4">You haven't added any interns yet.</p>
              <Button asChild>
                <Link to="/employee/add-intern">Add Your First Intern</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interns?.map((intern) => (
              <Card key={intern.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{intern.full_name}</CardTitle>
                    {getStatusBadge(intern.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{intern.domain}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{intern.personal_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{intern.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{intern.duration}</span>
                  </div>
                  {intern.college_name && (
                    <p className="text-sm text-muted-foreground">
                      {intern.college_name} • {intern.course}
                    </p>
                  )}
                  {intern.start_date && (
                    <p className="text-xs text-muted-foreground">
                      Started: {format(new Date(intern.start_date), "PPP")}
                    </p>
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

export default EmployeeInterns;