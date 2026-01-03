import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  user_id: string;
  is_read: boolean;
  created_at: string;
}

export const useRealtimeNotifications = (userId: string | null) => {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const permissionGranted = useRef(false);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      permissionGranted.current = true;
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      permissionGranted.current = permission === "granted";
      return permission === "granted";
    }

    return false;
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Could not play notification sound:", err);
      });
    }
  }, []);

  // Show desktop notification
  const showDesktopNotification = useCallback((title: string, message: string) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "erp-notification",
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  // Handle new notification
  const handleNewNotification = useCallback(
    (payload: { new: NotificationPayload }) => {
      const notification = payload.new;
      
      // Play sound
      playSound();

      // Show desktop notification
      showDesktopNotification(notification.title, notification.message);

      // Show toast notification
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
      });

      // Invalidate queries to refresh notification list
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    [playSound, showDesktopNotification, queryClient]
  );

  // Set up realtime subscription
  useEffect(() => {
    if (!userId) return;

    // Request permission on mount
    requestPermission();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        handleNewNotification
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, requestPermission, handleNewNotification]);

  return {
    requestPermission,
    permissionGranted: permissionGranted.current,
  };
};
