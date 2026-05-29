"use client";

import {
  Clock,
  Crosshair,
  FileBarChart,
  FolderOpen,
  Lightbulb,
  Network,
  type LucideIcon,
} from "lucide-react";
import type { SidebarSection } from "@/lib/types";
import { CASE_META } from "@/lib/case-data";
import { cn } from "@/lib/cn";

interface Counts {
  entities: number;
  evidence: number;
  relationships: number;
  timeline: number;
  leads: number;
}

interface SidebarProps {
  activeSection: SidebarSection;
  counts: Counts;
  onSelectSection: (section: SidebarSection) => void;
}

const NAV: {
  id: SidebarSection;
  label: string;
  icon: LucideIcon;
  countKey?: keyof Counts;
}[] = [
  { id: "overview", label: "Case Overview", icon: Crosshair },
  { id: "entities", label: "Entities", icon: Network, countKey: "entities" },
  { id: "evidence", label: "Evidence", icon: FolderOpen, countKey: "evidence" },
  { id: "timeline", label: "Timeline", icon: Clock, countKey: "timeline" },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "leads", label: "Leads", icon: Lightbulb, countKey: "leads" },
];

export function Sidebar({ activeSection, counts, onSelectSection }: SidebarProps) {
  return (
    <nav className="flex w-[224px] shrink-0 flex-col border-r border-ink-800 bg-ink-900/40">
      <p className="px-4 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-wider text-ink-600">
        Case Navigation
      </p>

      <div className="flex flex-col gap-0.5 px-2">
        {NAV.map((item) => {
          const active = activeSection === item.id;
          const Icon = item.icon;
          const count = item.countKey ? counts[item.countKey] : undefined;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-accent/12 text-white"
                  : "text-ink-400 hover:bg-ink-800/60 hover:text-white",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
              )}
              <Icon
                size={16}
                className={active ? "text-accent-bright" : "text-ink-500 group-hover:text-ink-400"}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 font-mono text-[10.5px]",
                    active ? "bg-accent/20 text-accent-bright" : "bg-ink-800 text-ink-500",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* case meta footer */}
      <div className="m-3 rounded-xl border border-ink-800 bg-ink-950/50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-600">
          Lead investigator
        </p>
        <p className="mt-1 text-[13px] font-medium text-white">{CASE_META.investigator}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ink-600">Opened</p>
            <p className="font-mono text-[11.5px] text-ink-400">{CASE_META.opened}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-conf-high/30 bg-conf-high/10 px-2 py-0.5 text-[11px] font-medium text-conf-high">
            <span className="size-1.5 rounded-full bg-conf-high" />
            {CASE_META.status}
          </span>
        </div>
      </div>
    </nav>
  );
}
