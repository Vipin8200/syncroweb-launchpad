import { useState, useEffect } from "react";
import { Plus, Search, MessageCircle, Users, Hash, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export interface Conversation {
  id: string;
  type: "direct" | "group" | "general";
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  approval_status: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  members?: { user_id: string; role: string }[];
  otherUser?: { name: string; avatar_url: string | null; role: string };
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewDirect: () => void;
  onNewGroup: () => void;
  pendingRequests: Conversation[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  userRole: string | null;
}

const ChatSidebar = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewDirect,
  onNewGroup,
  pendingRequests,
  onApprove,
  onReject,
  userRole,
}: ChatSidebarProps) => {
  const [search, setSearch] = useState("");
  const { session } = useAuth();

  const filtered = conversations.filter((c) => {
    const name = c.type === "direct" ? c.otherUser?.name : c.name;
    return (name || "").toLowerCase().includes(search.toLowerCase());
  });

  const generals = filtered.filter((c) => c.type === "general");
  const directs = filtered.filter((c) => c.type === "direct" && c.approval_status === "approved");
  const groups = filtered.filter((c) => c.type === "group" && c.approval_status === "approved");
  const pending = filtered.filter((c) => c.approval_status === "pending" && c.created_by === session?.user?.id);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const ConvItem = ({ conv }: { conv: Conversation }) => {
    const isActive = activeConversation === conv.id;
    const displayName = conv.type === "direct" ? conv.otherUser?.name || "Unknown" : conv.name || "Unnamed";
    const icon = conv.type === "general" ? <Hash className="w-4 h-4" /> : conv.type === "group" ? <Users className="w-4 h-4" /> : null;
    const isPending = conv.approval_status === "pending";

    return (
      <button
        onClick={() => !isPending && onSelectConversation(conv.id)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
          isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
        } ${isPending ? "opacity-60" : ""}`}
      >
        <Avatar className="w-9 h-9 shrink-0">
          {conv.avatar_url || conv.otherUser?.avatar_url ? (
            <AvatarImage src={conv.avatar_url || conv.otherUser?.avatar_url || ""} />
          ) : null}
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {icon || getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">{displayName}</span>
            {conv.lastMessageTime && (
              <span className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {format(new Date(conv.lastMessageTime), "HH:mm")}
              </span>
            )}
          </div>
          {isPending ? (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Clock className="w-3 h-3" />
              Awaiting approval
            </div>
          ) : conv.lastMessage ? (
            <p className={`text-xs truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {conv.lastMessage}
            </p>
          ) : null}
        </div>
        {(conv.unreadCount || 0) > 0 && (
          <Badge className="h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
            {conv.unreadCount}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="w-80 border-r border-border flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chats</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onNewDirect} title="New Private Chat">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNewGroup} title="New Group">
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* General channels */}
          {generals.map((c) => <ConvItem key={c.id} conv={c} />)}
          
          {generals.length > 0 && (directs.length > 0 || groups.length > 0) && (
            <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Direct Messages
            </div>
          )}
          {directs.map((c) => <ConvItem key={c.id} conv={c} />)}

          {groups.length > 0 && (
            <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Groups
            </div>
          )}
          {groups.map((c) => <ConvItem key={c.id} conv={c} />)}

          {pending.length > 0 && (
            <>
              <div className="px-3 py-2 text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                Pending Approval
              </div>
              {pending.map((c) => <ConvItem key={c.id} conv={c} />)}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Pending approval requests for admin/employee */}
      {(userRole === "admin" || userRole === "employee") && pendingRequests.length > 0 && (
        <div className="border-t border-border p-3 space-y-2">
          <p className="text-xs font-semibold text-amber-500 flex items-center gap-1">
            <Lock className="w-3 h-3" /> {pendingRequests.length} pending request(s)
          </p>
          {pendingRequests.slice(0, 3).map((req) => (
            <div key={req.id} className="bg-secondary/50 rounded-lg p-2 space-y-2">
              <p className="text-xs text-foreground truncate">{req.name || "Direct Chat Request"}</p>
              <div className="flex gap-1">
                <Button size="sm" className="h-6 text-xs flex-1" onClick={() => onApprove(req.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" className="h-6 text-xs flex-1" onClick={() => onReject(req.id)}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
