"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCount } from "@/lib/notifications/actions";

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread", userId],
    queryFn: () => getUnreadCount(),
    enabled: !!userId,
    refetchInterval: realtimeConnected ? false : 30000,
  });

  const incrementCount = useCallback(() => {
    queryClient.setQueryData(
      ["notifications", "unread", userId],
      (old: number | undefined) => (old ?? 0) + 1
    );
  }, [queryClient, userId]);

  const decrementCount = useCallback(() => {
    queryClient.setQueryData(
      ["notifications", "unread", userId],
      (old: number | undefined) => Math.max(0, (old ?? 0) - 1)
    );
  }, [queryClient, userId]);

  const resetCount = useCallback(() => {
    queryClient.setQueryData(["notifications", "unread", userId], 0);
  }, [queryClient, userId]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channelName = `notifications:${userId}:${Date.now()}`;

    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        incrementCount();
      }
    );

    channel.subscribe((status) => {
      setRealtimeConnected(status === "SUBSCRIBED");
    });

    return () => {
      try {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      } catch {
        // Channel may not have subscribed yet if component unmounted quickly
      }
    };
  }, [userId, incrementCount]);

  return {
    unreadCount,
    incrementCount,
    decrementCount,
    resetCount,
    realtimeConnected,
  };
}
