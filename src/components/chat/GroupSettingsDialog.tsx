import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, UserPlus, Trash2, Crown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  user_id: string;
  role: string;
  name: string;
  avatar_url: string | null;
  userRole: string;
}

interface GroupSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName: string;
  conversationAvatar: string | null;
  isGroupAdmin: boolean;
}

const GroupSettingsDialog = ({ open, onClose, conversationId, conversationName, conversationAvatar, isGroupAdmin }: GroupSettingsDialogProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(conversationName);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setName(conversationName); fetchMembers(); }
  }, [open, conversationId]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data: mems } = await supabase.from("conversation_members").select("*").eq("conversation_id", conversationId);
      if (!mems) return;

      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      setMembers(mems.map(m => {
        const profile = profileMap.get(m.user_id);
        return {
          id: m.id,
          user_id: m.user_id,
          role: m.role,
          name: profile?.full_name || "Unknown",
          avatar_url: profile?.avatar_url || null,
          userRole: roleMap.get(m.user_id) || "unknown",
        };
      }));
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const updateName = async () => {
    if (!name.trim() || name === conversationName) return;
    const { error } = await supabase.from("conversations").update({ name: name.trim() }).eq("id", conversationId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Updated", description: "Group name updated." });
  };

  const removeMember = async (memberId: string, userId: string) => {
    if (userId === session?.user?.id) return;
    const { error } = await supabase.from("conversation_members").delete().eq("id", memberId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setMembers(prev => prev.filter(m => m.id !== memberId)); toast({ title: "Removed" }); }
  };

  const makeAdmin = async (memberId: string) => {
    const { error } = await supabase.from("conversation_members").update({ role: "admin" }).eq("id", memberId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { fetchMembers(); toast({ title: "Updated", description: "Member is now admin." }); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `groups/${conversationId}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("conversations").update({ avatar_url: publicUrl }).eq("id", conversationId);
    toast({ title: "Avatar updated" });
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group info */}
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer" onClick={() => isGroupAdmin && avatarRef.current?.click()}>
              <Avatar className="w-16 h-16">
                {conversationAvatar && <AvatarImage src={conversationAvatar} />}
                <AvatarFallback className="bg-primary/10 text-primary text-lg">{getInitials(conversationName)}</AvatarFallback>
              </Avatar>
              {isGroupAdmin && <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition"><Camera className="w-5 h-5 text-white" /></div>}
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1 space-y-1">
              {isGroupAdmin ? (
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
                  <Button size="sm" onClick={updateName} disabled={!name.trim() || name === conversationName}>Save</Button>
                </div>
              ) : (
                <p className="font-semibold">{conversationName}</p>
              )}
              <p className="text-xs text-muted-foreground">{members.length} members</p>
            </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-sm font-medium mb-2">Members</p>
            <ScrollArea className="max-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div className="space-y-1">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                      <Avatar className="w-8 h-8">
                        {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(m.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name} {m.user_id === session?.user?.id ? "(You)" : ""}</p>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-[10px] capitalize">{m.userRole}</Badge>
                          {m.role === "admin" && <Badge className="text-[10px] bg-amber-500/20 text-amber-600"><Crown className="w-2 h-2 mr-0.5" />Admin</Badge>}
                        </div>
                      </div>
                      {isGroupAdmin && m.user_id !== session?.user?.id && (
                        <div className="flex gap-1">
                          {m.role !== "admin" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => makeAdmin(m.id)} title="Make admin">
                              <Crown className="w-3 h-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeMember(m.id, m.user_id)} title="Remove">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsDialog;
