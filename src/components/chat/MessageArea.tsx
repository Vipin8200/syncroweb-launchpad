import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Image, File, X, Download, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

interface MessageAreaProps {
  conversationId: string | null;
  conversationName: string;
  conversationType: string;
  onOpenGroupSettings?: () => void;
}

const MessageArea = ({ conversationId, conversationName, conversationType, onOpenGroupSettings }: MessageAreaProps) => {
  const { session, userName, userRole } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!conversationId) return;
    setIsLoading(true);
    fetchMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${session?.user?.id}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("chat-files").upload(filePath, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from("chat-files").getPublicUrl(filePath);
    return { url: publicUrl, name: file.name, type: file.type };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !session?.user?.id || !conversationId) return;

    setIsSending(true);
    setIsUploading(!!selectedFile);
    try {
      let fileData: { url: string; name: string; type: string } | null = null;
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
        if (!fileData) { setIsSending(false); setIsUploading(false); return; }
      }

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        sender_name: userName || "Unknown",
        sender_role: userRole || "unknown",
        message: newMessage.trim() || null,
        file_url: fileData?.url || null,
        file_name: fileData?.name || null,
        file_type: fileData?.type || null,
      });
      if (error) throw error;
      setNewMessage("");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: error.message || "Failed to send message", variant: "destructive" });
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "employee": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "intern": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isOwn = (senderId: string) => session?.user?.id === senderId;
  const isImage = (type: string | null) => type?.startsWith("image/");

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MessageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {conversationType === "general" ? "#" : getInitials(conversationName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold">{conversationName}</h3>
            <p className="text-xs text-muted-foreground capitalize">{conversationType} chat</p>
          </div>
        </div>
        {conversationType === "group" && onOpenGroupSettings && (
          <Button variant="ghost" size="icon" onClick={onOpenGroupSettings}>
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${isOwn(msg.sender_id) ? "flex-row-reverse" : ""}`}>
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(msg.sender_name)}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[70%] ${isOwn(msg.sender_id) ? "items-end" : "items-start"}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isOwn(msg.sender_id) ? "flex-row-reverse" : ""}`}>
                    <span className="text-sm font-medium">{isOwn(msg.sender_id) ? "You" : msg.sender_name}</span>
                    <Badge variant="secondary" className={`text-[10px] capitalize ${getRoleColor(msg.sender_role)}`}>
                      {msg.sender_role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(msg.created_at), "HH:mm")}</span>
                  </div>
                  <div className={`p-3 rounded-lg ${isOwn(msg.sender_id) ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.message && <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>}
                    {msg.file_url && (
                      <div className="mt-2">
                        {isImage(msg.file_type) ? (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                            <img src={msg.file_url} alt={msg.file_name || "image"} className="max-w-[300px] rounded-lg" />
                          </a>
                        ) : (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded ${isOwn(msg.sender_id) ? "bg-primary-foreground/10" : "bg-background"}`}
                          >
                            <File className="w-4 h-4 shrink-0" />
                            <span className="text-sm truncate">{msg.file_name || "File"}</span>
                            <Download className="w-4 h-4 shrink-0 ml-auto" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-border bg-card">
        {selectedFile && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-secondary rounded-lg text-sm">
            <Paperclip className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{selectedFile.name}</span>
            <Button type="button" variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => setSelectedFile(null)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 10 * 1024 * 1024) {
                  toast({ title: "File too large", description: "Max file size is 10MB", variant: "destructive" });
                  return;
                }
                setSelectedFile(file);
              }
              e.target.value = "";
            }}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || (!newMessage.trim() && !selectedFile)}>
            {isUploading ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default MessageArea;
