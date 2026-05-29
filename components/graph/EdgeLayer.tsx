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
  /** Live edge being dragged from a node's connect handle. */
  pending: { from: Point; to: Point } | null;
  onSelectEdge: (id: string) => void;
  onEdgeHover: (id: string | null) => void;
}

export function EdgeLayer({
  edges,
  positions,
  selection,
  searchActive,
  matchedIds,
  pending,
  onSelectEdge,
  onEdgeHover,
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
            onHover={onEdgeHover}
          />
        );
      })}

      {pending && (
        <line
          x1={pending.from.x}
          y1={pending.from.y}
          x2={pending.to.x}
          y2={pending.to.y}
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeDasharray="6 6"
          strokeLinecap="round"
          className="animate-dash-flow"
          style={{ pointerEvents: "none" }}
        />
      )}
    </svg>
  );
}
