import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobPostingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const JobPostingForm = ({ onSuccess, onCancel }: JobPostingFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    job_type: "full-time" as "full-time" | "part-time" | "contract" | "remote",
    salary_range: "",
    description: "",
    requirements: [""],
    responsibilities: [""],
  });

  const handleArrayInput = (
    field: "requirements" | "responsibilities",
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayItem = (field: "requirements" | "responsibilities") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (field: "requirements" | "responsibilities", index: number) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated.length ? updated : [""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("job_postings").insert({
        title: formData.title,
        department: formData.department,
        location: formData.location,
        job_type: formData.job_type,
        salary_range: formData.salary_range || null,
        description: formData.description,
        requirements: formData.requirements.filter((r) => r.trim()),
        responsibilities: formData.responsibilities.filter((r) => r.trim()),
        is_active: true,
      });

      if (error) throw error;

      toast({ title: "Job posted successfully!" });
      onSuccess();
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-heading">Post New Job</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Job Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Senior React Developer"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Department *</label>
          <Input
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="e.g. Engineering"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Location *</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Remote / Mumbai"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Job Type *</label>
          <select
            value={formData.job_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                job_type: e.target.value as typeof formData.job_type,
              })
            }
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-muted-foreground">Salary Range (optional)</label>
          <Input
            value={formData.salary_range}
            onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
            placeholder="e.g. ₹8-12 LPA"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Description *</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the role and responsibilities..."
          rows={4}
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-muted-foreground">Requirements</label>
          <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem("requirements")}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={req}
                onChange={(e) => handleArrayInput("requirements", index, e.target.value)}
                placeholder="e.g. 3+ years experience with React"
              />
              {formData.requirements.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem("requirements", index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-muted-foreground">Responsibilities</label>
          <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem("responsibilities")}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {formData.responsibilities.map((resp, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={resp}
                onChange={(e) => handleArrayInput("responsibilities", index, e.target.value)}
                placeholder="e.g. Lead frontend development"
              />
              {formData.responsibilities.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem("responsibilities", index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Job"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default JobPostingForm;
