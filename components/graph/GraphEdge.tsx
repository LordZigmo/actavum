"use client";

import { memo, type PointerEvent as ReactPointerEvent } from "react";
import type { Point, Relationship } from "@/lib/types";
import { bezierPath } from "@/lib/geometry";
import { confidenceColor } from "@/lib/entity-config";

interface GraphEdgeProps {
  rel: Relationship;
  a: Point;
  b: Point;
  selected: boolean;
  /** Incident to the selected node. */
  active: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
}

function strokeFor(rel: Relationship): string {
  if (rel.category === "evidence") return "var(--color-ink-600)";
  if (rel.category === "probable") return "var(--color-conf-low)";
  return confidenceColor(rel.confidence);
}

function GraphEdgeImpl({
  rel,
  a,
  b,
  selected,
  active,
  dimmed,
  onSelect,
}: GraphEdgeProps) {
  const d = bezierPath(a, b);
  const color = strokeFor(rel);
  const isEvidence = rel.category === "evidence";
  const isProbable = rel.category === "probable";

  const baseWidth = isEvidence ? 1.4 : 1.9;
  const width = selected ? baseWidth + 1.6 : active ? baseWidth + 0.8 : baseWidth;
  const opacity = dimmed ? 0.18 : isEvidence ? 0.7 : selected || active ? 1 : 0.92;

  const dash = isProbable ? "7 7" : isEvidence ? "0.5 6" : undefined;

  function handleSelect(e: ReactPointerEvent<SVGPathElement>) {
    e.stopPropagation();
    onSelect(rel.id);
  }

  return (
    <g style={{ opacity }} className="transition-opacity duration-200">
      {/* wide transparent hit path for reliable clicking */}
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        strokeLinecap="round"
        style={{ pointerEvents: "stroke", cursor: "pointer" }}
        onPointerDown={handleSelect}
      />
      {/* visible path */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash}
        className={isProbable ? "animate-dash-flow" : undefined}
        style={{
          pointerEvents: "none",
          filter: selected
            ? `drop-shadow(0 0 6px ${color})`
            : active
              ? `drop-shadow(0 0 3px ${color})`
              : undefined,
          transition: "stroke-width 150ms ease, filter 150ms ease",
        }}
      />
    </g>
  );
}

export const GraphEdge = memo(GraphEdgeImpl);
