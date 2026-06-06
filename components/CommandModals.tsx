"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FileText, Upload, X } from "lucide-react";
import type { EntityType } from "@/lib/types";
import { ENTITY_CONFIG, ENTITY_TYPE_ORDER, entityColor } from "@/lib/entity-config";
import { cn } from "@/lib/cn";

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onPointerDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-ink-700/70 bg-ink-900 shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink-800 p-4">
          <div>
            <h2 className="text-[15px] font-semibold text-white">{title}</h2>
            <p className="mt-0.5 text-[12px] text-ink-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-800 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function AddEntityModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (type: EntityType, label: string) => void;
}) {
  const [type, setType] = useState<EntityType>("person");
  const [label, setLabel] = useState("");
  const types = ENTITY_TYPE_ORDER.filter((t) => t !== "document");

  return (
    <ModalShell
      title="Add entity"
      subtitle="Place a new node on the investigation board."
      onClose={onClose}
    >
      <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
        Entity type
      </label>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {types.map((t) => {
          const Icon = ENTITY_CONFIG[t].icon;
          const color = entityColor(t);
          const active = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-medium transition-colors",
                active
                  ? "border-transparent text-white"
                  : "border-ink-800 text-ink-500 hover:border-ink-600 hover:text-ink-300",
              )}
              style={
                active
                  ? {
                      background: `color-mix(in oklch, ${color} 16%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${color} 50%, transparent)`,
                    }
                  : undefined
              }
            >
              <Icon size={16} style={{ color: active ? color : undefined }} />
              {ENTITY_CONFIG[t].label.split(" ")[0]}
            </button>
          );
        })}
      </div>

      <label className="mt-4 block text-[11px] font-semibold uppercase tracking-wider text-ink-600">
        Name / label
      </label>
      <input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit(type, label)}
        placeholder={`e.g. ${ENTITY_CONFIG[type].label} name`}
        className="mt-2 w-full rounded-lg border border-ink-800 bg-ink-950/60 px-3 py-2 text-[13px] text-white placeholder:text-ink-600 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
      />

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-ink-700/70 px-3.5 py-2 text-[13px] font-medium text-ink-400 transition-colors hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSubmit(type, label)}
          className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-accent-bright"
        >
          Add to board
        </button>
      </div>
    </ModalShell>
  );
}

export function ImportEvidenceModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (label: string) => void;
}) {
  const [label, setLabel] = useState("");
  const samples = ["Surveillance Log 05-28.pdf", "Pharmacy Records.pdf", "Wage Statement.pdf"];

  return (
    <ModalShell
      title="Import evidence"
      subtitle="Add a document to the case and extract a timeline entry."
      onClose={onClose}
    >
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-700 bg-ink-950/50 px-4 py-7 text-center">
        <span className="flex size-10 items-center justify-center rounded-lg bg-ink-800 text-ink-400">
          <Upload size={18} />
        </span>
        <p className="mt-2.5 text-[12.5px] font-medium text-ink-300">
          Drop a file or paste a filename
        </p>
        <p className="text-[11px] text-ink-600">PDF, image, CSV, or public-record export</p>
      </div>

      <input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit(label)}
        placeholder="Evidence file name…"
        className="mt-3 w-full rounded-lg border border-ink-800 bg-ink-950/60 px-3 py-2 text-[13px] text-white placeholder:text-ink-600 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
      />

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-600">
        Recent
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {samples.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setLabel(s)}
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-800 bg-ink-900/60 px-2 py-1 text-[11px] text-ink-400 transition-colors hover:border-ink-600 hover:text-white"
          >
            <FileText size={11} />
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-ink-700/70 px-3.5 py-2 text-[13px] font-medium text-ink-400 transition-colors hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSubmit(label)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-accent-bright"
        >
          <Upload size={14} />
          Import
        </button>
      </div>
    </ModalShell>
  );
}
