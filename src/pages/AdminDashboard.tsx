import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  Mail,
  Users,
  LogOut,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Home,
  Plus,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import ManageListings from "@/components/admin/ManageListings";

type TabType = "applications" | "internships" | "contacts" | "manage";

interface JobApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  years_experience: number;
  current_company: string | null;
  notice_period: string | null;
  portfolio_url: string | null;
  cover_letter: string | null;
  status: string;
  created_at: string;
  job_postings: {
    title: string;
    department: string;
  };
}

interface InternshipEnquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  college_name: string;
  course: string;
  graduation_year: number;
  message: string | null;
  status: string;
  created_at: string;
  internship_programs: {
    title: string;
    department: string;
  };
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  reviewed: "bg-blue-500/10 text-blue-600",
  shortlisted: "bg-green-500/10 text-green-600",
  rejected: "bg-red-500/10 text-red-600",
  hired: "bg-purple-500/10 text-purple-600",
  contacted: "bg-blue-500/10 text-blue-600",
  enrolled: "bg-green-500/10 text-green-600",
  closed: "bg-gray-500/10 text-gray-600",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("manage");
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [internshipEnquiries, setInternshipEnquiries] = useState<InternshipEnquiry[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === "applications") fetchApplications();
    else if (activeTab === "internships") fetchInternshipEnquiries();
    else if (activeTab === "contacts") fetchContacts();
    else if (activeTab === "manage") setIsLoading(false);
  }, [activeTab]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin");
      return;
    }

    setUserEmail(session.user.email || "");

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      await supabase.auth.signOut();
      navigate("/admin");
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`*, job_postings(title, department)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInternshipEnquiries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("internship_enquiries")
        .select(`*, internship_programs(title, department)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInternshipEnquiries(data || []);
    } catch (error) {
      console.error("Error fetching internship enquiries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired") => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Status Updated" });
      fetchApplications();
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateEnquiryStatus = async (id: string, status: "pending" | "contacted" | "enrolled" | "closed") => {
    try {
      const { error } = await supabase
        .from("internship_enquiries")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Status Updated" });
      fetchInternshipEnquiries();
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const markContactAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;

      fetchContacts();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs = [
    { id: "manage" as TabType, label: "Manage Listings", icon: Settings, count: 0 },
    { id: "applications" as TabType, label: "Job Applications", icon: Briefcase, count: applications.length },
    { id: "internships" as TabType, label: "Internship Enquiries", icon: GraduationCap, count: internshipEnquiries.length },
    { id: "contacts" as TabType, label: "Contact Messages", icon: Mail, count: contacts.filter(c => !c.is_read).length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground hidden sm:block">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:block">{userEmail}</span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <Home className="w-4 h-4 mr-1" />
                  Website
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedItem(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "manage" ? (
          <ManageListings />
        ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4">
              <h2 className="text-lg font-semibold text-heading mb-4">
                {activeTab === "applications" && "Applications"}
                {activeTab === "internships" && "Enquiries"}
                {activeTab === "contacts" && "Messages"}
              </h2>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-secondary rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {activeTab === "applications" && applications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedItem(app)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedItem?.id === app.id ? "bg-primary/10 border border-primary/20" : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <p className="font-medium text-foreground">{app.full_name}</p>
                      <p className="text-sm text-muted-foreground">{app.job_postings?.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(app.created_at)}</span>
                      </div>
                    </button>
                  ))}

                  {activeTab === "internships" && internshipEnquiries.map((enq) => (
                    <button
                      key={enq.id}
                      onClick={() => setSelectedItem(enq)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedItem?.id === enq.id ? "bg-primary/10 border border-primary/20" : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <p className="font-medium text-foreground">{enq.full_name}</p>
                      <p className="text-sm text-muted-foreground">{enq.internship_programs?.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[enq.status]}`}>
                          {enq.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(enq.created_at)}</span>
                      </div>
                    </button>
                  ))}

                  {activeTab === "contacts" && contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedItem(contact);
                        if (!contact.is_read) markContactAsRead(contact.id);
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedItem?.id === contact.id ? "bg-primary/10 border border-primary/20" : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{contact.name}</p>
                        {!contact.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{contact.message}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(contact.created_at)}</span>
                    </button>
                  ))}

                  {((activeTab === "applications" && applications.length === 0) ||
                    (activeTab === "internships" && internshipEnquiries.length === 0) ||
                    (activeTab === "contacts" && contacts.length === 0)) && (
                    <p className="text-center text-muted-foreground py-8">No items found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6"
              >
                {activeTab === "applications" && (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-heading">{selectedItem.full_name}</h2>
                        <p className="text-muted-foreground">
                          Applied for: {selectedItem.job_postings?.title} ({selectedItem.job_postings?.department})
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedItem.status]}`}>
                        {selectedItem.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedItem.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedItem.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium">{selectedItem.years_experience} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Company</p>
                        <p className="font-medium">{selectedItem.current_company || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Notice Period</p>
                        <p className="font-medium">{selectedItem.notice_period || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Portfolio</p>
                        {selectedItem.portfolio_url ? (
                          <a href={selectedItem.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            View
                          </a>
                        ) : (
                          <p className="font-medium">N/A</p>
                        )}
                      </div>
                    </div>

                    {selectedItem.cover_letter && (
                      <div className="mb-6">
                        <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                        <p className="p-4 bg-secondary rounded-lg whitespace-pre-line">{selectedItem.cover_letter}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground mr-2">Update Status:</span>
                      {(["pending", "reviewed", "shortlisted", "rejected", "hired"] as const).map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={selectedItem.status === status ? "default" : "outline"}
                          onClick={() => updateApplicationStatus(selectedItem.id, status)}
                          className="capitalize"
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "internships" && (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-heading">{selectedItem.full_name}</h2>
                        <p className="text-muted-foreground">
                          Interested in: {selectedItem.internship_programs?.title} ({selectedItem.internship_programs?.department})
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedItem.status]}`}>
                        {selectedItem.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedItem.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedItem.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">College</p>
                        <p className="font-medium">{selectedItem.college_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Course</p>
                        <p className="font-medium">{selectedItem.course}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Graduation Year</p>
                        <p className="font-medium">{selectedItem.graduation_year}</p>
                      </div>
                    </div>

                    {selectedItem.message && (
                      <div className="mb-6">
                        <p className="text-sm text-muted-foreground mb-2">Message</p>
                        <p className="p-4 bg-secondary rounded-lg whitespace-pre-line">{selectedItem.message}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground mr-2">Update Status:</span>
                      {(["pending", "contacted", "enrolled", "closed"] as const).map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={selectedItem.status === status ? "default" : "outline"}
                          onClick={() => updateEnquiryStatus(selectedItem.id, status)}
                          className="capitalize"
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "contacts" && (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-heading">{selectedItem.name}</h2>
                        <p className="text-muted-foreground">{selectedItem.email}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(selectedItem.created_at)}
                      </span>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="whitespace-pre-line">{selectedItem.message}</p>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button asChild>
                        <a href={`mailto:${selectedItem.email}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          Reply via Email
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-heading mb-2">Select an Item</h3>
                <p className="text-muted-foreground">
                  Click on an item from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;