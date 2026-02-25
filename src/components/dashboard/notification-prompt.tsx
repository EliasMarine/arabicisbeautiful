"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Only show if browser supports push, not already subscribed, and user hasn't dismissed
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") {
      setSubscribed(true);
      return;
    }
    if (Notification.permission === "denied") return;

    // Check if user dismissed this prompt before
    const dismissed = localStorage.getItem("notificationPromptDismissed");
    if (dismissed) return;

    // Show after a small delay
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  async function handleEnable() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShow(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from env
      const res = await fetch("/api/push/vapid-key");
      if (!res.ok) {
        console.warn("[Push] No VAPID key configured");
        setShow(false);
        return;
      }
      const { publicKey } = await res.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      setSubscribed(true);
      setShow(false);
    } catch (err) {
      console.error("[Push] Subscription failed:", err);
      setShow(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem("notificationPromptDismissed", "true");
    setShow(false);
  }

  if (!show || subscribed) return null;

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--sand)] shadow-sm animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--gold)]/15 flex items-center justify-center flex-shrink-0">
          <Bell size={18} className="text-[var(--gold)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--dark)]">
            Never break your streak!
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Get a daily reminder to keep your learning on track.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--gold)] text-white hover:opacity-90 transition-opacity"
            >
              Enable Reminders
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-[var(--muted)] hover:text-[var(--dark)]">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
