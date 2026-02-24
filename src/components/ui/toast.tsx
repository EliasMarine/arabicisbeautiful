"use client";

import { useToast, type ToastType } from "@/contexts/toast-context";
import { X, CheckCircle, AlertCircle, Info, Sparkles } from "lucide-react";

const TOAST_STYLES: Record<ToastType, { bg: string; icon: typeof CheckCircle }> = {
  success: { bg: "bg-green-600", icon: CheckCircle },
  error: { bg: "bg-red-600", icon: AlertCircle },
  info: { bg: "bg-[#1a3a5c]", icon: Info },
  xp: { bg: "bg-[var(--gold)]", icon: Sparkles },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 sm:w-80">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            className={`${style.bg} text-white rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 animate-[slideUp_0.3s_ease-out]`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
