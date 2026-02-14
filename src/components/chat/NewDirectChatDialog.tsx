import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserItem {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

interface NewDirectChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
  existingDirects: { otherUserId: string; conversationId: string }[];
}

const NewDirectChatDialog = ({ open, onClose, onCreated, existingDirects }: NewDirectChatDialogProps) => {
  const { session, userRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchUsers();
  }, [open]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get employees
      const { data: employees } = await supabase.from("employees").select("id, user_id, full_name, email").eq("is_active", true);
      // Get interns
      const { data: interns } = await supabase.from("interns").select("id, user_id, full_name, personal_email, company_email").eq("status", "active");
      // Get profiles for avatar
      const { data: profiles } = await supabase.from("profiles").select("id, avatar_url");
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.avatar_url]) || []);
      // Get user roles
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      const allUsers: UserItem[] = [];
      employees?.forEach(e => {
        if (e.user_id !== session?.user?.id) {
          allUsers.push({
            id: e.id,
            user_id: e.user_id,
            full_name: e.full_name,
            email: e.email,
            role: roleMap.get(e.user_id) || "employee",
            avatar_url: profileMap.get(e.user_id),
          });
        }
      });
      interns?.forEach(i => {
        if (i.user_id && i.user_id !== session?.user?.id) {
          allUsers.push({
            id: i.id,
            user_id: i.user_id,
            full_name: i.full_name,
            email: i.company_email || i.personal_email,
            role: roleMap.get(i.user_id) || "intern",
            avatar_url: profileMap.get(i.user_id),
          });
        }
      });
      // Also add admin profiles not in employees
      const { data: adminProfiles } = await supabase.from("profiles").select("id, full_name, email, avatar_url");
      adminProfiles?.forEach(p => {
        if (p.id !== session?.user?.id && !allUsers.find(u => u.user_id === p.id)) {
          const r = roleMap.get(p.id);
          if (r === "admin") {
            allUsers.push({
              id: p.id,
              user_id: p.id,
              full_name: p.full_name || p.email,
              email: p.email,
              role: "admin",
              avatar_url: p.avatar_url,
            });
          }
        }
      });

      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = async (user: UserItem) => {
    // Check if direct already exists
    const existing = existingDirects.find(d => d.otherUserId === user.user_id);
    if (existing) {
      onCreated(existing.conversationId);
      onClose();
      return;
    }

    setCreating(user.user_id);
    try {
      // Admin and employees can auto-approve, interns need approval
      const needsApproval = userRole === "intern";
      const approvalStatus = needsApproval ? "pending" : "approved";
      const chatName = `${user.full_name}`;

      const { data: conv, error: convError } = await supabase.from("conversations").insert({
        type: "direct",
        name: chatName,
        created_by: session!.user.id,
        approval_status: approvalStatus,
        approved_by: needsApproval ? null : session!.user.id,
      }).select().single();

      if (convError) throw convError;

      // Add both members
      const { error: memberError } = await supabase.from("conversation_members").insert([
        { conversation_id: conv.id, user_id: session!.user.id, role: "member" },
        { conversation_id: conv.id, user_id: user.user_id, role: "member" },
      ]);

      if (memberError) throw memberError;

      if (needsApproval) {
        // Create notification for admins/employees
        toast({ title: "Request Sent", description: "Your chat request has been sent for approval." });
      }

      onCreated(conv.id);
      onClose();
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast({ title: "Error", description: error.message || "Failed to create chat", variant: "destructive" });
    } finally {
      setCreating(null);
    }
  };

  const filtered = users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> New Private Chat
          </DialogTitle>
          <DialogDescription>
            {userRole === "intern" ? (
              <span className="flex items-center gap-1 text-amber-500"><Lock className="w-3 h-3" /> Requires admin/employee approval</span>
            ) : "Select a person to start a private conversation"}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search people..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <ScrollArea className="max-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => startChat(user)}
                  disabled={creating === user.user_id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <Avatar className="w-9 h-9">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize">{user.role}</Badge>
                  {creating === user.user_id && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewDirectChatDialog;
