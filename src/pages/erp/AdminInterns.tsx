import { useState, useEffect } from "react";
import { GraduationCap, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ERPLayout from "@/components/erp/ERPLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Intern {
  id: string;
  full_name: string;
  personal_email: string;
  company_email: string | null;
  phone: string;
  domain: string;
  duration: string;
  college_name: string | null;
  course: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
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
      setInterns(data || []);
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
                      Email
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
                      Status
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
                      <td className="p-4">
                        <p className="text-muted-foreground">{intern.personal_email}</p>
                        {intern.company_email && (
                          <p className="text-xs text-primary">{intern.company_email}</p>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{intern.domain}</td>
                      <td className="p-4 text-muted-foreground">{intern.duration}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(intern.start_date)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full capitalize ${
                            statusColors[intern.status] || "bg-gray-500/10 text-gray-600"
                          }`}
                        >
                          {intern.status.replace("_", " ")}
                        </span>
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

export default AdminInterns;
