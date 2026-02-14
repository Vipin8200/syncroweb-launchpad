import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Users, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserItem {
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
}

interface NewGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

const NewGroupDialog = ({ open, onClose, onCreated }: NewGroupDialogProps) => {
  const { session, userRole } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { fetchUsers(); setStep(1); setGroupName(""); setGroupDesc(""); setSelectedUsers([]); setGroupAvatar(null); setGroupAvatarPreview(""); }
  }, [open]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: employees } = await supabase.from("employees").select("user_id, full_name").eq("is_active", true);
      const { data: interns } = await supabase.from("interns").select("user_id, full_name").eq("status", "active");
      const { data: profiles } = await supabase.from("profiles").select("id, avatar_url");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const profileMap = new Map(profiles?.map(p => [p.id, p.avatar_url]) || []);
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      const all: UserItem[] = [];
      employees?.forEach(e => { if (e.user_id !== session?.user?.id) all.push({ user_id: e.user_id, full_name: e.full_name, role: roleMap.get(e.user_id) || "employee", avatar_url: profileMap.get(e.user_id) }); });
      interns?.forEach(i => { if (i.user_id && i.user_id !== session?.user?.id) all.push({ user_id: i.user_id, full_name: i.full_name, role: roleMap.get(i.user_id) || "intern", avatar_url: profileMap.get(i.user_id) }); });
      // admin profiles
      const { data: adminProfiles } = await supabase.from("profiles").select("id, full_name, email, avatar_url");
      adminProfiles?.forEach(p => {
        if (p.id !== session?.user?.id && !all.find(u => u.user_id === p.id) && roleMap.get(p.id) === "admin") {
          all.push({ user_id: p.id, full_name: p.full_name || p.email, role: "admin", avatar_url: p.avatar_url });
        }
      });
      setUsers(all);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupAvatar(file);
      setGroupAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    setIsCreating(true);
    try {
      let avatarUrl: string | null = null;
      if (groupAvatar) {
        const ext = groupAvatar.name.split(".").pop();
        const path = `groups/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, groupAvatar);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = publicUrl;
        }
      }

      const { data: conv, error: convErr } = await supabase.from("conversations").insert({
        type: "group",
        name: groupName.trim(),
        description: groupDesc.trim() || null,
        avatar_url: avatarUrl,
        created_by: session!.user.id,
        approval_status: "approved",
        approved_by: session!.user.id,
      }).select().single();
      if (convErr) throw convErr;

      // Add creator as admin + selected members
      const members = [
        { conversation_id: conv.id, user_id: session!.user.id, role: "admin" },
        ...selectedUsers.map(uid => ({ conversation_id: conv.id, user_id: uid, role: "member" as const })),
      ];
      const { error: memErr } = await supabase.from("conversation_members").insert(members);
      if (memErr) throw memErr;

      toast({ title: "Group Created", description: `"${groupName}" created with ${selectedUsers.length} members.` });
      onCreated(conv.id);
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create group", variant: "destructive" });
    } finally { setIsCreating(false); }
  };

  const filtered = users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()));
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Create Group</DialogTitle>
          <DialogDescription>Step {step} of 2 — {step === 1 ? "Group details" : "Add members"}</DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <Avatar className="w-16 h-16">
                  {groupAvatarPreview ? <AvatarImage src={groupAvatarPreview} /> : null}
                  <AvatarFallback className="bg-primary/10"><Camera className="w-6 h-6 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="flex-1 space-y-2">
                <Input placeholder="Group name *" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                <Textarea placeholder="Description (optional)" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} rows={2} />
              </div>
            </div>
            <Button className="w-full" disabled={!groupName.trim()} onClick={() => setStep(2)}>Next — Add Members</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search people..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedUsers.map(uid => {
                  const u = users.find(x => x.user_id === uid);
                  return u ? (
                    <Badge key={uid} variant="secondary" className="gap-1 pr-1">
                      {u.full_name}
                      <button onClick={() => toggleUser(uid)}><X className="w-3 h-3" /></button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            <ScrollArea className="max-h-[250px]">
              {isLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((user) => (
                    <button key={user.user_id} onClick={() => toggleUser(user.user_id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${selectedUsers.includes(user.user_id) ? "bg-primary/10" : "hover:bg-secondary"}`}>
                      <Checkbox checked={selectedUsers.includes(user.user_id)} />
                      <Avatar className="w-8 h-8">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium flex-1">{user.full_name}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{user.role}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" disabled={selectedUsers.length === 0 || isCreating} onClick={createGroup}>
                {isCreating ? "Creating..." : `Create Group (${selectedUsers.length})`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupDialog;
