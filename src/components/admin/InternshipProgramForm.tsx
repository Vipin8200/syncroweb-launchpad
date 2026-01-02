import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InternshipProgramData {
  id: string;
  title: string;
  department: string;
  duration: string;
  stipend: string | null;
  description: string;
  requirements: string[];
  what_you_learn: string[];
}

interface InternshipProgramFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editData?: InternshipProgramData | null;
}

const InternshipProgramForm = ({ onSuccess, onCancel, editData }: InternshipProgramFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    duration: "",
    stipend: "",
    description: "",
    requirements: [""],
    what_you_learn: [""],
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        department: editData.department,
        duration: editData.duration,
        stipend: editData.stipend || "",
        description: editData.description,
        requirements: editData.requirements.length > 0 ? editData.requirements : [""],
        what_you_learn: editData.what_you_learn.length > 0 ? editData.what_you_learn : [""],
      });
    }
  }, [editData]);

  const handleArrayInput = (
    field: "requirements" | "what_you_learn",
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayItem = (field: "requirements" | "what_you_learn") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (field: "requirements" | "what_you_learn", index: number) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated.length ? updated : [""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        duration: formData.duration,
        stipend: formData.stipend || null,
        description: formData.description,
        requirements: formData.requirements.filter((r) => r.trim()),
        what_you_learn: formData.what_you_learn.filter((w) => w.trim()),
      };

      if (editData) {
        const { error } = await supabase
          .from("internship_programs")
          .update(payload)
          .eq("id", editData.id);
        if (error) throw error;
        toast({ title: "Internship program updated successfully!" });
      } else {
        const { error } = await supabase.from("internship_programs").insert({
          ...payload,
          is_active: true,
        });
        if (error) throw error;
        toast({ title: "Internship program created successfully!" });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving internship:", error);
      toast({
        title: "Error",
        description: `Failed to ${editData ? "update" : "create"} internship. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!editData;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-heading">
          {isEditing ? "Edit Internship Program" : "Create Internship Program"}
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Program Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Web Development Internship"
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
          <label className="text-sm text-muted-foreground">Duration *</label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g. 3 months"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Stipend (optional)</label>
          <Input
            value={formData.stipend}
            onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
            placeholder="e.g. ₹10,000/month or Unpaid"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Description *</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the internship program..."
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
                placeholder="e.g. Currently pursuing B.Tech/MCA"
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
          <label className="text-sm text-muted-foreground">What You'll Learn</label>
          <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem("what_you_learn")}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {formData.what_you_learn.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleArrayInput("what_you_learn", index, e.target.value)}
                placeholder="e.g. React, Node.js, Database design"
              />
              {formData.what_you_learn.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem("what_you_learn", index)}
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
          {isSubmitting ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Program")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default InternshipProgramForm;
