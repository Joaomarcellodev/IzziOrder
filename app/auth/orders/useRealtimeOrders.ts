import { useEffect, useState, useCallback, useRef } from "react";
import { OrderDTO } from "@/app/auth/orders/types";

export function useRealtimeOrders(initialOrders: OrderDTO[]) {
  const [orders, setOrders] = useState<OrderDTO[]>(initialOrders);
  const [newOrderAlert, setNewOrderAlert] = useState<OrderDTO | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Não foi possível reproduzir o áudio:", err);
      });
    }
  }, []);

  const updateOrders = useCallback(
    (newOrders: OrderDTO[]) => {
      setOrders((prevOrders) => {
        const existingIds = new Set(prevOrders.map((o) => o.id));
        const newPendingOrders = newOrders.filter(
          (o) => o.status === "PENDING" && !existingIds.has(o.id),
        );

        if (newPendingOrders.length > 0) {
          playNotificationSound();
          setNewOrderAlert(newPendingOrders[0]);

          setTimeout(() => setNewOrderAlert(null), 5000);
        }

        return newOrders;
      });
    },
    [playNotificationSound],
  );

  return {
    orders,
    setOrders: updateOrders,
    newOrderAlert,
    clearAlert: () => setNewOrderAlert(null),
  };
}
