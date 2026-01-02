import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Briefcase, Send, Upload, X, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary_range: string | null;
  created_at: string;
}

const Careers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job");
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    years_experience: 0,
    current_company: "",
    notice_period: "",
    portfolio_url: "",
    cover_letter: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId && jobs.length > 0) {
      const job = jobs.find((j) => j.id === selectedJobId);
      setSelectedJob(job || null);
    } else {
      setSelectedJob(null);
    }
  }, [selectedJobId, jobs]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("job_applications").insert({
        job_id: selectedJob.id,
        ...formData,
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });

      setIsApplying(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        years_experience: 0,
        current_company: "",
        notice_period: "",
        portfolio_url: "",
        cover_letter: "",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatJobType = (type: string) => {
    return type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Careers
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-heading">
              Join Our <span className="gradient-text">Growing Team</span>
            </h1>
            <p className="text-body text-lg md:text-xl">
              Be part of a team that's shaping the future of digital solutions.
              We're always looking for talented individuals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="section-padding bg-alt">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div
                key="job-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* Back Button */}
                <button
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to all positions
                </button>

                {!isApplying ? (
                  <div className="glass-card p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-heading mb-2">
                          {selectedJob.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {selectedJob.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {selectedJob.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatJobType(selectedJob.job_type)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsApplying(true)}
                        className="bg-primary hover:bg-primary-hover glow-primary"
                      >
                        Apply Now
                        <Send className="ml-2 w-4 h-4" />
                      </Button>
                    </div>

                    {selectedJob.salary_range && (
                      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Salary Range</p>
                        <p className="font-semibold text-foreground">{selectedJob.salary_range}</p>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-heading mb-3">Description</h3>
                        <p className="text-body whitespace-pre-line">{selectedJob.description}</p>
                      </div>

                      {selectedJob.responsibilities.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-heading mb-3">Responsibilities</h3>
                          <ul className="space-y-2">
                            {selectedJob.responsibilities.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-body">
                                <ChevronRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJob.requirements.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-heading mb-3">Requirements</h3>
                          <ul className="space-y-2">
                            {selectedJob.requirements.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-body">
                                <ChevronRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-heading">
                        Apply for {selectedJob.title}
                      </h2>
                      <button
                        onClick={() => setIsApplying(false)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleApply} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Full Name *</label>
                          <Input
                            required
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="John Doe"
                            className="bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <Input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone *</label>
                          <Input
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 XXXXX XXXXX"
                            className="bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Years of Experience *</label>
                          <Input
                            required
                            type="number"
                            min="0"
                            value={formData.years_experience}
                            onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Current Company</label>
                          <Input
                            value={formData.current_company}
                            onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                            placeholder="Company name"
                            className="bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Notice Period</label>
                          <Input
                            value={formData.notice_period}
                            onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                            placeholder="e.g., 30 days"
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Portfolio/LinkedIn URL</label>
                        <Input
                          type="url"
                          value={formData.portfolio_url}
                          onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                          placeholder="https://"
                          className="bg-background"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Cover Letter</label>
                        <Textarea
                          value={formData.cover_letter}
                          onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                          placeholder="Tell us why you'd be a great fit..."
                          rows={5}
                          className="bg-background resize-none"
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsApplying(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-primary hover:bg-primary-hover glow-primary"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Application"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="jobs-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-heading mb-6">Open Positions</h2>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card p-6 animate-pulse">
                          <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
                          <div className="h-4 bg-secondary rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-heading mb-2">No Open Positions</h3>
                      <p className="text-body mb-6">
                        We don't have any open positions right now, but we're always looking for talent.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/contact">Send Us Your Resume</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <button
                            onClick={() => setSearchParams({ job: job.id })}
                            className="w-full text-left glass-card p-6 hover-lift group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-semibold text-heading group-hover:text-primary transition-colors mb-2">
                                  {job.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {job.department}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {job.location}
                                  </span>
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                                    {formatJobType(job.job_type)}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-heading mb-6">
              Why Join <span className="gradient-text">SyncroWeb?</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {[
                { title: "Growth Opportunities", desc: "Continuous learning and career advancement" },
                { title: "Work-Life Balance", desc: "Flexible hours and remote work options" },
                { title: "Modern Tech Stack", desc: "Work with cutting-edge technologies" },
                { title: "Collaborative Culture", desc: "Supportive and inclusive team environment" },
                { title: "Competitive Pay", desc: "Industry-standard compensation packages" },
                { title: "Health Benefits", desc: "Comprehensive health insurance coverage" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 text-center hover-lift"
                >
                  <h3 className="font-semibold text-heading mb-2">{item.title}</h3>
                  <p className="text-sm text-body">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Careers;