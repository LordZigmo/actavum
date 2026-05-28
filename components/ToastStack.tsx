"use client";

import { useEffect, type Dispatch } from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import type { Action, Toast } from "@/lib/types";

function ToastItem({
  toast,
  dispatch,
}: {
  toast: Toast;
  dispatch: Dispatch<Action>;
}) {
  useEffect(() => {
    const id = window.setTimeout(
      () => dispatch({ type: "DISMISS_TOAST", id: toast.id }),
      4200,
    );
    return () => window.clearTimeout(id);
  }, [toast.id, dispatch]);

  const success = toast.variant === "success";
  const color = success ? "var(--color-conf-high)" : "var(--color-accent)";
  const Icon = success ? CheckCircle2 : Info;

  return (
    <div
      className="animate-toast-in flex w-80 items-start gap-3 rounded-xl border border-ink-700/70 bg-ink-900/95 p-3 shadow-2xl backdrop-blur-md"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
      role="status"
    >
      <Icon size={16} style={{ color }} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-[12.5px] leading-snug text-ink-200">{toast.message}</p>
      <button
        type="button"
        onClick={() => dispatch({ type: "DISMISS_TOAST", id: toast.id })}
        className="-mr-0.5 -mt-0.5 shrink-0 text-ink-600 transition-colors hover:text-white"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastStack({
  toasts,
  dispatch,
}: {
  toasts: Toast[];
  dispatch: Dispatch<Action>;
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} dispatch={dispatch} />
        </div>
      ))}
    </div>
  );
}
