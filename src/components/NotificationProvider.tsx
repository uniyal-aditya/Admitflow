"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";

interface NotificationContextType {
  isSubscribed: boolean;
  swReady: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  unreadCount: number;
  refreshUnread: () => void;
  vapidKey: string;
}

const NotificationContext = createContext<NotificationContextType>({
  isSubscribed: false,
  swReady: false,
  subscribe: async () => false,
  unsubscribe: async () => {},
  unreadCount: 0,
  refreshUnread: () => {},
  vapidKey: "",
});

declare global {
  interface Window {
    __SW_VAPID_KEY__?: string;
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [swReady, setSwReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [vapidKey, setVapidKey] = useState("");
  const swRef = useRef<ServiceWorkerRegistration | null>(null);
  const subRef = useRef<PushSubscription | null>(null);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const setup = async () => {
      const register = async () => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          return null;
        }
        try {
          const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          await navigator.serviceWorker.ready;
          return reg;
        } catch {
          return null;
        }
      };

      const reg = await register();
      if (!reg) { setSwReady(true); return; }

      swRef.current = reg;
      setSwReady(true);

      const sub = await reg.pushManager.getSubscription();
      subRef.current = sub;
      setIsSubscribed(!!sub);

      const stored = sessionStorage.getItem("ahq_vapid_key");
      if (stored) {
        setVapidKey(stored);
      }
    };

    setup();
    refreshUnread();
    const interval = setInterval(refreshUnread, 30000);
    return () => clearInterval(interval);
  }, [refreshUnread]);

  const urlBase64ToUint8Array = (base64: string) => {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(b64);
    return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
  };

  const subscribe = async (): Promise<boolean> => {
    if (!swRef.current) return false;

    try {
      let key = vapidKey;
      if (!key) {
        const res = await fetch("/api/notifications/vapid-key");
        if (!res.ok) return false;
        const data = await res.json();
        key = data.publicKey;
        setVapidKey(key);
        sessionStorage.setItem("ahq_vapid_key", key);
      }

      const sub = await swRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      const subJson = sub.toJSON();
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys!.p256dh,
          auth: subJson.keys!.auth,
        }),
      });

      if (res.ok) {
        subRef.current = sub;
        setIsSubscribed(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const unsubscribe = async () => {
    if (subRef.current) {
      await subRef.current.unsubscribe();
      const endpoint = subRef.current.toJSON().endpoint;
      await fetch("/api/notifications/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      subRef.current = null;
      setIsSubscribed(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ isSubscribed, swReady, subscribe, unsubscribe, unreadCount, refreshUnread, vapidKey }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
