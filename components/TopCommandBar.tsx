"use client";

import { FileBarChart, Plus, Search, Sparkles, Upload } from "lucide-react";
import { CASE_META } from "@/lib/case-data";
import { cn } from "@/lib/cn";

interface TopCommandBarProps {
  search: string;
  reportGenerated: boolean;
  onSearch: (value: string) => void;
  onAddEntity: () => void;
  onImport: () => void;
  onAutoLink: () => void;
  onGenerateReport: () => void;
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      {/* legs of the "A" */}
      <path d="M13 4.5 L5 21.5" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      <path d="M13 4.5 L21 21.5" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      {/* crossbar */}
      <path d="M8.3 14.5 L17.7 14.5" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      {/* base nodes */}
      <circle cx="5" cy="21.5" r="2.6" fill="var(--color-ink-950)" stroke="var(--color-accent)" strokeWidth="1.5" />
      <circle cx="21" cy="21.5" r="2.6" fill="var(--color-ink-950)" stroke="var(--color-accent)" strokeWidth="1.5" />
      {/* crossbar junction nodes */}
      <circle cx="8.3" cy="14.5" r="1.5" fill="var(--color-accent)" />
      <circle cx="17.7" cy="14.5" r="1.5" fill="var(--color-accent)" />
      {/* apex node */}
      <circle cx="13" cy="4.5" r="3.1" fill="var(--color-ink-950)" stroke="var(--color-accent-bright)" strokeWidth="1.7" />
    </svg>
  );
}

const ghostBtn =
  "inline-flex items-center gap-1.5 rounded-lg border border-ink-700/70 bg-ink-900/50 px-3 py-1.5 text-[13px] font-medium text-ink-400 transition-colors hover:border-ink-600 hover:text-white";

export function TopCommandBar({
  search,
  reportGenerated,
  onSearch,
  onAddEntity,
  onImport,
  onAutoLink,
  onGenerateReport,
}: TopCommandBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-ink-800 bg-ink-900/70 px-4 backdrop-blur-md">
      {/* brand + case */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="text-[17px] font-semibold tracking-tight text-white">
            Actavum
          </span>
        </div>
        <span className="h-6 w-px bg-ink-800" />
        <div className="flex items-center gap-2 rounded-lg border border-ink-800 bg-ink-950/60 px-2.5 py-1">
          <span className="size-1.5 rounded-full bg-conf-high shadow-[0_0_8px_var(--color-conf-high)]" />
          <span className="max-w-[180px] truncate text-[13px] font-medium text-ink-400">
            {CASE_META.name}
          </span>
          <span className="font-mono text-[11px] text-ink-600">{CASE_META.number}</span>
        </div>
      </div>

      {/* search */}
      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600"
        />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search entities, evidence, relationships…"
          className="w-full rounded-lg border border-ink-800 bg-ink-950/60 py-2 pl-9 pr-3 text-[13px] text-white placeholder:text-ink-600 outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* actions */}
      <div className="ml-auto flex items-center gap-2">
        <button type="button" className={ghostBtn} onClick={onAddEntity}>
          <Plus size={15} />
          <span className="hidden lg:inline">Add Entity</span>
        </button>
        <button type="button" className={ghostBtn} onClick={onImport}>
          <Upload size={15} />
          <span className="hidden lg:inline">Import Evidence</span>
        </button>
        <button
          type="button"
          onClick={onAutoLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-[13px] font-medium text-accent-bright transition-colors hover:bg-accent/20"
        >
          <Sparkles size={15} />
          <span className="hidden lg:inline">Auto-Link</span>
        </button>
        <button
          type="button"
          onClick={onGenerateReport}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-ink-950 transition-colors",
            "bg-accent shadow-[0_0_20px_-6px_var(--color-accent)] hover:bg-accent-bright",
          )}
        >
          <FileBarChart size={15} />
          {reportGenerated ? "Update Report" : "Generate Report"}
        </button>
      </div>
    </header>
  );
}
