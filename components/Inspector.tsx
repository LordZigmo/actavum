"use client";

import { type Dispatch } from "react";
import { MousePointerClick } from "lucide-react";
import type { Action, WorkspaceState } from "@/lib/types";
import { EntityInspector } from "./EntityInspector";
import { RelationshipInspector } from "./RelationshipInspector";

interface InspectorProps {
  state: WorkspaceState;
  dispatch: Dispatch<Action>;
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl border border-ink-800 bg-ink-900/60 text-ink-600">
        <MousePointerClick size={22} />
      </span>
      <p className="mt-4 text-[13px] font-medium text-ink-400">Nothing selected</p>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
        Click any entity node or relationship on the board to inspect its details,
        evidence, and connections.
      </p>
    </div>
  );
}

export function Inspector({ state, dispatch }: InspectorProps) {
  const { selection } = state;
  const entity =
    selection.kind === "entity"
      ? state.entities.find((e) => e.id === selection.id)
      : undefined;
  const rel =
    selection.kind === "relationship"
      ? state.relationships.find((r) => r.id === selection.id)
      : undefined;

  const kindLabel =
    selection.kind === "entity"
      ? "Entity"
      : selection.kind === "relationship"
        ? "Relationship"
        : "—";

  return (
    <aside className="flex w-[344px] shrink-0 flex-col border-l border-ink-800 bg-ink-900/40">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-ink-800 px-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Inspector
        </span>
        <span className="rounded-md bg-ink-800/70 px-2 py-0.5 text-[10.5px] font-medium text-ink-500">
          {kindLabel}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {entity ? (
          <EntityInspector entity={entity} state={state} dispatch={dispatch} />
        ) : rel ? (
          <RelationshipInspector rel={rel} state={state} dispatch={dispatch} />
        ) : (
          <EmptyState />
        )}
      </div>
    </aside>
  );
}
