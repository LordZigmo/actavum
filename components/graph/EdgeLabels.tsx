"use client";

import type { Point, Relationship, Selection } from "@/lib/types";
import { midpoint } from "@/lib/geometry";
import { confidenceColor } from "@/lib/entity-config";
import { cn } from "@/lib/cn";

interface EdgeLabelsProps {
  edges: Relationship[];
  positions: Record<string, Point>;
  selection: Selection;
  searchActive: boolean;
  matchedIds: Set<string>;
  onSelectEdge: (id: string) => void;
}

export function EdgeLabels({
  edges,
  positions,
  selection,
  searchActive,
  matchedIds,
  onSelectEdge,
}: EdgeLabelsProps) {
  const selectedEdgeId = selection.kind === "relationship" ? selection.id : null;
  const selectedEntityId = selection.kind === "entity" ? selection.id : null;

  return (
    <>
      {edges.map((rel) => {
        const a = positions[rel.sourceId];
        const b = positions[rel.targetId];
        if (!a || !b) return null;

        const isEvidence = rel.category === "evidence";
        const isSelected = selectedEdgeId === rel.id;
        const incident =
          selectedEntityId !== null &&
          (rel.sourceId === selectedEntityId || rel.targetId === selectedEntityId);

        // Evidence labels are noisy — only reveal them when relevant.
        if (isEvidence && !isSelected && !incident) return null;

        const dimmed =
          searchActive &&
          !matchedIds.has(rel.sourceId) &&
          !matchedIds.has(rel.targetId);

        const mid = midpoint(a, b);
        const dotColor = isEvidence
          ? "var(--color-ink-500)"
          : confidenceColor(rel.confidence);

        return (
          <div
            key={rel.id}
            className="absolute"
            style={{ left: mid.x, top: mid.y, transform: "translate(-50%, -50%)" }}
          >
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelectEdge(rel.id);
              }}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-[3px] text-[10px] font-medium tracking-wide backdrop-blur-sm transition-all duration-150 hover:scale-105",
                isSelected
                  ? "border-accent bg-ink-850 text-white shadow-[0_0_14px_-2px_var(--color-accent)]"
                  : "border-ink-700/80 bg-ink-900/85 text-ink-400 hover:text-white hover:border-ink-600",
                dimmed && "opacity-30",
              )}
              style={{ cursor: "pointer" }}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: dotColor }}
              />
              {rel.label}
            </button>
          </div>
        );
      })}
    </>
  );
}
