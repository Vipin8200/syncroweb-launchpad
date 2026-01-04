import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PasswordChangeModalProps {
  isOpen: boolean;
  isFirstLogin?: boolean;
  completeFunctionName:
    | "complete-intern-password-change"
    | "complete-employee-password-change";
  onSuccess: () => void | Promise<void>;
}

const PasswordChangeModal = ({
  isOpen,
  isFirstLogin = false,
  completeFunctionName,
  onSuccess,
}: PasswordChangeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = { newPassword: "", confirmPassword: "" };
    let isValid = true;

    if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Update password in auth
      const { error: authError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (authError) throw authError;

      // IMPORTANT: password updates can invalidate the current access token.
      // Refresh session so the backend function call has a valid JWT.
      const { data: refreshed, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError || !refreshed?.session?.access_token) {
        throw new Error("Session refresh failed. Please sign in again.");
      }

      // Mark role record as password changed (via backend function due to RLS)
      const { data, error: flagError } = await supabase.functions.invoke(
        completeFunctionName,
        {
          body: {},
          headers: {
            Authorization: `Bearer ${refreshed.session.access_token}`,
          },
        }
      );

      // Handle edge function errors - check both error property and response data
      if (flagError) {
        throw new Error(flagError.message || "Failed to update password flags");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // IMPORTANT: keep modal open until parent refresh completes to avoid flicker
      await onSuccess();

      toast.success("Password updated successfully!");
      setFormData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Password update error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {isFirstLogin ? "Set Your New Password" : "Change Password"}
          </DialogTitle>
          <DialogDescription>
            {isFirstLogin
              ? "For security, please create a new password to replace your temporary password."
              : "Please enter a new password to secure your account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password"
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordChangeModal;
