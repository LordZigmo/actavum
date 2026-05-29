"use client";

import { type Dispatch } from "react";
import { Clock, FileBarChart, FileSearch } from "lucide-react";
import type { Action, Entity, WorkspaceState } from "@/lib/types";
import { ENTITY_CONFIG, entityColor } from "@/lib/entity-config";
import { ConfidenceBadge, EntityChip, RiskMeter, SectionLabel, Tag } from "./ui";
import { cn } from "@/lib/cn";

interface EntityInspectorProps {
  entity: Entity;
  state: WorkspaceState;
  dispatch: Dispatch<Action>;
}

export function EntityInspector({ entity, state, dispatch }: EntityInspectorProps) {
  const Icon = ENTITY_CONFIG[entity.type].icon;
  const color = entityColor(entity.type);
  const isDoc = entity.type === "document";

  const connections = state.relationships
    .filter(
      (r) =>
        (r.category === "relationship" || r.category === "probable") &&
        (r.sourceId === entity.id || r.targetId === entity.id),
    )
    .map((r) => {
      const otherId = r.sourceId === entity.id ? r.targetId : r.sourceId;
      const other = state.entities.find((e) => e.id === otherId);
      return other ? { rel: r, other } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const evidenceIds = new Set(entity.evidenceIds);
  state.entities.forEach((e) => {
    if (e.type === "document" && e.mentions?.includes(entity.id)) evidenceIds.add(e.id);
  });
  const evidence = [...evidenceIds]
    .map((id) => state.entities.find((e) => e.id === id))
    .filter((e): e is Entity => Boolean(e));

  const inReport = state.reportItemIds.includes(entity.id);

  function createTimelineEvent() {
    dispatch({
      type: "ADD_TIMELINE_EVENT",
      event: {
        id: `te-${entity.id}-${Date.now()}`,
        date: "May 28, 2026",
        iso: "2026-05-28",
        title: `Follow-up logged: ${entity.label}`,
        description: `Investigative action recorded against ${entity.label}.`,
        evidenceId: entity.evidenceIds[0] ?? entity.id,
        entityIds: [entity.id],
      },
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div>
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: `color-mix(in oklch, ${color} 20%, transparent)`,
              color,
              boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${color} 34%, transparent)`,
            }}
          >
            <Icon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-semibold leading-tight text-white">
              {entity.label}
            </h2>
            <p className="mt-0.5 text-[12px] text-ink-500">
              {ENTITY_CONFIG[entity.type].label}
              {entity.subtitle ? ` · ${entity.subtitle}` : ""}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <ConfidenceBadge confidence={entity.confidence} />
        </div>
      </div>

      {/* risk */}
      <div className="rounded-xl border border-ink-800 bg-ink-900/50 p-3">
        <SectionLabel className="mb-2">{isDoc ? "Evidentiary weight" : "Risk score"}</SectionLabel>
        <RiskMeter score={entity.riskScore} />
      </div>

      {/* tags */}
      {entity.tags.length > 0 && (
        <div>
          <SectionLabel className="mb-2">Tags</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {entity.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* aliases */}
      {entity.aliases.length > 0 && (
        <div>
          <SectionLabel className="mb-2">Known aliases</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {entity.aliases.map((a) => (
              <span
                key={a}
                className="rounded-md bg-ink-800/60 px-2 py-0.5 font-mono text-[11.5px] text-ink-400"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* connected entities */}
      {connections.length > 0 && (
        <div>
          <SectionLabel className="mb-2">
            Connected entities · {connections.length}
          </SectionLabel>
          <div className="flex flex-col gap-1.5">
            {connections.map(({ rel, other }) => (
              <EntityChip
                key={rel.id}
                entity={other}
                sub={`${rel.label} · ${rel.confidence} confidence`}
                onClick={() => dispatch({ type: "SELECT_ENTITY", id: other.id })}
                right={
                  rel.category === "probable" ? (
                    <span className="rounded bg-conf-low/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-conf-low">
                      Probable
                    </span>
                  ) : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* source evidence */}
      {evidence.length > 0 && (
        <div>
          <SectionLabel className="mb-2">Source evidence · {evidence.length}</SectionLabel>
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
      <div>
        <SectionLabel className="mb-2">Investigator notes</SectionLabel>
        <textarea
          key={entity.id}
          defaultValue={entity.notes}
          rows={4}
          className="w-full resize-none rounded-lg border border-ink-800 bg-ink-950/60 p-2.5 text-[12.5px] leading-relaxed text-ink-400 outline-none transition-colors focus:border-accent/50 focus:text-white focus:ring-2 focus:ring-accent/15"
        />
      </div>

      {/* actions */}
      <div className="flex flex-col gap-2 border-t border-ink-800 pt-4">
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_TO_REPORT", id: entity.id })}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
            inReport
              ? "border border-conf-high/40 bg-conf-high/10 text-conf-high"
              : "bg-accent text-ink-950 shadow-[0_0_18px_-6px_var(--color-accent)] hover:bg-accent-bright",
          )}
        >
          <FileBarChart size={15} />
          {inReport ? "In report draft" : "Add to Report"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={createTimelineEvent}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink-700/70 bg-ink-900/50 px-2.5 py-2 text-[12px] font-medium text-ink-400 transition-colors hover:border-ink-600 hover:text-white"
          >
            <Clock size={14} />
            Timeline event
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "FIND_RELATED_EVIDENCE", id: entity.id })}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink-700/70 bg-ink-900/50 px-2.5 py-2 text-[12px] font-medium text-ink-400 transition-colors hover:border-ink-600 hover:text-white"
          >
            <FileSearch size={14} />
            Find evidence
          </button>
        </div>
      </div>
    </div>
  );
}
