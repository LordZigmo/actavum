"use client";

import { type Dispatch } from "react";
import { ArrowDown, FileBarChart, Sparkles } from "lucide-react";
import type { Action, Entity, Relationship, WorkspaceState } from "@/lib/types";
import { ConfidenceBadge, EntityChip, SectionLabel } from "./ui";

interface RelationshipInspectorProps {
  rel: Relationship;
  state: WorkspaceState;
  dispatch: Dispatch<Action>;
}

const CATEGORY_META: Record<
  Relationship["category"],
  { label: string; color: string }
> = {
  relationship: { label: "Confirmed link", color: "var(--color-conf-high)" },
  evidence: { label: "Evidence reference", color: "var(--color-entity-document)" },
  probable: { label: "Probable · unconfirmed", color: "var(--color-conf-low)" },
};

export function RelationshipInspector({ rel, state, dispatch }: RelationshipInspectorProps) {
  const source = state.entities.find((e) => e.id === rel.sourceId);
  const target = state.entities.find((e) => e.id === rel.targetId);
  const evidence = rel.evidenceIds
    .map((id) => state.entities.find((e) => e.id === id))
    .filter((e): e is Entity => Boolean(e));
  const cat = CATEGORY_META[rel.category];

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
          style={{
            color: cat.color,
            borderColor: `color-mix(in oklch, ${cat.color} 36%, transparent)`,
            background: `color-mix(in oklch, ${cat.color} 12%, transparent)`,
          }}
        >
          {rel.category === "probable" && <Sparkles size={11} />}
          {cat.label}
        </span>
        <h2 className="mt-2.5 text-[18px] font-semibold capitalize leading-tight text-white">
          “{rel.label}”
        </h2>
        <p className="mt-0.5 text-[12px] text-ink-500">Relationship</p>
      </div>

      {/* endpoints */}
      <div>
        <SectionLabel className="mb-2">Source → Target</SectionLabel>
        <div className="flex flex-col gap-1.5">
          {source && (
            <EntityChip
              entity={source}
              onClick={() => dispatch({ type: "SELECT_ENTITY", id: source.id })}
            />
          )}
          <div className="flex items-center gap-2 pl-3 text-ink-600">
            <ArrowDown size={14} />
            <span className="text-[11px] capitalize">{rel.label}</span>
          </div>
          {target && (
            <EntityChip
              entity={target}
              onClick={() => dispatch({ type: "SELECT_ENTITY", id: target.id })}
            />
          )}
        </div>
      </div>

      {/* confidence */}
      <div>
        <SectionLabel className="mb-2">Confidence</SectionLabel>
        <ConfidenceBadge confidence={rel.confidence} />
      </div>

      {/* date range */}
      {rel.dateRange && (
        <div>
          <SectionLabel className="mb-1">Date range</SectionLabel>
          <p className="font-mono text-[12.5px] text-ink-400">
            {rel.dateRange.start}
            {rel.dateRange.end ? ` → ${rel.dateRange.end}` : " → present"}
          </p>
        </div>
      )}

      {/* supporting evidence */}
      {evidence.length > 0 && (
        <div>
          <SectionLabel className="mb-2">Supporting evidence · {evidence.length}</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {evidence.map((doc) => (
              <EntityChip
                key={doc.id}
                entity={doc}
                sub={doc.subtitle ?? "Document"}
                onClick={() => dispatch({ type: "SELECT_ENTITY", id: doc.id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* notes */}
      {rel.notes && (
        <div>
          <SectionLabel className="mb-2">Notes</SectionLabel>
          <p className="rounded-lg border border-ink-800 bg-ink-950/60 p-2.5 text-[12.5px] leading-relaxed text-ink-400">
            {rel.notes}
          </p>
        </div>
      )}

      {/* action */}
      <div className="border-t border-ink-800 pt-4">
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "PUSH_TOAST",
              message: `Relationship finding “${rel.label}” pinned to the report draft.`,
              variant: "success",
            })
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-700/70 bg-ink-900/50 px-3 py-2 text-[13px] font-medium text-ink-400 transition-colors hover:border-ink-600 hover:text-white"
        >
          <FileBarChart size={15} />
          Pin finding to report
        </button>
      </div>
    </div>
  );
}
