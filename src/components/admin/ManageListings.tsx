import { useState, useEffect } from "react";
import { Briefcase, GraduationCap, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import JobPostingForm from "./JobPostingForm";
import InternshipProgramForm from "./InternshipProgramForm";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  job_type: "full-time" | "part-time" | "contract" | "remote";
  salary_range: string | null;
  description: string;
  requirements: string[];
  responsibilities: string[];
  is_active: boolean;
  created_at: string;
}

interface InternshipProgram {
  id: string;
  title: string;
  department: string;
  duration: string;
  stipend: string | null;
  description: string;
  requirements: string[];
  what_you_learn: string[];
  is_active: boolean;
  created_at: string;
}

type ListingType = "jobs" | "internships";

const ManageListings = () => {
  const { toast } = useToast();
  const [activeType, setActiveType] = useState<ListingType>("jobs");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [internships, setInternships] = useState<InternshipProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [editingInternship, setEditingInternship] = useState<InternshipProgram | null>(null);

  useEffect(() => {
    fetchListings();
  }, [activeType]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      if (activeType === "jobs") {
        const { data, error } = await supabase
          .from("job_postings")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setJobs(data || []);
      } else {
        const { data, error } = await supabase
          .from("internship_programs")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setInternships(data || []);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleJobStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("job_postings")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast({ title: `Job ${currentStatus ? "hidden" : "published"}` });
      fetchListings();
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  const toggleInternshipStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("internship_programs")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast({ title: `Internship ${currentStatus ? "hidden" : "published"}` });
      fetchListings();
    } catch (error) {
      console.error("Error toggling internship status:", error);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const { error } = await supabase.from("job_postings").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Job deleted" });
      fetchListings();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const deleteInternship = async (id: string) => {
    if (!confirm("Are you sure you want to delete this internship program?")) return;
    try {
      const { error } = await supabase.from("internship_programs").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Internship deleted" });
      fetchListings();
    } catch (error) {
      console.error("Error deleting internship:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleEditInternship = (internship: InternshipProgram) => {
    setEditingInternship(internship);
    setShowInternshipForm(true);
  };

  const handleCloseJobForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  const handleCloseInternshipForm = () => {
    setShowInternshipForm(false);
    setEditingInternship(null);
  };

  if (showJobForm) {
    return (
      <div className="glass-card p-6">
        <JobPostingForm
          editData={editingJob}
          onSuccess={() => {
            handleCloseJobForm();
            fetchListings();
          }}
          onCancel={handleCloseJobForm}
        />
      </div>
    );
  }

  if (showInternshipForm) {
    return (
      <div className="glass-card p-6">
        <InternshipProgramForm
          editData={editingInternship}
          onSuccess={() => {
            handleCloseInternshipForm();
            fetchListings();
          }}
          onCancel={handleCloseInternshipForm}
        />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={activeType === "jobs" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveType("jobs")}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Jobs
          </Button>
          <Button
            variant={activeType === "internships" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveType("internships")}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Internships
          </Button>
        </div>
        <Button
          size="sm"
          onClick={() => (activeType === "jobs" ? setShowJobForm(true) : setShowInternshipForm(true))}
        >
          <Plus className="w-4 h-4 mr-2" />
          {activeType === "jobs" ? "Post Job" : "Add Internship"}
        </Button>
      </div>

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
        <div className="space-y-3">
          {activeType === "jobs" &&
            jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 bg-secondary rounded-lg flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">{job.title}</h3>
                    {!job.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.department} • {job.location} • {job.job_type}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(job.created_at)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditJob(job)}
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleJobStatus(job.id, job.is_active)}
                    title={job.is_active ? "Hide" : "Show"}
                  >
                    {job.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteJob(job.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

          {activeType === "internships" &&
            internships.map((intern) => (
              <div
                key={intern.id}
                className="p-4 bg-secondary rounded-lg flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">{intern.title}</h3>
                    {!intern.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {intern.department} • {intern.duration}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(intern.created_at)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditInternship(intern)}
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleInternshipStatus(intern.id, intern.is_active)}
                    title={intern.is_active ? "Hide" : "Show"}
                  >
                    {intern.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteInternship(intern.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

          {((activeType === "jobs" && jobs.length === 0) ||
            (activeType === "internships" && internships.length === 0)) && (
            <p className="text-center text-muted-foreground py-8">
              No {activeType === "jobs" ? "job postings" : "internship programs"} yet.
              <br />
              Click the button above to create one.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageListings;
