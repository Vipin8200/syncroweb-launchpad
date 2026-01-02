import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  BookOpen,
  Send,
  X,
  ChevronRight,
  CheckCircle2,
  Users,
  Lightbulb,
  Award,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InternshipProgram {
  id: string;
  title: string;
  department: string;
  duration: string;
  description: string;
  requirements: string[];
  what_you_learn: string[];
  stipend: string | null;
  created_at: string;
}

const processSteps = [
  {
    step: 1,
    title: "Submit Enquiry",
    description: "Fill out the enquiry form with your details and area of interest",
    icon: Send,
  },
  {
    step: 2,
    title: "Application Review",
    description: "Our team reviews your application and academic background",
    icon: BookOpen,
  },
  {
    step: 3,
    title: "Technical Interview",
    description: "A brief interview to assess your skills and learning goals",
    icon: Users,
  },
  {
    step: 4,
    title: "Onboarding",
    description: "Welcome to the team! Start your internship journey",
    icon: Award,
  },
];

const Internship = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProgramId = searchParams.get("program");
  const { toast } = useToast();

  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<InternshipProgram | null>(null);
  const [isEnquiring, setIsEnquiring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    college_name: "",
    course: "",
    graduation_year: new Date().getFullYear() + 1,
    message: "",
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgramId && programs.length > 0) {
      const program = programs.find((p) => p.id === selectedProgramId);
      setSelectedProgram(program || null);
    } else {
      setSelectedProgram(null);
    }
  }, [selectedProgramId, programs]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("internship_programs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("internship_enquiries").insert({
        internship_id: selectedProgram.id,
        ...formData,
      });

      if (error) throw error;

      toast({
        title: "Enquiry Submitted!",
        description: "We'll contact you soon with more information.",
      });

      setIsEnquiring(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        college_name: "",
        course: "",
        graduation_year: new Date().getFullYear() + 1,
        message: "",
      });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast({
        title: "Error",
        description: "Failed to submit enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              Internship Program
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-heading">
              Launch Your <span className="gradient-text">Tech Career</span>
            </h1>
            <p className="text-body text-lg md:text-xl">
              Gain real-world experience, work on live projects, and learn from
              industry professionals. Perfect for college students.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section-padding bg-alt">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            {selectedProgram ? (
              <motion.div
                key="program-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <button
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to all programs
                </button>

                {!isEnquiring ? (
                  <div className="glass-card p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-heading mb-2">
                          {selectedProgram.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {selectedProgram.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {selectedProgram.duration}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsEnquiring(true)}
                        className="bg-primary hover:bg-primary-hover glow-primary"
                      >
                        Enquire Now
                        <Send className="ml-2 w-4 h-4" />
                      </Button>
                    </div>

                    {selectedProgram.stipend && (
                      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Stipend</p>
                        <p className="font-semibold text-foreground">{selectedProgram.stipend}</p>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-heading mb-3">About the Program</h3>
                        <p className="text-body whitespace-pre-line">{selectedProgram.description}</p>
                      </div>

                      {selectedProgram.what_you_learn.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-heading mb-3">What You'll Learn</h3>
                          <ul className="space-y-2">
                            {selectedProgram.what_you_learn.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-body">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedProgram.requirements.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-heading mb-3">Requirements</h3>
                          <ul className="space-y-2">
                            {selectedProgram.requirements.map((item, index) => (
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
                        Enquire about {selectedProgram.title}
                      </h2>
                      <button
                        onClick={() => setIsEnquiring(false)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleEnquiry} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Full Name *</label>
                          <Input
                            required
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Your name"
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
                            placeholder="your@email.com"
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
                          <label className="block text-sm font-medium mb-2">Graduation Year *</label>
                          <Input
                            required
                            type="number"
                            min={new Date().getFullYear()}
                            max={new Date().getFullYear() + 5}
                            value={formData.graduation_year}
                            onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">College Name *</label>
                          <Input
                            required
                            value={formData.college_name}
                            onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                            placeholder="Your college/university"
                            className="bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Course *</label>
                          <Input
                            required
                            value={formData.course}
                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            placeholder="e.g., B.Tech CSE"
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us about yourself and why you're interested..."
                          rows={4}
                          className="bg-background resize-none"
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEnquiring(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-primary hover:bg-primary-hover glow-primary"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="programs-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-heading mb-6">Available Programs</h2>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card p-6 animate-pulse">
                          <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
                          <div className="h-4 bg-secondary rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : programs.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                      <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-heading mb-2">No Programs Available</h3>
                      <p className="text-body mb-6">
                        We're currently not offering internship programs, but check back soon!
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/contact">Contact Us for Updates</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {programs.map((program, index) => (
                        <motion.div
                          key={program.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <button
                            onClick={() => setSearchParams({ program: program.id })}
                            className="w-full text-left glass-card p-6 hover-lift group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-semibold text-heading group-hover:text-primary transition-colors mb-2">
                                  {program.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    {program.department}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {program.duration}
                                  </span>
                                  {program.stipend && (
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                                      Paid
                                    </span>
                                  )}
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

      {/* Process Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-heading mb-4">
              Our <span className="gradient-text">Internship Process</span>
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              Simple and straightforward steps to join our internship program
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10" />
                  )}
                  <div className="glass-card p-6 text-center hover-lift h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-xs font-semibold text-primary mb-2">Step {step.step}</div>
                    <h3 className="font-semibold text-heading mb-2">{step.title}</h3>
                    <p className="text-sm text-body">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-alt">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-heading mb-6">
              Why Intern With <span className="gradient-text">Us?</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {[
                { icon: Lightbulb, title: "Real Projects", desc: "Work on actual client projects, not dummy assignments" },
                { icon: Users, title: "Mentorship", desc: "Get guidance from experienced developers" },
                { icon: Award, title: "Certificate", desc: "Receive a completion certificate for your portfolio" },
                { icon: BookOpen, title: "Skill Development", desc: "Learn industry-relevant technologies and practices" },
                { icon: GraduationCap, title: "Flexible Hours", desc: "Balance your internship with academics" },
                { icon: CheckCircle2, title: "Full-Time Opportunity", desc: "Top performers may get job offers" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 text-center hover-lift"
                >
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
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

export default Internship;