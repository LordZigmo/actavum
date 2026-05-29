"use client";

import type { Point, Relationship, Selection } from "@/lib/types";
import { GraphEdge } from "./GraphEdge";

interface EdgeLayerProps {
  /** Already filtered to edges whose endpoints are both visible. */
  edges: Relationship[];
  positions: Record<string, Point>;
  selection: Selection;
  searchActive: boolean;
  matchedIds: Set<string>;
  onSelectEdge: (id: string) => void;
}

export function EdgeLayer({
  edges,
  positions,
  selection,
  searchActive,
  matchedIds,
  onSelectEdge,
}: EdgeLayerProps) {
  const selectedEdgeId = selection.kind === "relationship" ? selection.id : null;
  const selectedEntityId = selection.kind === "entity" ? selection.id : null;

  return (
    <svg
      className="absolute left-0 top-0 overflow-visible"
      width={1}
      height={1}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      {edges.map((rel) => {
        const a = positions[rel.sourceId];
        const b = positions[rel.targetId];
        if (!a || !b) return null;
        const active =
          selectedEntityId !== null &&
          (rel.sourceId === selectedEntityId || rel.targetId === selectedEntityId);
        const dimmed =
          searchActive &&
          !matchedIds.has(rel.sourceId) &&
          !matchedIds.has(rel.targetId);
        return (
          <GraphEdge
            key={rel.id}
            rel={rel}
            a={a}
            b={b}
            selected={selectedEdgeId === rel.id}
            active={active}
            dimmed={dimmed}
            onSelect={onSelectEdge}
          />
        );
      })}
    </svg>
  );
}
