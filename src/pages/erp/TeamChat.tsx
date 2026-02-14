import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import ERPLayout from "@/components/erp/ERPLayout";
import ChatSidebar, { Conversation } from "@/components/chat/ChatSidebar";
import MessageArea from "@/components/chat/MessageArea";
import NewDirectChatDialog from "@/components/chat/NewDirectChatDialog";
import NewGroupDialog from "@/components/chat/NewGroupDialog";
import GroupSettingsDialog from "@/components/chat/GroupSettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GENERAL_CHANNEL_ID = "00000000-0000-0000-0000-000000000001";

const TeamChat = () => {
  const { session, userRole, userName } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(GENERAL_CHANNEL_ID);
  const [showNewDirect, setShowNewDirect] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      // Fetch all conversations user can see
      const { data: convs, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;

      // Fetch members for all conversations
      const convIds = (convs || []).map(c => c.id);
      const { data: allMembers } = await supabase
        .from("conversation_members")
        .select("*")
        .in("conversation_id", convIds.length > 0 ? convIds : ["none"]);

      // Fetch profiles for member names
      const memberUserIds = [...new Set((allMembers || []).map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", memberUserIds.length > 0 ? memberUserIds : ["none"]);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Fetch user roles
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("user_id", memberUserIds.length > 0 ? memberUserIds : ["none"]);
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      // Fetch last message for each conversation
      const { data: lastMsgs } = await supabase
        .from("messages")
        .select("conversation_id, message, created_at")
        .in("conversation_id", convIds.length > 0 ? convIds : ["none"])
        .order("created_at", { ascending: false });

      const lastMsgMap = new Map<string, { message: string | null; created_at: string }>();
      lastMsgs?.forEach(m => {
        if (!lastMsgMap.has(m.conversation_id)) {
          lastMsgMap.set(m.conversation_id, { message: m.message, created_at: m.created_at });
        }
      });

      const enriched: Conversation[] = (convs || []).map(c => {
        const members = (allMembers || []).filter(m => m.conversation_id === c.id);
        const lastMsg = lastMsgMap.get(c.id);
        let otherUser: Conversation["otherUser"] = undefined;

        if (c.type === "direct") {
          const other = members.find(m => m.user_id !== session.user.id);
          if (other) {
            const p = profileMap.get(other.user_id);
            otherUser = {
              name: p?.full_name || "Unknown",
              avatar_url: p?.avatar_url || null,
              role: roleMap.get(other.user_id) || "unknown",
            };
          }
        }

        return {
          ...c,
          type: c.type as Conversation["type"],
          lastMessage: lastMsg?.message || undefined,
          lastMessageTime: lastMsg?.created_at || undefined,
          members: members.map(m => ({ user_id: m.user_id, role: m.role })),
          otherUser,
        };
      });

      // Separate pending requests (conversations pending approval that user didn't create)
      const pending = enriched.filter(c =>
        c.approval_status === "pending" &&
        c.created_by !== session.user.id &&
        (userRole === "admin" || userRole === "employee")
      );
      const rest = enriched.filter(c => !(c.approval_status === "pending" && c.created_by !== session.user.id && (userRole === "admin" || userRole === "employee")));

      setPendingRequests(pending);
      setConversations(rest);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, userRole]);

  useEffect(() => {
    fetchConversations();

    // Listen for new conversations and messages
    const channel = supabase
      .channel("conversations-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => fetchConversations())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        // Show notification for messages not from current user and not in active conversation
        if (msg.sender_id !== session?.user?.id && msg.conversation_id !== activeConversation) {
          // Play sound
          try {
            const audio = new Audio("data:audio/wav;base64,UklGRl9vT19telefonoAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch {}
          toast({
            title: `💬 ${msg.sender_name}`,
            description: msg.message?.slice(0, 50) || "Sent a file",
          });
        }
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations, activeConversation, session?.user?.id]);

  const handleApprove = async (convId: string) => {
    const { error } = await supabase.from("conversations").update({
      approval_status: "approved",
      approved_by: session!.user.id,
    }).eq("id", convId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Approved" }); fetchConversations(); }
  };

  const handleReject = async (convId: string) => {
    const { error } = await supabase.from("conversations").update({
      approval_status: "rejected",
    }).eq("id", convId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Rejected" }); fetchConversations(); }
  };

  const activeConv = conversations.find(c => c.id === activeConversation);
  const activeConvName = activeConv?.type === "direct" ? (activeConv.otherUser?.name || "Private Chat") : (activeConv?.name || "General Channel");

  const existingDirects = conversations
    .filter(c => c.type === "direct")
    .map(c => ({
      otherUserId: c.members?.find(m => m.user_id !== session?.user?.id)?.user_id || "",
      conversationId: c.id,
    }));

  const isGroupAdmin = activeConv?.type === "group" &&
    activeConv.members?.some(m => m.user_id === session?.user?.id && m.role === "admin");

  return (
    <ERPLayout allowedRoles={["admin", "employee", "intern"]}>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-foreground">Team Chat</h1>
        </div>

        <div className="flex-1 flex rounded-xl border border-border overflow-hidden bg-card">
          <ChatSidebar
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={setActiveConversation}
            onNewDirect={() => setShowNewDirect(true)}
            onNewGroup={() => setShowNewGroup(true)}
            pendingRequests={pendingRequests}
            onApprove={handleApprove}
            onReject={handleReject}
            userRole={userRole}
          />
          <MessageArea
            conversationId={activeConversation}
            conversationName={activeConvName}
            conversationType={activeConv?.type || "general"}
            onOpenGroupSettings={() => setShowGroupSettings(true)}
          />
        </div>

        <NewDirectChatDialog
          open={showNewDirect}
          onClose={() => setShowNewDirect(false)}
          onCreated={(id) => { setActiveConversation(id); fetchConversations(); }}
          existingDirects={existingDirects}
        />

        <NewGroupDialog
          open={showNewGroup}
          onClose={() => setShowNewGroup(false)}
          onCreated={(id) => { setActiveConversation(id); fetchConversations(); }}
        />

        {activeConv && activeConv.type === "group" && (
          <GroupSettingsDialog
            open={showGroupSettings}
            onClose={() => setShowGroupSettings(false)}
            conversationId={activeConv.id}
            conversationName={activeConvName}
            conversationAvatar={activeConv.avatar_url}
            isGroupAdmin={!!isGroupAdmin}
          />
        )}
      </div>
    </ERPLayout>
  );
};

export default TeamChat;
