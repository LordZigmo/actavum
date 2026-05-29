"use client";

import type { ReactNode } from "react";
import type { Confidence, Entity } from "@/lib/types";
import {
  CONFIDENCE_CONFIG,
  ENTITY_CONFIG,
  confidenceColor,
  entityColor,
  riskColor,
  riskLabel,
} from "@/lib/entity-config";
import { cn } from "@/lib/cn";

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wider text-ink-600",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const c = confidenceColor(confidence);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        color: c,
        borderColor: `color-mix(in oklch, ${c} 36%, transparent)`,
        background: `color-mix(in oklch, ${c} 12%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c }} />
      {CONFIDENCE_CONFIG[confidence].label}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-ink-700/70 bg-ink-800/60 px-2 py-0.5 text-[11px] font-medium text-ink-400">
      {children}
    </span>
  );
}

export function RiskMeter({ score }: { score: number }) {
  const color = riskColor(score);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[15px] font-bold leading-none" style={{ color }}>
        {score}
      </span>
      <span
        className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
        style={{
          color,
          background: `color-mix(in oklch, ${color} 14%, transparent)`,
        }}
      >
        {riskLabel(score)}
      </span>
    </div>
  );
}

export function EntityChip({
  entity,
  onClick,
  sub,
  right,
}: {
  entity: Entity;
  onClick?: () => void;
  sub?: string;
  right?: ReactNode;
}) {
  const Icon = ENTITY_CONFIG[entity.type].icon;
  const color = entityColor(entity.type);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2.5 rounded-lg border border-ink-800 bg-ink-900/50 px-2.5 py-2 text-left transition-colors hover:border-ink-600 hover:bg-ink-800/60"
    >
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-md"
        style={{
          background: `color-mix(in oklch, ${color} 18%, transparent)`,
          color,
        }}
      >
        <Icon size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-medium text-white">
          {entity.label}
        </span>
        <span className="block truncate text-[10.5px] text-ink-500">
          {sub ?? ENTITY_CONFIG[entity.type].label}
        </span>
      </span>
      {right}
    </button>
  );
}
